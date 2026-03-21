import { Injectable, NotFoundException } from '@nestjs/common';

import { TopicRepository } from '../../domain/repositories/topic.repository';

@Injectable()
export class GetTopicCodeTasksUseCase {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(topicId: string) {
    const codeTasks = await this.topicRepository.getTopicCodeTasks(topicId);
    if (!codeTasks) {
      throw new NotFoundException('Topic not found');
    }
    return codeTasks;
  }
}
