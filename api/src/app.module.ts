import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
