export abstract class TokenService {
  abstract generateTokens(userId: number): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;
}
