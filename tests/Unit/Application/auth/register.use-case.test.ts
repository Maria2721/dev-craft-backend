/**
 * Unit tests for RegisterUseCase
 */

import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RegisterUseCase } from '../../../../src/application/auth/register.use-case';
import { UserRepository } from '../../../../src/domain/repositories/user.repository';
import { TokenService } from '../../../../src/domain/services/token.service';
import { User } from '@prisma/client';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('RegisterUseCase', () => {
  const mockUser: User = {
    id: 1,
    email: 'user@example.com',
    passwordHash: 'hashed_password',
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

  it('throws ConflictException when user with email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);

    const useCase = new RegisterUseCase(userRepository, tokenService);
    const dto = {
      email: 'user@example.com',
      password: 'password',
      name: 'Name',
      surname: 'Surname',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    await expect(useCase.execute(dto)).rejects.toThrow('User with this email already exists');
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('creates user and returns AuthResponse on success', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(mockUser);

    const useCase = new RegisterUseCase(userRepository, tokenService);
    const dto = {
      email: 'new@example.com',
      password: 'password',
      name: 'Name',
      surname: 'Surname',
    };

    const result = await useCase.execute(dto);

    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: dto.email,
        passwordHash: 'hashed_password',
        name: dto.name,
        surname: dto.surname,
      }),
    );
    expect(tokenService.generateTokens).toHaveBeenCalledWith(mockUser.id);
    expect(result).toMatchObject({
      user: expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        surname: mockUser.surname,
      }),
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 900,
    });
  });
});
