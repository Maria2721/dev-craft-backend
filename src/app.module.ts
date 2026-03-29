import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { AiModule } from './presentation/api/ai/ai.module';
import { AuthModule } from './presentation/api/auth/auth.module';
import { HealthController } from './presentation/api/health/health.controller';
import { InternalModule } from './presentation/api/internal/internal.module';
import { KnowledgeModule } from './presentation/api/knowledge/knowledge.module';
import { McpModule } from './presentation/api/mcp/mcp.module';

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
    InternalModule,
    KnowledgeModule,
    McpModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
