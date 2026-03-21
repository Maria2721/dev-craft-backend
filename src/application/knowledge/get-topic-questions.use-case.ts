import { Injectable, NotFoundException } from '@nestjs/common';

import { TopicRepository } from '../../domain/repositories/topic.repository';

@Injectable()
export class GetTopicQuestionsUseCase {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(topicId: string) {
    const questions = await this.topicRepository.getTopicQuestions(topicId);
    if (!questions) {
      throw new NotFoundException('Topic not found');
    }
    return questions;
  }
}
