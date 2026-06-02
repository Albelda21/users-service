import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { UsersService } from '../../../src/users/users.service';
import { UsersRepository } from '../../../src/users/users.repository';
import { RabbitPublisher } from '../../../src/publishers/providers/rabbit.publisher';
import { User } from '../../../src/users/entities/user.entity';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let publisher: jest.Mocked<RabbitPublisher>;
  let logger: jest.Mocked<Logger>;

  const mockUser: User = {
    id: 'uuid-1',
    username: 'testuser',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: { create: jest.fn() },
        },
        {
          provide: RabbitPublisher,
          useValue: { publish: jest.fn() },
        },
        {
          provide: Logger,
          useValue: { debug: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
    publisher = module.get(RabbitPublisher);
    logger = module.get(Logger);
  });

  describe('create', () => {
    const dto: CreateUserDto = { username: 'testuser' };

    it('should create user, publish event, log and return user', async () => {
      usersRepository.create.mockResolvedValue(mockUser);
      publisher.publish.mockResolvedValue();

      const result = await service.create(dto);

      expect(usersRepository.create).toHaveBeenCalledWith('testuser');
      expect(publisher.publish).toHaveBeenCalledWith('user.created', mockUser);
      expect(logger.debug).toHaveBeenCalledWith('User created successfully.', mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should log error and rethrow when repository throws', async () => {
      const error = new Error('DB error');
      usersRepository.create.mockRejectedValue(error);

      await expect(service.create(dto)).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(publisher.publish).not.toHaveBeenCalled();
    });

    it('should log error and rethrow when publisher throws', async () => {
      const error = new Error('Rabbit error');
      usersRepository.create.mockResolvedValue(mockUser);
      publisher.publish.mockRejectedValue(error);

      await expect(service.create(dto)).rejects.toThrow('Rabbit error');
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });
});
