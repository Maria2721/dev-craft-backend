/**
 * Unit tests for LoginUseCase
 */

import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { LoginUseCase } from '../../../../src/application/auth/login.use-case';
import { UserRepository } from '../../../../src/domain/repositories/user.repository';
import { TokenService } from '../../../../src/domain/services/token.service';
import { User } from '@prisma/client';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('LoginUseCase', () => {
  const mockUser: User = {
    id: 1,
    email: 'user@example.com',
    passwordHash: 'hashed',
    name: 'Name',
    surname: 'Surname',
    createdAt: new Date(),
  };

  let userRepository: jest.Mocked<UserRepository>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 900,
      }),
    } as unknown as jest.Mocked<TokenService>;
  });

  it('throws UnauthorizedException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const useCase = new LoginUseCase(userRepository, tokenService);

    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'any' }),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'any' }),
    ).rejects.toThrow('Invalid credentials');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException on wrong password', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const useCase = new LoginUseCase(userRepository, tokenService);

    await expect(useCase.execute({ email: mockUser.email, password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(bcrypt.compare).toHaveBeenCalledWith('wrong', mockUser.passwordHash);
    expect(tokenService.generateTokens).not.toHaveBeenCalled();
  });

  it('returns AuthResponse when credentials are valid', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const useCase = new LoginUseCase(userRepository, tokenService);

    const result = await useCase.execute({
      email: mockUser.email,
      password: 'correct',
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('correct', mockUser.passwordHash);
    expect(tokenService.generateTokens).toHaveBeenCalledWith(mockUser.id);
    expect(result).toMatchObject({
      user: expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }),
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 900,
    });
  });
});
