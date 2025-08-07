import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let rabbitMQService: jest.Mocked<RabbitMQService>;

  beforeEach(async () => {
    const rabbitMQServiceMock = {
      init: jest.fn().mockResolvedValue(undefined),
      publishToQueue: jest.fn().mockResolvedValue(undefined),
      consumeFromQueue: jest.fn().mockImplementation((queue, callback) => {
        if (queue === 'fila.notificacao.entrada') {
          setTimeout(
            () => callback({ messageId: 'test-id', message: 'test' }),
            10,
          );
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: RabbitMQService,
          useValue: rabbitMQServiceMock,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    rabbitMQService = module.get(RabbitMQService);
  });

  describe('sendNotification', () => {
    it('should set initial status and publish to RabbitMQ', async () => {
      const testDto = {
        messageId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Test message message',
      };

      await service.sendNotification(testDto);

      expect(service.getStatus(testDto.messageId)).toBe(
        'AGUARDANDO PROCESSAMENTO',
      );

      expect(rabbitMQService.publishToQueue).toHaveBeenCalledWith(
        'fila.notificacao.entrada',
        testDto,
      );
    });
  });

  describe('initConsumer', () => {
    it('should process messages and update status', async () => {
      const testMessage = {
        messageId: 'test-consumer-id',
        message: 'Test consumer message',
      };

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(rabbitMQService.consumeFromQueue).toHaveBeenCalledWith(
        'fila.notificacao.entrada',
        expect.any(Function),
      );

      const status = service.getStatus('test-id');
      expect(['PROCESSADO_SUCESSO', 'FALHA_PROCESSAMENTO']).toContain(status);

      expect(rabbitMQService.publishToQueue).toHaveBeenCalledWith(
        'fila.notificacao.status',
        {
          messageId: 'test-id',
          status: expect.stringMatching(
            /PROCESSADO_SUCESSO|FALHA_PROCESSAMENTO/,
          ),
        },
      );
    });
  });

  describe('getStatus', () => {
    it('should return correct status for message', () => {
      const messageId = 'status-test-id';
      service['statusMap'].set(messageId, 'TEST_STATUS');

      expect(service.getStatus(messageId)).toBe('TEST_STATUS');
    });

    it('should return "NÃO ENCONTRADO" for unknown message', () => {
      expect(service.getStatus('unknown-id')).toBe('NÃO ENCONTRADO');
    });
  });
});
