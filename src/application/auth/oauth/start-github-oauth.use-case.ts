import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OAuthProvider } from '@prisma/client';
import { randomBytes } from 'crypto';

import { OAuthRepository } from '../../../domain/repositories/oauth.repository';

const STATE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class StartGithubOAuthUseCase {
  constructor(private readonly oauthRepository: OAuthRepository) {}

  async execute(): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_CALLBACK_URL;
    if (!clientId || !redirectUri) {
      throw new InternalServerErrorException('GitHub OAuth is not configured');
    }

    const state = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + STATE_TTL_MS);
    await this.oauthRepository.saveState(state, OAuthProvider.GITHUB, expiresAt);

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'read:user user:email');
    url.searchParams.set('state', state);

    return url.toString();
  }
}
