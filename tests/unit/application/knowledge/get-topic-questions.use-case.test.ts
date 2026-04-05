/**
 * Unit tests for GetTopicQuestionsUseCase
 */

import { NotFoundException } from '@nestjs/common';

import { GetTopicQuestionsUseCase } from '../../../../src/application/knowledge/get-topic-questions.use-case';
import { TopicRepository } from '../../../../src/domain/repositories/topic.repository';

describe('GetTopicQuestionsUseCase', () => {
  it('throws when topic is missing', async () => {
    const topicRepository = {
      getTopicQuestions: jest.fn().mockResolvedValue(null),
      listForKnowledgeMap: jest.fn(),
      getTopicPreview: jest.fn(),
      getTopicCodeTasks: jest.fn(),
    } as unknown as TopicRepository;

    const useCase = new GetTopicQuestionsUseCase(topicRepository);

    await expect(useCase.execute('x')).rejects.toThrow(NotFoundException);
  });

  it('returns questions payload', async () => {
    const data = {
      topic: {
        id: '1',
        slug: 's',
        title: 'T',
        description: null,
        order: 0,
      },
      questions: [],
    };
    const topicRepository = {
      getTopicQuestions: jest.fn().mockResolvedValue(data),
      listForKnowledgeMap: jest.fn(),
      getTopicPreview: jest.fn(),
      getTopicCodeTasks: jest.fn(),
    } as unknown as TopicRepository;

    const useCase = new GetTopicQuestionsUseCase(topicRepository);
    await expect(useCase.execute('1')).resolves.toBe(data);
  });
});
