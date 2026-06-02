import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from '../../../src/users/users.repository';
import { User } from '../../../src/users/entities/user.entity';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'uuid-1',
    username: 'testuser',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    repository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await usersRepository.create('testuser');

      expect(repository.create).toHaveBeenCalledWith({ username: 'testuser' });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should propagate error when save fails', async () => {
      const error = new Error('DB error');
      repository.create.mockReturnValue(mockUser);
      repository.save.mockRejectedValue(error);

      await expect(usersRepository.create('testuser')).rejects.toThrow('DB error');
    });
  });
});
