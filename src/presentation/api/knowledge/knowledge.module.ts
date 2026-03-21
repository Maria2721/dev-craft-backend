import { Module } from '@nestjs/common';

import { AuthDiModule } from '../../../infrastructure/auth/di/auth-di.module';
import { KnowledgeDiModule } from '../../../infrastructure/knowledge/di/knowledge-di.module';
import { KnowledgeController } from './knowledge.controller';

@Module({
  imports: [KnowledgeDiModule, AuthDiModule],
  controllers: [KnowledgeController],
})
export class KnowledgeModule {}
