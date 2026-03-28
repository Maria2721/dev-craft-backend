import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenService } from '../../domain/services/token.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtTokenService extends TokenService {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async generateTokens(userId: number): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const accessTtl = parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10);
    const refreshTtl = parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10);

    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access' },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: accessTtl },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: refreshTtl },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
    };
  }

  async verifyRefreshToken(token: string): Promise<{ userId: number }> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      if (payload.type !== 'refresh' || typeof payload.sub !== 'number') {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      return { userId: payload.sub };
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
