/**
 * Unit tests for StartGithubOAuthUseCase
 */

jest.mock('crypto', () => {
  const actual = jest.requireActual<typeof import('crypto')>('crypto');
  return {
    ...actual,
    randomBytes: jest.fn((size: number) => Buffer.alloc(size, 2)),
  };
});

import { InternalServerErrorException } from '@nestjs/common';
import { OAuthProvider } from '@prisma/client';

import { StartGithubOAuthUseCase } from '../../../../../src/application/auth/oauth/start-github-oauth.use-case';
import { OAuthRepository } from '../../../../../src/domain/repositories/oauth.repository';

describe('StartGithubOAuthUseCase', () => {
  let oauthRepository: jest.Mocked<OAuthRepository>;
  const envKeys = ['GITHUB_CLIENT_ID', 'GITHUB_CALLBACK_URL'] as const;
  const saved: Partial<Record<(typeof envKeys)[number], string | undefined>> = {};

  beforeEach(() => {
    for (const k of envKeys) {
      saved[k] = process.env[k];
    }
    process.env.GITHUB_CLIENT_ID = 'gh-id';
    process.env.GITHUB_CALLBACK_URL = 'http://localhost/gh-cb';

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

  it('throws when GitHub OAuth env is missing', async () => {
    delete process.env.GITHUB_CALLBACK_URL;

    const useCase = new StartGithubOAuthUseCase(oauthRepository);

    await expect(useCase.execute()).rejects.toThrow(InternalServerErrorException);
    await expect(useCase.execute()).rejects.toThrow('GitHub OAuth is not configured');
  });

  it('persists state and returns GitHub authorize URL', async () => {
    const useCase = new StartGithubOAuthUseCase(oauthRepository);
    const url = await useCase.execute();

    expect(oauthRepository.saveState).toHaveBeenCalled();
    const [state, provider] = oauthRepository.saveState.mock.calls[0];
    expect(provider).toBe(OAuthProvider.GITHUB);

    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(parsed.searchParams.get('client_id')).toBe('gh-id');
    expect(parsed.searchParams.get('redirect_uri')).toBe('http://localhost/gh-cb');
    expect(parsed.searchParams.get('scope')).toBe('read:user user:email');
    expect(parsed.searchParams.get('state')).toBe(state);
  });
});
