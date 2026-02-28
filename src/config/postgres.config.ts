import { registerAs } from '@nestjs/config';

export interface PostgresConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export default registerAs(
  'postgres',
  (): PostgresConfig => ({
    host: process.env.PG_DB_HOST ?? 'localhost',
    port: Number(process.env.PG_DB_PORT ?? 5432),
    username: process.env.PG_DB_USER ?? 'postgres',
    password: process.env.PG_DB_PASSWORD ?? 'postgres',
    database: process.env.PG_DB_NAME ?? 'integration',
  }),
);
