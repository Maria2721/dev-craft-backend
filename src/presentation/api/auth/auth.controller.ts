import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { RegisterUseCase } from '../../../application/auth/register.use-case';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }
}
