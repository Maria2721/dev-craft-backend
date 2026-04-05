/**
 * Unit tests for RefreshUseCase
 */

import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';

import { RefreshUseCase } from '../../../../src/application/auth/refresh.use-case';
import { UserRepository } from '../../../../src/domain/repositories/user.repository';
import { TokenService } from '../../../../src/domain/services/token.service';

describe('RefreshUseCase', () => {
  const mockUser: User = {
    id: 7,
    email: 'u@example.com',
    passwordHash: 'h',
    name: 'N',
    surname: 'S',
    createdAt: new Date(),
  };

  let userRepository: jest.Mocked<UserRepository>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        expiresIn: 900,
      }),
      verifyRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;
  });

  it('throws when user no longer exists', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ userId: mockUser.id });
    userRepository.findById.mockResolvedValue(null);

    const useCase = new RefreshUseCase(userRepository, tokenService);

    await expect(useCase.execute({ refreshToken: 'rt' })).rejects.toThrow(UnauthorizedException);
    await expect(useCase.execute({ refreshToken: 'rt' })).rejects.toThrow(
      'Invalid or expired refresh token',
    );
    expect(tokenService.generateTokens).not.toHaveBeenCalled();
  });

  it('returns new tokens and user payload when refresh is valid', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ userId: mockUser.id });
    userRepository.findById.mockResolvedValue(mockUser);

    const useCase = new RefreshUseCase(userRepository, tokenService);
    const result = await useCase.execute({ refreshToken: 'rt' });

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith('rt');
    expect(tokenService.generateTokens).toHaveBeenCalledWith(mockUser.id);
    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(result.expiresIn).toBe(900);
    expect(result.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      surname: mockUser.surname,
      createdAt: mockUser.createdAt,
    });
  });
});
