import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RegisterUseCase } from '../../../application/auth/register.use-case';
import { TokenService } from '../../../domain/token.service';
import { UserRepository } from '../../../domain/user.repository';
import { PrismaModule } from '../../persistence/prisma/prisma.module';
import { PrismaUserRepository } from '../../persistence/user/prisma-user.repository';
import { JwtTokenService } from '../jwt-token.service';

@Module({
  imports: [
    PrismaModule,
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
    RegisterUseCase,
  ],
  exports: [RegisterUseCase],
})
export class AuthDiModule {}
