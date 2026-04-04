import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OAuthProvider } from '@prisma/client';
import { randomBytes } from 'crypto';

import { OAuthRepository } from '../../../domain/repositories/oauth.repository';

const STATE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class StartGoogleOAuthUseCase {
  constructor(private readonly oauthRepository: OAuthRepository) {}

  async execute(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    if (!clientId || !redirectUri) {
      throw new InternalServerErrorException('Google OAuth is not configured');
    }

    const state = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + STATE_TTL_MS);
    await this.oauthRepository.saveState(state, OAuthProvider.GOOGLE, expiresAt);

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);

    return url.toString();
  }
}
