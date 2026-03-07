import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { TokenService } from '../../domain/token.service';
import { UserRepository } from '../../domain/user.repository';
import { AuthResponse } from './register.use-case';

export type LoginDto = {
  email: string;
  password: string;
};

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
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
