import { Injectable } from '@nestjs/common';

import { TopicRepository } from '../../domain/repositories/topic.repository';

@Injectable()
export class GetKnowledgeTopicsUseCase {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute() {
    return this.topicRepository.listForKnowledgeMap();
  }
}
