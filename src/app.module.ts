import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { buildPostgresConfig } from './config/typeorm.config';
import rabbitConfig from './config/rabbit.config';
import postgresConfig from './config/postgres.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [rabbitConfig, postgresConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildPostgresConfig,
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
