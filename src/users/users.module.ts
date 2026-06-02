import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { PublishersModule } from '../publishers/publishers.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PublishersModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, Logger],
})
export class UsersModule {}
