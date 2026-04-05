import { User } from '@prisma/client';

import { TokenService } from '../../domain/services/token.service';
import { AuthResponse } from './register.use-case';

export async function buildAuthResponse(
  user: User,
  tokenService: TokenService,
): Promise<AuthResponse> {
  const { accessToken, refreshToken, expiresIn } = await tokenService.generateTokens(user.id);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
    expiresIn,
  };
}
