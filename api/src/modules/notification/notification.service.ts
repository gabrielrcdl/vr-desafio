import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService implements OnModuleInit {
  private statusMap = new Map<string, string>();

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    await this.rabbitMQService.init();
    await this.initConsumer();
  }

  async sendNotification(dto: CreateNotificationDto) {
    this.statusMap.set(dto.messageId, 'AGUARDANDO PROCESSAMENTO');
    await this.rabbitMQService.publishToQueue('fila.notificacao.entrada', dto);
  }

  getStatus(id: string): string {
    return this.statusMap.get(id) || 'NÃO ENCONTRADO';
  }

  private async initConsumer() {
    await this.rabbitMQService.consumeFromQueue(
      'fila.notificacao.entrada',
      async (msg) => {
        await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

        const status =
          Math.random() <= 0.2 ? 'FALHA_PROCESSAMENTO' : 'PROCESSADO_SUCESSO';
        this.statusMap.set(msg.messageId, status);

        await this.rabbitMQService.publishToQueue('fila.notificacao.status', {
          messageId: msg.messageId,
          status,
        });
      },
    );
  }
}
