/**
 * Unit tests for PrismaOAuthRepository
 */

import { OAuthProvider } from '@prisma/client';

import { PrismaOAuthRepository } from '../../../../../src/infrastructure/persistence/oauth/prisma-oauth.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaOAuthRepository', () => {
  const mockUser = {
    id: 1,
    email: 'a@b.com',
    passwordHash: null,
    name: 'N',
    surname: 'S',
    createdAt: new Date(),
  };

  function makeRepo(prisma: Record<string, unknown>) {
    return new PrismaOAuthRepository(prisma as unknown as PrismaService);
  }

  it('saveState creates row', async () => {
    const oAuthState = { create: jest.fn().mockResolvedValue(undefined) };
    const repo = makeRepo({ oAuthState });

    await repo.saveState('st', OAuthProvider.GOOGLE, new Date());

    expect(oAuthState.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        state: 'st',
        provider: OAuthProvider.GOOGLE,
      }),
    });
  });

  it('consumeState returns null when missing', async () => {
    const oAuthState = {
      findUnique: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };
    const repo = makeRepo({ oAuthState });

    await expect(repo.consumeState('x')).resolves.toBeNull();
    expect(oAuthState.delete).not.toHaveBeenCalled();
  });

  it('consumeState deletes expired row and returns null', async () => {
    const past = new Date(Date.now() - 60_000);
    const row = { id: 'r1', provider: OAuthProvider.GOOGLE, expiresAt: past };
    const oAuthState = {
      findUnique: jest.fn().mockResolvedValue(row),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const repo = makeRepo({ oAuthState });

    await expect(repo.consumeState('st')).resolves.toBeNull();
    expect(oAuthState.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
  });

  it('consumeState deletes and returns provider when valid', async () => {
    const future = new Date(Date.now() + 60_000);
    const row = { id: 'r1', provider: OAuthProvider.GITHUB, expiresAt: future };
    const oAuthState = {
      findUnique: jest.fn().mockResolvedValue(row),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const repo = makeRepo({ oAuthState });

    await expect(repo.consumeState('st')).resolves.toBe(OAuthProvider.GITHUB);
  });

  it('consumeExchangeCode returns userId when valid', async () => {
    const future = new Date(Date.now() + 60_000);
    const row = { id: 'e1', userId: 9, expiresAt: future };
    const oAuthExchangeCode = {
      findUnique: jest.fn().mockResolvedValue(row),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const repo = makeRepo({ oAuthExchangeCode });

    await expect(repo.consumeExchangeCode('code')).resolves.toBe(9);
  });

  it('findAccount returns userId mapping', async () => {
    const oAuthAccount = {
      findUnique: jest.fn().mockResolvedValue({ userId: 3 }),
    };
    const repo = makeRepo({ oAuthAccount });

    await expect(repo.findAccount(OAuthProvider.GOOGLE, 'sub')).resolves.toEqual({ userId: 3 });
  });

  it('createUserWithProviderAccount runs transaction', async () => {
    const tx = {
      user: {
        create: jest.fn().mockResolvedValue(mockUser),
      },
      oAuthAccount: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };
    const prisma: Record<string, unknown> = {
      $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const repo = makeRepo(prisma);
    const user = await repo.createUserWithProviderAccount({
      email: 'a@b.com',
      name: 'N',
      surname: 'S',
      provider: OAuthProvider.GOOGLE,
      providerAccountId: 'sub',
    });

    expect(user).toBe(mockUser);
    expect(tx.user.create).toHaveBeenCalled();
    expect(tx.oAuthAccount.create).toHaveBeenCalled();
  });
});
