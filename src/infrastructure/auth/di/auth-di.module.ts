import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { LoginUseCase } from '../../../application/auth/login.use-case';
import { RefreshUseCase } from '../../../application/auth/refresh.use-case';
import { RegisterUseCase } from '../../../application/auth/register.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenService } from '../../../domain/services/token.service';
import { JwtAuthGuard } from '../../../presentation/guards/jwt-auth.guard';
import { PrismaModule } from '../../persistence/prisma/prisma.module';
import { PrismaUserRepository } from '../../persistence/user/prisma-user.repository';
import { JwtStrategy } from '../jwt.strategy';
import { JwtTokenService } from '../jwt-token.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET ?? 'default-secret-change-in-production',
      signOptions: {
        expiresIn: parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10),
      },
    }),
  ],
  providers: [
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: TokenService, useClass: JwtTokenService },
    JwtStrategy,
    JwtAuthGuard,
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
  ],
  exports: [RegisterUseCase, LoginUseCase, RefreshUseCase, JwtAuthGuard],
})
export class AuthDiModule {}
