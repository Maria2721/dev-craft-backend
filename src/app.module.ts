import { Module } from '@nestjs/common';

import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { AiModule } from './presentation/api/ai/ai.module';
import { AuthModule } from './presentation/api/auth/auth.module';
import { HealthController } from './presentation/api/health/health.controller';

@Module({
  imports: [PrismaModule, AuthModule, AiModule],
  controllers: [HealthController],
})
export class AppModule {}
