import { ConflictException, Injectable } from '@nestjs/common';
import { OAuthProvider } from '@prisma/client';
import { randomBytes } from 'crypto';

import { OAuthRepository } from '../../../domain/repositories/oauth.repository';
import { GoogleOAuthClient } from '../../../infrastructure/oauth/google-oauth.client';
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
export class HandleGoogleOAuthCallbackUseCase {
  constructor(
    private readonly oauthRepository: OAuthRepository,
    private readonly googleOAuthClient: GoogleOAuthClient,
    private readonly linking: OAuthAccountLinkingService,
  ) {}

  async execute(params: { code?: string; state?: string }): Promise<string> {
    const base = defaultFrontendCallbackUrl();
    if (!params.code || !params.state) {
      return redirectWithQuery(base, { error: 'oauth_missing_params' });
    }

    const provider = await this.oauthRepository.consumeState(params.state);
    if (provider !== OAuthProvider.GOOGLE) {
      return redirectWithQuery(base, { error: 'oauth_invalid_state' });
    }

    try {
      const { accessToken } = await this.googleOAuthClient.exchangeAuthorizationCode(params.code);
      const profile = await this.googleOAuthClient.getUserProfile(accessToken);
      if (!profile.email) {
        return redirectWithQuery(base, { error: 'oauth_no_email' });
      }

      const name = profile.given_name?.trim() || profile.name?.split(/\s+/)[0] || 'User';
      const surname =
        profile.family_name?.trim() || profile.name?.split(/\s+/).slice(1).join(' ') || '-';

      const user = await this.linking.provisionUser({
        provider: OAuthProvider.GOOGLE,
        providerAccountId: profile.sub,
        email: profile.email,
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
