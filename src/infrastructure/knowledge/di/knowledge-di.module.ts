import { Module } from '@nestjs/common';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';
import { GetTopicPreviewUseCase } from '../../../application/knowledge/get-topic-preview.use-case';
import { GetTopicQuestionsUseCase } from '../../../application/knowledge/get-topic-questions.use-case';
import { TopicRepository } from '../../../domain/repositories/topic.repository';
import { PrismaModule } from '../../persistence/prisma/prisma.module';
import { PrismaTopicRepository } from '../../persistence/topic/prisma-topic.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: TopicRepository, useClass: PrismaTopicRepository },
    GetKnowledgeTopicsUseCase,
    GetTopicPreviewUseCase,
    GetTopicQuestionsUseCase,
  ],
  exports: [GetKnowledgeTopicsUseCase, GetTopicPreviewUseCase, GetTopicQuestionsUseCase],
})
export class KnowledgeDiModule {}
