/**
 * Unit tests for buildAuthResponse
 */

import { User } from '@prisma/client';

import { buildAuthResponse } from '../../../../src/application/auth/auth-response.helper';
import { TokenService } from '../../../../src/domain/services/token.service';

describe('buildAuthResponse', () => {
  const mockUser: User = {
    id: 42,
    email: 'u@example.com',
    passwordHash: null,
    name: 'Ann',
    surname: 'Bee',
    createdAt: new Date('2026-03-03'),
  };

  it('maps user and tokens from TokenService', async () => {
    const tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        accessToken: 'a',
        refreshToken: 'r',
        expiresIn: 900,
      }),
    } as unknown as TokenService;

    const result = await buildAuthResponse(mockUser, tokenService);

    expect(tokenService.generateTokens).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual({
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        surname: mockUser.surname,
        createdAt: mockUser.createdAt,
      },
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 900,
    });
  });
});
