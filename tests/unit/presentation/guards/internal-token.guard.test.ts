/**
 * Unit tests for InternalTokenGuard
 */

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import { InternalTokenGuard } from '../../../../src/presentation/guards/internal-token.guard';

function createContext(req: Partial<Request>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => req as Request,
    }),
  } as ExecutionContext;
}

describe('InternalTokenGuard', () => {
  const saved = process.env.DISCORD_BOT_INTERNAL_API_TOKEN;

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.DISCORD_BOT_INTERNAL_API_TOKEN;
    } else {
      process.env.DISCORD_BOT_INTERNAL_API_TOKEN = saved;
    }
  });

  it('throws when token env is not set', () => {
    delete process.env.DISCORD_BOT_INTERNAL_API_TOKEN;

    const guard = new InternalTokenGuard();

    expect(() => guard.canActivate(createContext({ headers: {} }))).toThrow(UnauthorizedException);
  });

  it('allows when x-internal-token matches', () => {
    process.env.DISCORD_BOT_INTERNAL_API_TOKEN = 'secret-token';

    const guard = new InternalTokenGuard();
    const ok = guard.canActivate(
      createContext({ headers: { 'x-internal-token': 'secret-token' } }),
    );

    expect(ok).toBe(true);
  });

  it('allows when Authorization Bearer matches', () => {
    process.env.DISCORD_BOT_INTERNAL_API_TOKEN = 'bearer-secret';

    const guard = new InternalTokenGuard();
    const ok = guard.canActivate(
      createContext({ headers: { authorization: 'Bearer bearer-secret' } }),
    );

    expect(ok).toBe(true);
  });

  it('throws when header does not match', () => {
    process.env.DISCORD_BOT_INTERNAL_API_TOKEN = 'a';

    const guard = new InternalTokenGuard();

    expect(() =>
      guard.canActivate(createContext({ headers: { 'x-internal-token': 'b' } })),
    ).toThrow(UnauthorizedException);
  });
});
