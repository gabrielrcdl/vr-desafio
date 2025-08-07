import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private statusMap = new Map<string, string>();

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    try {
      await this.rabbitMQService.init();
      await this.initConsumer();
    } catch (error) {
      this.logger.error(
        'Erro ao inicializar módulo NotificationService',
        error,
      );
    }
  }

  async sendNotification(dto: CreateNotificationDto) {
    try {
      this.statusMap.set(dto.messageId, 'AGUARDANDO PROCESSAMENTO');
      await this.rabbitMQService.publishToQueue(
        'fila.notificacao.entrada',
        dto,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação para a fila: ${dto.messageId}`,
        error,
      );
      this.statusMap.set(dto.messageId, 'FALHA_ENVIO');
    }
  }

  getStatus(id: string): string {
    return this.statusMap.get(id) || 'NÃO ENCONTRADO';
  }

  private async initConsumer() {
    try {
      await this.rabbitMQService.consumeFromQueue(
        'fila.notificacao.entrada',
        async (msg) => {
          try {
            await new Promise((r) =>
              setTimeout(r, 1000 + Math.random() * 1000),
            );

            const status =
              Math.random() <= 0.2
                ? 'FALHA_PROCESSAMENTO'
                : 'PROCESSADO_SUCESSO';
            this.statusMap.set(msg.messageId, status);

            await this.rabbitMQService.publishToQueue(
              'fila.notificacao.status',
              {
                messageId: msg.messageId,
                status,
              },
            );
          } catch (error) {
            this.logger.error(
              `Erro ao processar mensagem da fila: ${JSON.stringify(msg)}`,
              error,
            );
            this.statusMap.set(msg.messageId, 'ERRO_PROCESSAMENTO');
          }
        },
      );
    } catch (error) {
      this.logger.error('Erro ao iniciar o consumidor da fila', error);
    }
  }
}
