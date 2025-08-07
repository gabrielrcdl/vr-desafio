import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private channel: amqp.Channel;
  private isInitialized = false;
  private readonly connectionCredentials =
    'amqp://bjnuffmq:gj-YQIiEXyfxQxjsZtiYDKeXIT8ppUq7@jaragua-01.lmq.cloudamqp.com/bjnuffmq';

  async init() {
    if (this.isInitialized) return;

    try {
      const connection = await amqp.connect(this.connectionCredentials);

      this.channel = await connection.createChannel();

      await Promise.all([
        this.channel.assertQueue('fila.notificacao.entrada'),
        this.channel.assertQueue('fila.notificacao.status'),
      ]);

      this.isInitialized = true;
      this.logger.log('Conexão com RabbitMQ estabelecida e filas verificadas.');
    } catch (error) {
      this.logger.error('Erro ao conectar com o RabbitMQ:', error.message);
      throw new Error(
        'Não foi possível conectar ao servidor de mensagens RabbitMQ.',
      );
    }
  }

  publishToQueue(queue: string, message: any) {
    if (!this.channel) {
      const mensagemErro = 'Canal do RabbitMQ não foi inicializado.';
      this.logger.error(mensagemErro);
      throw new Error(mensagemErro);
    }

    try {
      const payload = Buffer.from(JSON.stringify(message));
      this.channel.sendToQueue(queue, payload);
      this.logger.log(`Mensagem publicada com sucesso na fila "${queue}".`);
    } catch (error) {
      this.logger.error(
        `Erro ao publicar mensagem na fila "${queue}":`,
        error.message,
      );
      throw new Error(`Erro ao publicar na fila "${queue}".`);
    }
  }

  async consumeFromQueue(queue: string, onMessage: (msg: any) => void) {
    if (!this.channel) {
      const mensagemErro = 'Canal do RabbitMQ não foi inicializado.';
      this.logger.error(mensagemErro);
      throw new Error(mensagemErro);
    }

    try {
      await this.channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
          const conteudo = JSON.parse(msg.content.toString());
          await onMessage(conteudo);
          this.channel.ack(msg);
          this.logger.log(
            `Mensagem processada com sucesso da fila "${queue}".`,
          );
        } catch (erroProcessamento) {
          this.logger.error(
            `Erro ao processar mensagem da fila "${queue}":`,
            erroProcessamento.message,
          );
          this.channel.nack(msg, false, false);
        }
      });
    } catch (erroConsumo) {
      this.logger.error(
        `Erro ao iniciar consumo da fila "${queue}":`,
        erroConsumo.message,
      );
      throw new Error(`Erro ao iniciar o consumo da fila "${queue}".`);
    }
  }
}
