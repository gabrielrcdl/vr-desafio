import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';

import type { Response } from 'express';
import { CreateNotificationDto } from './dto/notification.dto';

@Controller('api/notificar')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async notify(@Body() dto: CreateNotificationDto, @Res() res: Response) {
    await this.notificationService.sendNotification(dto);
    return res.status(202).json({
      messageId: dto.messageId,
      status: 'AGUARDANDO PROCESSAMENTO',
    });
  }

  @Get('status/:id')
  getStatus(@Param('id') id: string) {
    const status = this.notificationService.getStatus(id);
    return { mensagemId: id, status };
  }
}
