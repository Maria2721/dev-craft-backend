import { Injectable, UnauthorizedException } from '@nestjs/common';

import { OAuthRepository } from '../../../domain/repositories/oauth.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenService } from '../../../domain/services/token.service';
import { buildAuthResponse } from '../auth-response.helper';
import { AuthResponse } from '../register.use-case';

@Injectable()
export class OAuthExchangeUseCase {
  constructor(
    private readonly oauthRepository: OAuthRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(exchangeCode: string): Promise<AuthResponse> {
    const userId = await this.oauthRepository.consumeExchangeCode(exchangeCode);
    if (userId === null) {
      throw new UnauthorizedException('Invalid or expired exchange code');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return buildAuthResponse(user, this.tokenService);
  }
}
