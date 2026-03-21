import { Controller, Get, Param } from '@nestjs/common';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';
import { GetTopicPreviewUseCase } from '../../../application/knowledge/get-topic-preview.use-case';
import { GetTopicQuestionsUseCase } from '../../../application/knowledge/get-topic-questions.use-case';

@Controller('knowledge/topics')
export class KnowledgeController {
  constructor(
    private readonly getKnowledgeTopicsUseCase: GetKnowledgeTopicsUseCase,
    private readonly getTopicPreviewUseCase: GetTopicPreviewUseCase,
    private readonly getTopicQuestionsUseCase: GetTopicQuestionsUseCase,
  ) {}

  @Get()
  async listTopics() {
    return this.getKnowledgeTopicsUseCase.execute();
  }

  @Get(':topicId/preview')
  async getTopicPreview(@Param('topicId') topicId: string) {
    return this.getTopicPreviewUseCase.execute(topicId);
  }

  @Get(':topicId/questions')
  async getTopicQuestions(@Param('topicId') topicId: string) {
    return this.getTopicQuestionsUseCase.execute(topicId);
  }
}
