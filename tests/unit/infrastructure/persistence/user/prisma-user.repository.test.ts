/**
 * Unit tests for PrismaUserRepository
 */

import { User } from '@prisma/client';

import { PrismaUserRepository } from '../../../../../src/infrastructure/persistence/user/prisma-user.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaUserRepository', () => {
  const mockUser: User = {
    id: 1,
    email: 'a@b.com',
    passwordHash: 'h',
    name: 'N',
    surname: 'S',
    createdAt: new Date(),
  };

  it('delegates findByEmail to prisma', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaUserRepository(prisma);
    const result = await repo.findByEmail('a@b.com');

    expect(result).toBe(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
  });

  it('delegates findById to prisma', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaUserRepository(prisma);
    await repo.findById(1);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('create passes passwordHash or null', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue(mockUser),
      },
    } as unknown as PrismaService;

    const repo = new PrismaUserRepository(prisma);
    await repo.create({
      email: 'x@y.com',
      name: 'A',
      surname: 'B',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'x@y.com',
        name: 'A',
        surname: 'B',
        passwordHash: null,
      },
    });
  });
});
