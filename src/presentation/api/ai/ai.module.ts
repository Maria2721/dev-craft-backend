import { Module } from '@nestjs/common';

import { AiDiModule } from '../../../infrastructure/ai/di/ai-di.module';
import { AuthDiModule } from '../../../infrastructure/auth/di/auth-di.module';
import { AiController } from './ai.controller';

@Module({
  imports: [AuthDiModule, AiDiModule],
  controllers: [AiController],
})
export class AiModule {}
