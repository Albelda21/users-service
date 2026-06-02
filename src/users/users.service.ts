import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { RabbitPublisher } from '../publishers/providers/rabbit.publisher';
import { User } from './entities/user.entity';

const USER_CREATED_ROUTING_KEY = 'user.created';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly publisher: RabbitPublisher,
    private readonly logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.usersRepository.create(createUserDto.username);

      if (!user) {
        throw new HttpException('User already exists', HttpStatus.NOT_FOUND);
      }

      await this.publisher.publish(USER_CREATED_ROUTING_KEY, user);
      this.logger.debug('User created successfully.', user);
      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
