/**
 * Unit tests for UserRepository (Domain contract)
 */

import { User } from '@prisma/client';

import { UserRepository } from '../../../../src/domain/repositories/user.repository';

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  passwordHash: 'hash',
  name: 'Name',
  surname: 'Surname',
  createdAt: new Date(),
};

class MockUserRepository extends UserRepository {
  async findByEmail(): Promise<User | null> {
    return mockUser;
  }
  async findById(): Promise<User | null> {
    return mockUser;
  }
  async create(): Promise<User> {
    return mockUser;
  }
}

describe('UserRepository (Domain contract)', () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new MockUserRepository();
  });

  it('findByEmail returns User or null', async () => {
    const result = await repo.findByEmail('test@example.com');
    expect(result).toEqual(mockUser);
  });

  it('create accepts payload and returns User', async () => {
    const result = await repo.create({
      email: 'new@example.com',
      passwordHash: 'hash',
      name: 'Name',
      surname: 'Surname',
    });
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('createdAt');
  });
});
