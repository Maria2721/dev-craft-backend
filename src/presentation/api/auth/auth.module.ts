import { Module } from '@nestjs/common';

import { AuthDiModule } from '../../../infrastructure/auth/di/auth-di.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [AuthDiModule],
  controllers: [AuthController],
})
export class AuthModule {}
