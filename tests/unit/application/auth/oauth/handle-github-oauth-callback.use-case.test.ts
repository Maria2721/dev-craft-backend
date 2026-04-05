/**
 * Unit tests for HandleGithubOAuthCallbackUseCase
 */

jest.mock('crypto', () => {
  const actual = jest.requireActual<typeof import('crypto')>('crypto');
  return {
    ...actual,
    randomBytes: jest.fn((size: number) => Buffer.alloc(size, 4)),
  };
});

import { ConflictException } from '@nestjs/common';
import { OAuthProvider, User } from '@prisma/client';

import { HandleGithubOAuthCallbackUseCase } from '../../../../../src/application/auth/oauth/handle-github-oauth-callback.use-case';
import { OAuthAccountLinkingService } from '../../../../../src/application/auth/oauth/oauth-account-linking.service';
import { OAuthRepository } from '../../../../../src/domain/repositories/oauth.repository';
import { GithubOAuthClient } from '../../../../../src/infrastructure/oauth/github-oauth.client';

describe('HandleGithubOAuthCallbackUseCase', () => {
  let oauthRepository: jest.Mocked<OAuthRepository>;
  let githubOAuthClient: jest.Mocked<GithubOAuthClient>;
  let linking: jest.Mocked<OAuthAccountLinkingService>;

  const user: User = {
    id: 20,
    email: 'gh@mail.com',
    passwordHash: null,
    name: 'Gh',
    surname: 'Hub',
    createdAt: new Date(),
  };

  const savedFrontend = process.env.FRONTEND_OAUTH_REDIRECT;

  beforeEach(() => {
    process.env.FRONTEND_OAUTH_REDIRECT = 'http://front/cb';

    oauthRepository = {
      consumeState: jest.fn(),
      saveExchangeCode: jest.fn().mockResolvedValue(undefined),
      saveState: jest.fn(),
      consumeExchangeCode: jest.fn(),
      findAccount: jest.fn(),
      findAccountForUser: jest.fn(),
      createAccount: jest.fn(),
      createUserWithProviderAccount: jest.fn(),
    } as unknown as jest.Mocked<OAuthRepository>;

    githubOAuthClient = {
      exchangeAuthorizationCode: jest.fn(),
      getUserProfile: jest.fn(),
      getPrimaryEmail: jest.fn(),
    } as unknown as jest.Mocked<GithubOAuthClient>;

    linking = {
      provisionUser: jest.fn(),
    } as unknown as jest.Mocked<OAuthAccountLinkingService>;
  });

  afterEach(() => {
    if (savedFrontend === undefined) {
      delete process.env.FRONTEND_OAUTH_REDIRECT;
    } else {
      process.env.FRONTEND_OAUTH_REDIRECT = savedFrontend;
    }
  });

  it('redirects with oauth_missing_params when params missing', async () => {
    const useCase = new HandleGithubOAuthCallbackUseCase(
      oauthRepository,
      githubOAuthClient,
      linking,
    );
    const url = await useCase.execute({ state: 's' });
    expect(url).toContain('error=oauth_missing_params');
  });

  it('redirects with oauth_invalid_state when state is not GitHub', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GOOGLE);

    const useCase = new HandleGithubOAuthCallbackUseCase(
      oauthRepository,
      githubOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 's' });
    expect(url).toContain('error=oauth_invalid_state');
  });

  it('fetches primary email when profile email is null then succeeds', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GITHUB);
    githubOAuthClient.exchangeAuthorizationCode.mockResolvedValue({ accessToken: 't' });
    githubOAuthClient.getUserProfile.mockResolvedValue({
      id: 99,
      login: 'login',
      email: null,
      name: 'One Two',
    });
    githubOAuthClient.getPrimaryEmail.mockResolvedValue('primary@mail.com');
    linking.provisionUser.mockResolvedValue(user);

    const useCase = new HandleGithubOAuthCallbackUseCase(
      oauthRepository,
      githubOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 's' });

    expect(githubOAuthClient.getPrimaryEmail).toHaveBeenCalledWith('t');
    expect(linking.provisionUser).toHaveBeenCalledWith({
      provider: OAuthProvider.GITHUB,
      providerAccountId: '99',
      email: 'primary@mail.com',
      name: 'One',
      surname: 'Two',
    });
    expect(url).toContain('code=');
  });

  it('redirects oauth_no_email when profile and primary email are missing', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GITHUB);
    githubOAuthClient.exchangeAuthorizationCode.mockResolvedValue({ accessToken: 't' });
    githubOAuthClient.getUserProfile.mockResolvedValue({
      id: 1,
      login: 'l',
      email: null,
      name: null,
    });
    githubOAuthClient.getPrimaryEmail.mockResolvedValue(null);

    const useCase = new HandleGithubOAuthCallbackUseCase(
      oauthRepository,
      githubOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 's' });
    expect(url).toContain('error=oauth_no_email');
  });

  it('redirects oauth_account_conflict on ConflictException', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GITHUB);
    githubOAuthClient.exchangeAuthorizationCode.mockResolvedValue({ accessToken: 't' });
    githubOAuthClient.getUserProfile.mockResolvedValue({
      id: 2,
      login: 'l',
      email: 'e@e.com',
      name: null,
    });
    linking.provisionUser.mockRejectedValue(new ConflictException());

    const useCase = new HandleGithubOAuthCallbackUseCase(
      oauthRepository,
      githubOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 's' });
    expect(url).toContain('error=oauth_account_conflict');
  });

  it('uses login as name when name is empty', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GITHUB);
    githubOAuthClient.exchangeAuthorizationCode.mockResolvedValue({ accessToken: 't' });
    githubOAuthClient.getUserProfile.mockResolvedValue({
      id: 3,
      login: 'octocat',
      email: 'o@o.com',
      name: '   ',
    });
    linking.provisionUser.mockResolvedValue(user);

    const useCase = new HandleGithubOAuthCallbackUseCase(
      oauthRepository,
      githubOAuthClient,
      linking,
    );
    await useCase.execute({ code: 'c', state: 's' });

    expect(linking.provisionUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'octocat',
        email: 'o@o.com',
      }),
    );
  });
});
