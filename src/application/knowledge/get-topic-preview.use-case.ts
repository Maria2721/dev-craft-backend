import { Injectable, NotFoundException } from '@nestjs/common';

import { TopicRepository } from '../../domain/repositories/topic.repository';

@Injectable()
export class GetTopicPreviewUseCase {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(topicId: string) {
    const preview = await this.topicRepository.getTopicPreview(topicId);
    if (!preview) {
      throw new NotFoundException('Topic not found');
    }
    return preview;
  }
}
