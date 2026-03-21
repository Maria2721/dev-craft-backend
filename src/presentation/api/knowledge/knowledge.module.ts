import { Module } from '@nestjs/common';

import { KnowledgeDiModule } from '../../../infrastructure/knowledge/di/knowledge-di.module';
import { KnowledgeController } from './knowledge.controller';

@Module({
  imports: [KnowledgeDiModule],
  controllers: [KnowledgeController],
})
export class KnowledgeModule {}
