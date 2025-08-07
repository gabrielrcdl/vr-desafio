import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Module({
  imports: [],
  controllers: [NotificationController],
  providers: [NotificationService, RabbitMQService],
  exports: [NotificationService],
})
export class NotificationModule {}
