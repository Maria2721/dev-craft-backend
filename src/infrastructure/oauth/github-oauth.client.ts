import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

export type GithubUserProfile = {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
};

@Injectable()
export class GithubOAuthClient {
  async exchangeAuthorizationCode(code: string): Promise<{ accessToken: string }> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_CALLBACK_URL;
    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('GitHub OAuth is not configured');
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const res = await axios.post('https://github.com/login/oauth/access_token', body.toString(), {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = res.data as { access_token?: string; error?: string };
    if (data.error || !data.access_token) {
      throw new InternalServerErrorException('GitHub token exchange failed');
    }

    return { accessToken: data.access_token };
  }

  async getUserProfile(accessToken: string): Promise<GithubUserProfile> {
    const res = await axios.get<GithubUserProfile>('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
    return res.data;
  }

  async getPrimaryEmail(accessToken: string): Promise<string | null> {
    const res = await axios.get<Array<{ email: string; primary?: boolean }>>(
      'https://api.github.com/user/emails',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );
    const primary = res.data.find((e) => e.primary);
    return primary?.email ?? res.data[0]?.email ?? null;
  }
}
