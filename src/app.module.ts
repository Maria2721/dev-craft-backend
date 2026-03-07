import { Module } from '@nestjs/common';

import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './presentation/api/auth/auth.module';
import { HealthController } from './presentation/api/health/health.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
