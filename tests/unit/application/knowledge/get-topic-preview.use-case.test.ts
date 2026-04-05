/**
 * Unit tests for GetTopicPreviewUseCase
 */

import { NotFoundException } from '@nestjs/common';

import { GetTopicPreviewUseCase } from '../../../../src/application/knowledge/get-topic-preview.use-case';
import { TopicRepository } from '../../../../src/domain/repositories/topic.repository';

describe('GetTopicPreviewUseCase', () => {
  it('throws when topic is missing', async () => {
    const topicRepository = {
      getTopicPreview: jest.fn().mockResolvedValue(null),
      listForKnowledgeMap: jest.fn(),
      getTopicQuestions: jest.fn(),
      getTopicCodeTasks: jest.fn(),
    } as unknown as TopicRepository;

    const useCase = new GetTopicPreviewUseCase(topicRepository);

    await expect(useCase.execute('tid')).rejects.toThrow(NotFoundException);
    await expect(useCase.execute('tid')).rejects.toThrow('Topic not found');
  });

  it('returns preview when found', async () => {
    const preview = {
      topic: {
        id: '1',
        slug: 's',
        title: 'T',
        description: null,
        order: 0,
      },
      questions: [],
      codeTasks: [],
    };
    const topicRepository = {
      getTopicPreview: jest.fn().mockResolvedValue(preview),
      listForKnowledgeMap: jest.fn(),
      getTopicQuestions: jest.fn(),
      getTopicCodeTasks: jest.fn(),
    } as unknown as TopicRepository;

    const useCase = new GetTopicPreviewUseCase(topicRepository);
    const result = await useCase.execute('1');

    expect(result).toBe(preview);
  });
});
