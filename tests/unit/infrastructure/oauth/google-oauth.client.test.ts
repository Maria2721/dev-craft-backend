/**
 * Unit tests for GoogleOAuthClient
 */

jest.mock('axios');
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

import { GoogleOAuthClient } from '../../../../src/infrastructure/oauth/google-oauth.client';

describe('GoogleOAuthClient', () => {
  const saved = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://cb';
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
      const key = k as keyof typeof saved;
      if (v === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = v;
      }
    }
  });

  it('throws when OAuth env is incomplete', async () => {
    delete process.env.GOOGLE_CLIENT_SECRET;

    const client = new GoogleOAuthClient();

    await expect(client.exchangeAuthorizationCode('c')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('exchanges code for access token', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { access_token: 'tok' } });

    const client = new GoogleOAuthClient();
    const out = await client.exchangeAuthorizationCode('code');

    expect(out.accessToken).toBe('tok');
    expect(axios.post).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.any(String),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );
  });

  it('fetches user profile', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { sub: 's', email: 'e@e.com' },
    });

    const client = new GoogleOAuthClient();
    const profile = await client.getUserProfile('tok');

    expect(profile.email).toBe('e@e.com');
    expect(axios.get).toHaveBeenCalledWith('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: 'Bearer tok' },
    });
  });
});
