import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

export type GoogleUserProfile = {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
};

@Injectable()
export class GoogleOAuthClient {
  async exchangeAuthorizationCode(code: string): Promise<{ accessToken: string }> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('Google OAuth is not configured');
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const res = await axios.post<{ access_token: string }>(
      'https://oauth2.googleapis.com/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return { accessToken: res.data.access_token };
  }

  async getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    const res = await axios.get<GoogleUserProfile>(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return res.data;
  }
}
