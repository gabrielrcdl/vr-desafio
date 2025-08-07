import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  messageId: string;

  @IsNotEmpty({ message: 'Mensagem nao pode ser vazia.' })
  message: string;
}
