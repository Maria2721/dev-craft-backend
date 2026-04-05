import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { LoginUseCase } from '../../../application/auth/login.use-case';
import { HandleGithubOAuthCallbackUseCase } from '../../../application/auth/oauth/handle-github-oauth-callback.use-case';
import { HandleGoogleOAuthCallbackUseCase } from '../../../application/auth/oauth/handle-google-oauth-callback.use-case';
import { OAuthExchangeUseCase } from '../../../application/auth/oauth/oauth-exchange.use-case';
import { StartGithubOAuthUseCase } from '../../../application/auth/oauth/start-github-oauth.use-case';
import { StartGoogleOAuthUseCase } from '../../../application/auth/oauth/start-google-oauth.use-case';
import { RefreshUseCase } from '../../../application/auth/refresh.use-case';
import { RegisterUseCase } from '../../../application/auth/register.use-case';
import { LoginDto } from './dto/login.dto';
import { OAuthExchangeDto } from './dto/oauth-exchange.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly startGoogleOAuthUseCase: StartGoogleOAuthUseCase,
    private readonly handleGoogleOAuthCallbackUseCase: HandleGoogleOAuthCallbackUseCase,
    private readonly startGithubOAuthUseCase: StartGithubOAuthUseCase,
    private readonly handleGithubOAuthCallbackUseCase: HandleGithubOAuthCallbackUseCase,
    private readonly oauthExchangeUseCase: OAuthExchangeUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 3_600_000, limit: 25 } })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    return this.refreshUseCase.execute(dto);
  }

  @Get('google')
  async startGoogle(@Res() res: Response) {
    const url = await this.startGoogleOAuthUseCase.execute();
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    if (error) {
      const base = process.env.FRONTEND_OAUTH_REDIRECT ?? 'http://localhost:5173/auth/callback';
      const u = new URL(base);
      u.searchParams.set('error', 'oauth_denied');
      return res.redirect(u.toString());
    }
    const redirectUrl = await this.handleGoogleOAuthCallbackUseCase.execute({ code, state });
    return res.redirect(redirectUrl);
  }

  @Get('github')
  async startGithub(@Res() res: Response) {
    const url = await this.startGithubOAuthUseCase.execute();
    return res.redirect(url);
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    if (error) {
      const base = process.env.FRONTEND_OAUTH_REDIRECT ?? 'http://localhost:5173/auth/callback';
      const u = new URL(base);
      u.searchParams.set('error', 'oauth_denied');
      return res.redirect(u.toString());
    }
    const redirectUrl = await this.handleGithubOAuthCallbackUseCase.execute({ code, state });
    return res.redirect(redirectUrl);
  }

  @Post('oauth/exchange')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async oauthExchange(@Body() dto: OAuthExchangeDto) {
    return this.oauthExchangeUseCase.execute(dto.code);
  }
}
