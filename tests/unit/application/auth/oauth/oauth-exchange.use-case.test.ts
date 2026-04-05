/**
 * Unit tests for OAuthExchangeUseCase
 */

import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';

import { OAuthExchangeUseCase } from '../../../../../src/application/auth/oauth/oauth-exchange.use-case';
import { OAuthRepository } from '../../../../../src/domain/repositories/oauth.repository';
import { UserRepository } from '../../../../../src/domain/repositories/user.repository';
import { TokenService } from '../../../../../src/domain/services/token.service';

describe('OAuthExchangeUseCase', () => {
  const mockUser: User = {
    id: 3,
    email: 'x@y.com',
    passwordHash: null,
    name: 'X',
    surname: 'Y',
    createdAt: new Date(),
  };

  let oauthRepository: jest.Mocked<OAuthRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    oauthRepository = {
      consumeExchangeCode: jest.fn(),
      saveState: jest.fn(),
      consumeState: jest.fn(),
      saveExchangeCode: jest.fn(),
      findAccount: jest.fn(),
      findAccountForUser: jest.fn(),
      createAccount: jest.fn(),
      createUserWithProviderAccount: jest.fn(),
    } as unknown as jest.Mocked<OAuthRepository>;

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        accessToken: 'acc',
        refreshToken: 'ref',
        expiresIn: 60,
      }),
    } as unknown as jest.Mocked<TokenService>;
  });

  it('throws when exchange code is invalid', async () => {
    oauthRepository.consumeExchangeCode.mockResolvedValue(null);

    const useCase = new OAuthExchangeUseCase(oauthRepository, userRepository, tokenService);

    await expect(useCase.execute('bad')).rejects.toThrow(UnauthorizedException);
    await expect(useCase.execute('bad')).rejects.toThrow('Invalid or expired exchange code');
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it('throws when user id from code does not exist', async () => {
    oauthRepository.consumeExchangeCode.mockResolvedValue(mockUser.id);
    userRepository.findById.mockResolvedValue(null);

    const useCase = new OAuthExchangeUseCase(oauthRepository, userRepository, tokenService);

    await expect(useCase.execute('ok')).rejects.toThrow(UnauthorizedException);
    await expect(useCase.execute('ok')).rejects.toThrow('User not found');
    expect(tokenService.generateTokens).not.toHaveBeenCalled();
  });

  it('returns auth response when code and user are valid', async () => {
    oauthRepository.consumeExchangeCode.mockResolvedValue(mockUser.id);
    userRepository.findById.mockResolvedValue(mockUser);

    const useCase = new OAuthExchangeUseCase(oauthRepository, userRepository, tokenService);
    const result = await useCase.execute('ex');

    expect(oauthRepository.consumeExchangeCode).toHaveBeenCalledWith('ex');
    expect(tokenService.generateTokens).toHaveBeenCalledWith(mockUser.id);
    expect(result.accessToken).toBe('acc');
    expect(result.user.email).toBe(mockUser.email);
  });
});
