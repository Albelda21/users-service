import { registerAs } from '@nestjs/config';

export type ExchangeType = 'direct' | 'topic' | 'fanout' | 'headers';

export interface RabbitConnectionConfig {
  host: string;
  port: number;
  login: string;
  password: string;
  heartbeat: number;
  vhost: string;
}

export interface RabbitExchangeConfig {
  name: string;
  options: {
    type: ExchangeType;
    durable: boolean;
    autoDelete: boolean;
  };
}

export interface RabbitConfig {
  connection: RabbitConnectionConfig;
  exchange: RabbitExchangeConfig;
}

function parseBool(v: string | undefined, def: boolean): boolean {
  if (v === undefined) return def;
  return v === 'true';
}

export default registerAs(
  'rabbit',
  (): RabbitConfig => ({
    connection: {
      host: process.env.RABBIT_HOST ?? 'localhost',
      port: Number(process.env.RABBIT_PORT ?? 5672),
      login: process.env.RABBIT_USER ?? 'guest',
      password: process.env.RABBIT_PASSWORD ?? 'guest',
      heartbeat: Number(process.env.RABBIT_HEARTBEAT ?? 60),
      vhost: process.env.RABBIT_VHOST ?? 'integration',
    },
    exchange: {
      name: process.env.RABBIT_EXCHANGE ?? 'users',
      options: {
        type: (process.env.RABBIT_EXCHANGE_TYPE as ExchangeType) ?? 'topic',
        durable: parseBool(process.env.RABBIT_EXCHANGE_DURABLE, true),
        autoDelete: parseBool(process.env.RABBIT_EXCHANGE_AUTODELETE, false),
      },
    },
  }),
);
