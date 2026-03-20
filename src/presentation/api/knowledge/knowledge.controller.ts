import { Controller, Get, Param } from '@nestjs/common';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';
import { GetTopicPreviewUseCase } from '../../../application/knowledge/get-topic-preview.use-case';

@Controller('knowledge/topics')
export class KnowledgeController {
  constructor(
    private readonly getKnowledgeTopicsUseCase: GetKnowledgeTopicsUseCase,
    private readonly getTopicPreviewUseCase: GetTopicPreviewUseCase,
  ) {}

  @Get()
  async listTopics() {
    return this.getKnowledgeTopicsUseCase.execute();
  }

  @Get(':topicId/preview')
  async getTopicPreview(@Param('topicId') topicId: string) {
    return this.getTopicPreviewUseCase.execute(topicId);
  }
}
