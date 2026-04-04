import { ConflictException, Injectable } from '@nestjs/common';
import { OAuthProvider } from '@prisma/client';
import { randomBytes } from 'crypto';

import { OAuthRepository } from '../../../domain/repositories/oauth.repository';
import { GithubOAuthClient } from '../../../infrastructure/oauth/github-oauth.client';
import { OAuthAccountLinkingService } from './oauth-account-linking.service';

const EXCHANGE_TTL_MS = 5 * 60 * 1000;

function defaultFrontendCallbackUrl(): string {
  return process.env.FRONTEND_OAUTH_REDIRECT ?? 'http://localhost:5173/auth/callback';
}

function redirectWithQuery(base: string, params: Record<string, string>): string {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) {
    u.searchParams.set(k, v);
  }
  return u.toString();
}

@Injectable()
export class HandleGithubOAuthCallbackUseCase {
  constructor(
    private readonly oauthRepository: OAuthRepository,
    private readonly githubOAuthClient: GithubOAuthClient,
    private readonly linking: OAuthAccountLinkingService,
  ) {}

  async execute(params: { code?: string; state?: string }): Promise<string> {
    const base = defaultFrontendCallbackUrl();
    if (!params.code || !params.state) {
      return redirectWithQuery(base, { error: 'oauth_missing_params' });
    }

    const provider = await this.oauthRepository.consumeState(params.state);
    if (provider !== OAuthProvider.GITHUB) {
      return redirectWithQuery(base, { error: 'oauth_invalid_state' });
    }

    try {
      const { accessToken } = await this.githubOAuthClient.exchangeAuthorizationCode(params.code);
      const profile = await this.githubOAuthClient.getUserProfile(accessToken);
      let email = profile.email;
      if (!email) {
        email = await this.githubOAuthClient.getPrimaryEmail(accessToken);
      }
      if (!email) {
        return redirectWithQuery(base, { error: 'oauth_no_email' });
      }

      const nameFromProfile = profile.name?.trim();
      const name = nameFromProfile?.split(/\s+/)[0] || profile.login || 'User';
      const surname = nameFromProfile?.split(/\s+/).slice(1).join(' ') || '-';

      const user = await this.linking.provisionUser({
        provider: OAuthProvider.GITHUB,
        providerAccountId: String(profile.id),
        email,
        name,
        surname,
      });

      const exchangeCode = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + EXCHANGE_TTL_MS);
      await this.oauthRepository.saveExchangeCode(exchangeCode, user.id, expiresAt);

      return redirectWithQuery(base, { code: exchangeCode });
    } catch (e) {
      if (e instanceof ConflictException) {
        return redirectWithQuery(base, { error: 'oauth_account_conflict' });
      }
      return redirectWithQuery(base, { error: 'oauth_provider_error' });
    }
  }
}
