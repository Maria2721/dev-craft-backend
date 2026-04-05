/**
 * Unit tests for JwtStrategy
 */

import { Test } from '@nestjs/testing';

import { JwtStrategy } from '../../../../src/infrastructure/auth/jwt.strategy';

describe('JwtStrategy', () => {
  const saved = process.env.JWT_ACCESS_SECRET;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  });

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.JWT_ACCESS_SECRET;
    } else {
      process.env.JWT_ACCESS_SECRET = saved;
    }
  });

  it('validate maps sub to userId', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    const strategy = moduleRef.get(JwtStrategy);

    expect(strategy.validate({ sub: 99, type: 'access' })).toEqual({ userId: 99 });
  });
});
