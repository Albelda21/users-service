import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitPublisher } from './providers/rabbit.publisher';
import { RabbitConfig } from '../config/rabbit.config';

@Module({
  providers: [
    {
      provide: RabbitPublisher,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const rabbit = config.getOrThrow<RabbitConfig>('rabbit');
        return RabbitPublisher.create(rabbit);
      },
    },
  ],
  exports: [RabbitPublisher],
})
export class PublishersModule {}
