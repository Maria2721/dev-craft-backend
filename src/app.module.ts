import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { AiModule } from './presentation/api/ai/ai.module';
import { AuthModule } from './presentation/api/auth/auth.module';
import { HealthController } from './presentation/api/health/health.controller';
import { KnowledgeModule } from './presentation/api/knowledge/knowledge.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 30,
      },
    ]),
    PrismaModule,
    AuthModule,
    AiModule,
    KnowledgeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
