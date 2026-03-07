import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { TokenService } from '../../domain/token.service';
import { UserRepository } from '../../domain/user.repository';

export type RegisterDto = {
  email: string;
  password: string;
  name: string;
  surname: string;
};

export type AuthResponse = {
  user: { id: number; email: string; name: string; surname: string; createdAt: Date };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      surname: dto.surname,
    });

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
