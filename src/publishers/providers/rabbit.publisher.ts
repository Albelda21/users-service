import * as amqp from 'amqplib';
import type { ConfirmChannel, Options } from 'amqplib';
import {
  RabbitConfig,
  RabbitConnectionConfig,
} from '../../config/rabbit.config';

export class RabbitPublisher {
  private constructor(
    private readonly channel: ConfirmChannel,
    private readonly exchangeName: string,
  ) {}

  static async create(config: RabbitConfig): Promise<RabbitPublisher> {
    const url = RabbitPublisher.buildAmqpUrl(config.connection);

    const connection = await amqp.connect(url, {
      heartbeat: config.connection.heartbeat,
    });

    const channel = await connection.createConfirmChannel();

    await channel.assertExchange(
      config.exchange.name,
      config.exchange.options.type,
      {
        durable: config.exchange.options.durable ?? true,
        autoDelete: config.exchange.options.autoDelete ?? false,
      },
    );

    return new RabbitPublisher(channel, config.exchange.name);
  }

  async publish<T extends object>(
    routingKey: string,
    message: T,
    options?: Options.Publish,
  ): Promise<void> {
    const body = Buffer.from(JSON.stringify(message));

    await this.publishConfirm(this.exchangeName, routingKey, body, {
      contentType: 'application/json',
      deliveryMode: 2,
      ...options,
    });
  }

  private async publishConfirm(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options: Options.Publish,
  ): Promise<void> {
    const isMsgPublished = this.channel.publish(
      exchange,
      routingKey,
      content,
      options,
    );

    if (!isMsgPublished) {
      console.log(
        `Write buffer full for message to exchange:[${exchange}] with routing key:[${routingKey}]. Waiting for drain event.`,
      );
      await new Promise<void>((resolve) => this.channel.once('drain', resolve));
    }
  }

  private static buildAmqpUrl(config: RabbitConnectionConfig): string {
    const { login, password, host, port } = config;

    const user = encodeURIComponent(login);
    const pass = encodeURIComponent(password);

    const vhost = config.vhost ? `/${encodeURIComponent(config.vhost)}` : '/';

    return `amqp://${user}:${pass}@${host}:${port}${vhost}`;
  }
}
