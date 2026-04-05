/**
 * Unit tests for GetTopicCodeTasksUseCase
 */

import { NotFoundException } from '@nestjs/common';

import { GetTopicCodeTasksUseCase } from '../../../../src/application/knowledge/get-topic-code-tasks.use-case';
import { TopicRepository } from '../../../../src/domain/repositories/topic.repository';

describe('GetTopicCodeTasksUseCase', () => {
  it('throws when topic has no code tasks payload', async () => {
    const topicRepository = {
      getTopicCodeTasks: jest.fn().mockResolvedValue(null),
      listForKnowledgeMap: jest.fn(),
      getTopicPreview: jest.fn(),
      getTopicQuestions: jest.fn(),
    } as unknown as TopicRepository;

    const useCase = new GetTopicCodeTasksUseCase(topicRepository);

    await expect(useCase.execute('x')).rejects.toThrow(NotFoundException);
  });

  it('returns data when present', async () => {
    const data = {
      topic: {
        id: '1',
        slug: 's',
        title: 'T',
        description: null,
        order: 0,
      },
      codeTasks: [],
    };
    const topicRepository = {
      getTopicCodeTasks: jest.fn().mockResolvedValue(data),
      listForKnowledgeMap: jest.fn(),
      getTopicPreview: jest.fn(),
      getTopicQuestions: jest.fn(),
    } as unknown as TopicRepository;

    const useCase = new GetTopicCodeTasksUseCase(topicRepository);
    await expect(useCase.execute('1')).resolves.toBe(data);
  });
});
