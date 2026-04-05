/**
 * Unit tests for JwtTokenService
 */

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtTokenService } from '../../../../src/infrastructure/auth/jwt-token.service';

describe('JwtTokenService', () => {
  const saved = {
    JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL,
    JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  };

  beforeEach(() => {
    process.env.JWT_ACCESS_TTL = '900';
    process.env.JWT_REFRESH_TTL = '604800';
    process.env.JWT_ACCESS_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
      const key = k as keyof typeof saved;
      if (v === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = v;
      }
    }
  });

  it('generateTokens signs access and refresh with jwtService', async () => {
    const jwtService = {
      sign: jest
        .fn()
        .mockImplementationOnce(() => 'access-jwt')
        .mockImplementationOnce(() => 'refresh-jwt'),
    } as unknown as JwtService;

    const svc = new JwtTokenService(jwtService);
    const result = await svc.generateTokens(5);

    expect(result).toEqual({
      accessToken: 'access-jwt',
      refreshToken: 'refresh-jwt',
      expiresIn: 900,
    });
    expect(jwtService.sign).toHaveBeenCalledTimes(2);
  });

  it('verifyRefreshToken returns userId for valid refresh payload', async () => {
    const jwtService = {
      sign: jest.fn(),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 42, type: 'refresh' }),
    } as unknown as JwtService;

    const svc = new JwtTokenService(jwtService);
    const result = await svc.verifyRefreshToken('token');

    expect(result).toEqual({ userId: 42 });
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
      secret: 'refresh-secret',
    });
  });

  it('verifyRefreshToken throws when type is not refresh', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: 1, type: 'access' }),
    } as unknown as JwtService;

    const svc = new JwtTokenService(jwtService);

    await expect(svc.verifyRefreshToken('t')).rejects.toThrow(UnauthorizedException);
  });

  it('verifyRefreshToken throws when sub is not a number', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: '1', type: 'refresh' }),
    } as unknown as JwtService;

    const svc = new JwtTokenService(jwtService);

    await expect(svc.verifyRefreshToken('t')).rejects.toThrow(UnauthorizedException);
  });

  it('verifyRefreshToken rethrows UnauthorizedException from verify', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockRejectedValue(new UnauthorizedException('bad')),
    } as unknown as JwtService;

    const svc = new JwtTokenService(jwtService);

    await expect(svc.verifyRefreshToken('t')).rejects.toThrow(UnauthorizedException);
    await expect(svc.verifyRefreshToken('t')).rejects.toThrow('bad');
  });

  it('verifyRefreshToken wraps generic verify errors', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('expired')),
    } as unknown as JwtService;

    const svc = new JwtTokenService(jwtService);

    await expect(svc.verifyRefreshToken('t')).rejects.toThrow(UnauthorizedException);
    await expect(svc.verifyRefreshToken('t')).rejects.toThrow('Invalid or expired refresh token');
  });
});
