/**
 * Unit tests for HandleGoogleOAuthCallbackUseCase
 */

jest.mock('crypto', () => {
  const actual = jest.requireActual<typeof import('crypto')>('crypto');
  return {
    ...actual,
    randomBytes: jest.fn((size: number) => Buffer.alloc(size, 3)),
  };
});

import { ConflictException } from '@nestjs/common';
import { OAuthProvider, User } from '@prisma/client';

import { HandleGoogleOAuthCallbackUseCase } from '../../../../../src/application/auth/oauth/handle-google-oauth-callback.use-case';
import { OAuthAccountLinkingService } from '../../../../../src/application/auth/oauth/oauth-account-linking.service';
import { OAuthRepository } from '../../../../../src/domain/repositories/oauth.repository';
import { GoogleOAuthClient } from '../../../../../src/infrastructure/oauth/google-oauth.client';

describe('HandleGoogleOAuthCallbackUseCase', () => {
  let oauthRepository: jest.Mocked<OAuthRepository>;
  let googleOAuthClient: jest.Mocked<GoogleOAuthClient>;
  let linking: jest.Mocked<OAuthAccountLinkingService>;

  const user: User = {
    id: 10,
    email: 'g@mail.com',
    passwordHash: null,
    name: 'G',
    surname: 'U',
    createdAt: new Date(),
  };

  const savedFrontend = process.env.FRONTEND_OAUTH_REDIRECT;

  beforeEach(() => {
    process.env.FRONTEND_OAUTH_REDIRECT = 'http://front/callback';

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

    googleOAuthClient = {
      exchangeAuthorizationCode: jest.fn(),
      getUserProfile: jest.fn(),
    } as unknown as jest.Mocked<GoogleOAuthClient>;

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

  it('redirects with oauth_missing_params when code or state is absent', async () => {
    const useCase = new HandleGoogleOAuthCallbackUseCase(
      oauthRepository,
      googleOAuthClient,
      linking,
    );

    let url = await useCase.execute({});
    expect(url).toContain('error=oauth_missing_params');

    url = await useCase.execute({ code: 'c' });
    expect(url).toContain('error=oauth_missing_params');
  });

  it('redirects with oauth_invalid_state when state does not match Google', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GITHUB);

    const useCase = new HandleGoogleOAuthCallbackUseCase(
      oauthRepository,
      googleOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 's' });

    expect(url).toContain('error=oauth_invalid_state');
    expect(googleOAuthClient.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it('redirects with oauth_no_email when profile has no email', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GOOGLE);
    googleOAuthClient.exchangeAuthorizationCode.mockResolvedValue({ accessToken: 't' });
    googleOAuthClient.getUserProfile.mockResolvedValue({
      sub: 'sub',
      email: '',
    });

    const useCase = new HandleGoogleOAuthCallbackUseCase(
      oauthRepository,
      googleOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 's' });

    expect(url).toContain('error=oauth_no_email');
  });

  it('redirects with oauth_account_conflict on ConflictException', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GOOGLE);
    googleOAuthClient.exchangeAuthorizationCode.mockResolvedValue({ accessToken: 't' });
    googleOAuthClient.getUserProfile.mockResolvedValue({
      sub: 'sub',
      email: 'e@mail.com',
      given_name: 'A',
      family_name: 'B',
    });
    linking.provisionUser.mockRejectedValue(new ConflictException('x'));

    const useCase = new HandleGoogleOAuthCallbackUseCase(
      oauthRepository,
      googleOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 's' });

    expect(url).toContain('error=oauth_account_conflict');
  });

  it('redirects with oauth_provider_error on generic errors', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GOOGLE);
    googleOAuthClient.exchangeAuthorizationCode.mockRejectedValue(new Error('network'));

    const useCase = new HandleGoogleOAuthCallbackUseCase(
      oauthRepository,
      googleOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 's' });

    expect(url).toContain('error=oauth_provider_error');
  });

  it('saves exchange code and redirects with code on success', async () => {
    oauthRepository.consumeState.mockResolvedValue(OAuthProvider.GOOGLE);
    googleOAuthClient.exchangeAuthorizationCode.mockResolvedValue({ accessToken: 't' });
    googleOAuthClient.getUserProfile.mockResolvedValue({
      sub: 'sub-1',
      email: 'e@mail.com',
      name: 'Full Name',
    });
    linking.provisionUser.mockResolvedValue(user);

    const useCase = new HandleGoogleOAuthCallbackUseCase(
      oauthRepository,
      googleOAuthClient,
      linking,
    );
    const url = await useCase.execute({ code: 'c', state: 'st' });

    expect(linking.provisionUser).toHaveBeenCalledWith({
      provider: OAuthProvider.GOOGLE,
      providerAccountId: 'sub-1',
      email: 'e@mail.com',
      name: 'Full',
      surname: 'Name',
    });
    expect(oauthRepository.saveExchangeCode).toHaveBeenCalled();
    const [exchangeCode, userId, expiresAt] = oauthRepository.saveExchangeCode.mock.calls[0];
    expect(userId).toBe(user.id);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(url).toContain(`code=${exchangeCode}`);
  });
});
