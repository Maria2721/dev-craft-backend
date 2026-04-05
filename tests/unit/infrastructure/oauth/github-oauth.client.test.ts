/**
 * Unit tests for GithubOAuthClient
 */

jest.mock('axios');
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

import { GithubOAuthClient } from '../../../../src/infrastructure/oauth/github-oauth.client';

describe('GithubOAuthClient', () => {
  const saved = {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_CLIENT_ID = 'id';
    process.env.GITHUB_CLIENT_SECRET = 'sec';
    process.env.GITHUB_CALLBACK_URL = 'http://cb';
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

  it('throws when env incomplete', async () => {
    delete process.env.GITHUB_CLIENT_ID;

    const client = new GithubOAuthClient();

    await expect(client.exchangeAuthorizationCode('c')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('throws when token response has error', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { error: 'bad_verification_code' },
    });

    const client = new GithubOAuthClient();

    await expect(client.exchangeAuthorizationCode('c')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('returns access token on success', async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { access_token: 'gh-token' },
    });

    const client = new GithubOAuthClient();
    const out = await client.exchangeAuthorizationCode('c');

    expect(out.accessToken).toBe('gh-token');
  });

  it('getUserProfile returns user', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { id: 1, login: 'u', email: null, name: null },
    });

    const client = new GithubOAuthClient();
    const p = await client.getUserProfile('t');

    expect(p.login).toBe('u');
  });

  it('getPrimaryEmail prefers primary flag', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: [{ email: 'a@a.com' }, { email: 'p@p.com', primary: true }],
    });

    const client = new GithubOAuthClient();
    const email = await client.getPrimaryEmail('t');

    expect(email).toBe('p@p.com');
  });

  it('getPrimaryEmail falls back to first email', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: [{ email: 'only@e.com' }],
    });

    const client = new GithubOAuthClient();
    const email = await client.getPrimaryEmail('t');

    expect(email).toBe('only@e.com');
  });
});
