/**
 * Unit tests for StartGoogleOAuthUseCase
 */

jest.mock('crypto', () => {
  const actual = jest.requireActual<typeof import('crypto')>('crypto');
  return {
    ...actual,
    randomBytes: jest.fn((size: number) => Buffer.alloc(size, 1)),
  };
});

import { InternalServerErrorException } from '@nestjs/common';
import { OAuthProvider } from '@prisma/client';

import { StartGoogleOAuthUseCase } from '../../../../../src/application/auth/oauth/start-google-oauth.use-case';
import { OAuthRepository } from '../../../../../src/domain/repositories/oauth.repository';

describe('StartGoogleOAuthUseCase', () => {
  let oauthRepository: jest.Mocked<OAuthRepository>;
  const envKeys = ['GOOGLE_CLIENT_ID', 'GOOGLE_CALLBACK_URL'] as const;
  const saved: Partial<Record<(typeof envKeys)[number], string | undefined>> = {};

  beforeEach(() => {
    for (const k of envKeys) {
      saved[k] = process.env[k];
    }
    process.env.GOOGLE_CLIENT_ID = 'test-client';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost/cb';

    oauthRepository = {
      saveState: jest.fn().mockResolvedValue(undefined),
      consumeState: jest.fn(),
      saveExchangeCode: jest.fn(),
      consumeExchangeCode: jest.fn(),
      findAccount: jest.fn(),
      findAccountForUser: jest.fn(),
      createAccount: jest.fn(),
      createUserWithProviderAccount: jest.fn(),
    } as unknown as jest.Mocked<OAuthRepository>;
  });

  afterEach(() => {
    for (const k of envKeys) {
      if (saved[k] === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = saved[k];
      }
    }
  });

  it('throws when Google OAuth env is missing', async () => {
    delete process.env.GOOGLE_CLIENT_ID;

    const useCase = new StartGoogleOAuthUseCase(oauthRepository);

    await expect(useCase.execute()).rejects.toThrow(InternalServerErrorException);
    await expect(useCase.execute()).rejects.toThrow('Google OAuth is not configured');
    expect(oauthRepository.saveState).not.toHaveBeenCalled();
  });

  it('persists state and returns Google authorize URL', async () => {
    const useCase = new StartGoogleOAuthUseCase(oauthRepository);
    const url = await useCase.execute();

    expect(oauthRepository.saveState).toHaveBeenCalledTimes(1);
    const [state, provider, expiresAt] = oauthRepository.saveState.mock.calls[0];
    expect(provider).toBe(OAuthProvider.GOOGLE);
    expect(typeof state).toBe('string');
    expect(state.length).toBeGreaterThan(0);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(parsed.searchParams.get('client_id')).toBe('test-client');
    expect(parsed.searchParams.get('redirect_uri')).toBe('http://localhost/cb');
    expect(parsed.searchParams.get('response_type')).toBe('code');
    expect(parsed.searchParams.get('scope')).toBe('openid email profile');
    expect(parsed.searchParams.get('state')).toBe(state);
  });
});
