import { Controller, Get } from '@nestjs/common';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';

@Controller('knowledge/topics')
export class KnowledgeController {
  constructor(private readonly getKnowledgeTopicsUseCase: GetKnowledgeTopicsUseCase) {}

  @Get()
  async listTopics() {
    return this.getKnowledgeTopicsUseCase.execute();
  }
}
