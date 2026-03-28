import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserRepository } from '../../domain/repositories/user.repository';
import { TokenService } from '../../domain/services/token.service';
import { AuthResponse } from './register.use-case';

export type RefreshDto = {
  refreshToken: string;
};

@Injectable()
export class RefreshUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RefreshDto): Promise<AuthResponse> {
    const { userId } = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { accessToken, refreshToken, expiresIn } = await this.tokenService.generateTokens(
      user.id,
    );

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
}
