import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { LoginUseCase } from '../../../application/auth/login.use-case';
import { HandleGithubOAuthCallbackUseCase } from '../../../application/auth/oauth/handle-github-oauth-callback.use-case';
import { HandleGoogleOAuthCallbackUseCase } from '../../../application/auth/oauth/handle-google-oauth-callback.use-case';
import { OAuthAccountLinkingService } from '../../../application/auth/oauth/oauth-account-linking.service';
import { OAuthExchangeUseCase } from '../../../application/auth/oauth/oauth-exchange.use-case';
import { StartGithubOAuthUseCase } from '../../../application/auth/oauth/start-github-oauth.use-case';
import { StartGoogleOAuthUseCase } from '../../../application/auth/oauth/start-google-oauth.use-case';
import { RefreshUseCase } from '../../../application/auth/refresh.use-case';
import { RegisterUseCase } from '../../../application/auth/register.use-case';
import { OAuthRepository } from '../../../domain/repositories/oauth.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TokenService } from '../../../domain/services/token.service';
import { JwtAuthGuard } from '../../../presentation/guards/jwt-auth.guard';
import { GithubOAuthClient } from '../../oauth/github-oauth.client';
import { GoogleOAuthClient } from '../../oauth/google-oauth.client';
import { PrismaOAuthRepository } from '../../persistence/oauth/prisma-oauth.repository';
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
    { provide: OAuthRepository, useClass: PrismaOAuthRepository },
    { provide: TokenService, useClass: JwtTokenService },
    GoogleOAuthClient,
    GithubOAuthClient,
    OAuthAccountLinkingService,
    JwtStrategy,
    JwtAuthGuard,
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
    StartGoogleOAuthUseCase,
    StartGithubOAuthUseCase,
    HandleGoogleOAuthCallbackUseCase,
    HandleGithubOAuthCallbackUseCase,
    OAuthExchangeUseCase,
  ],
  exports: [
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
    JwtAuthGuard,
    StartGoogleOAuthUseCase,
    StartGithubOAuthUseCase,
    HandleGoogleOAuthCallbackUseCase,
    HandleGithubOAuthCallbackUseCase,
    OAuthExchangeUseCase,
  ],
})
export class AuthDiModule {}
