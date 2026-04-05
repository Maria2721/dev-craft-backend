/**
 * Unit tests for OAuthAccountLinkingService
 */

import { ConflictException, NotFoundException } from '@nestjs/common';
import { OAuthProvider, User } from '@prisma/client';

import { OAuthAccountLinkingService } from '../../../../../src/application/auth/oauth/oauth-account-linking.service';
import { OAuthRepository } from '../../../../../src/domain/repositories/oauth.repository';
import { UserRepository } from '../../../../../src/domain/repositories/user.repository';

describe('OAuthAccountLinkingService', () => {
  const baseUser: User = {
    id: 1,
    email: 'a@b.com',
    passwordHash: null,
    name: 'A',
    surname: 'B',
    createdAt: new Date(),
  };

  let userRepository: jest.Mocked<UserRepository>;
  let oauthRepository: jest.Mocked<OAuthRepository>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    oauthRepository = {
      saveState: jest.fn(),
      consumeState: jest.fn(),
      saveExchangeCode: jest.fn(),
      consumeExchangeCode: jest.fn(),
      findAccount: jest.fn(),
      findAccountForUser: jest.fn(),
      createAccount: jest.fn(),
      createUserWithProviderAccount: jest.fn(),
    } as unknown as jest.Mocked<OAuthRepository>;
  });

  it('returns existing user when account is already linked', async () => {
    oauthRepository.findAccount.mockResolvedValue({ userId: baseUser.id });
    userRepository.findById.mockResolvedValue(baseUser);

    const svc = new OAuthAccountLinkingService(userRepository, oauthRepository);
    const user = await svc.provisionUser({
      provider: OAuthProvider.GOOGLE,
      providerAccountId: 'sub-1',
      email: baseUser.email,
      name: 'A',
      surname: 'B',
    });

    expect(user).toBe(baseUser);
    expect(oauthRepository.findAccount).toHaveBeenCalledWith(OAuthProvider.GOOGLE, 'sub-1');
    expect(userRepository.findById).toHaveBeenCalledWith(baseUser.id);
  });

  it('throws NotFoundException when link exists but user row is missing', async () => {
    oauthRepository.findAccount.mockResolvedValue({ userId: 999 });
    userRepository.findById.mockResolvedValue(null);

    const svc = new OAuthAccountLinkingService(userRepository, oauthRepository);

    await expect(
      svc.provisionUser({
        provider: OAuthProvider.GOOGLE,
        providerAccountId: 'sub',
        email: 'x@y.com',
        name: 'A',
        surname: 'B',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ConflictException when email exists and another account is linked for same provider', async () => {
    oauthRepository.findAccount.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(baseUser);
    oauthRepository.findAccountForUser.mockResolvedValue({
      providerAccountId: 'other-sub',
    });

    const svc = new OAuthAccountLinkingService(userRepository, oauthRepository);

    await expect(
      svc.provisionUser({
        provider: OAuthProvider.GITHUB,
        providerAccountId: 'new-sub',
        email: baseUser.email,
        name: 'A',
        surname: 'B',
      }),
    ).rejects.toThrow(ConflictException);
    expect(oauthRepository.createAccount).not.toHaveBeenCalled();
  });

  it('links new provider account to existing user by email when none linked yet', async () => {
    oauthRepository.findAccount.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(baseUser);
    oauthRepository.findAccountForUser.mockResolvedValue(null);

    const svc = new OAuthAccountLinkingService(userRepository, oauthRepository);
    const user = await svc.provisionUser({
      provider: OAuthProvider.GOOGLE,
      providerAccountId: 'google-sub',
      email: baseUser.email,
      name: 'A',
      surname: 'B',
    });

    expect(user).toBe(baseUser);
    expect(oauthRepository.createAccount).toHaveBeenCalledWith(
      baseUser.id,
      OAuthProvider.GOOGLE,
      'google-sub',
    );
  });

  it('returns existing user when email matches and same provider account already linked', async () => {
    oauthRepository.findAccount.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(baseUser);
    oauthRepository.findAccountForUser.mockResolvedValue({
      providerAccountId: 'same-sub',
    });

    const svc = new OAuthAccountLinkingService(userRepository, oauthRepository);
    const user = await svc.provisionUser({
      provider: OAuthProvider.GOOGLE,
      providerAccountId: 'same-sub',
      email: baseUser.email,
      name: 'A',
      surname: 'B',
    });

    expect(user).toBe(baseUser);
    expect(oauthRepository.createAccount).not.toHaveBeenCalled();
  });

  it('creates new user with provider when email is unknown', async () => {
    oauthRepository.findAccount.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    oauthRepository.createUserWithProviderAccount.mockResolvedValue(baseUser);

    const svc = new OAuthAccountLinkingService(userRepository, oauthRepository);
    const user = await svc.provisionUser({
      provider: OAuthProvider.GOOGLE,
      providerAccountId: 'new',
      email: 'new@mail.com',
      name: 'N',
      surname: 'M',
    });

    expect(user).toBe(baseUser);
    expect(oauthRepository.createUserWithProviderAccount).toHaveBeenCalledWith({
      email: 'new@mail.com',
      name: 'N',
      surname: 'M',
      provider: OAuthProvider.GOOGLE,
      providerAccountId: 'new',
    });
  });
});
