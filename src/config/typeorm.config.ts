import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConfig } from './postgres.config';

const PROVIDER = 'postgres';

export function buildPostgresConfig(
  config: ConfigService,
): TypeOrmModuleOptions {
  const pg: PostgresConfig = config.getOrThrow(PROVIDER);

  return {
    type: PROVIDER,
    ...pg,
    autoLoadEntities: true,
    synchronize: true,
  };
}
