/**
 * Unit tests for GetKnowledgeTopicsUseCase
 */

import { GetKnowledgeTopicsUseCase } from '../../../../src/application/knowledge/get-knowledge-topics.use-case';
import {
  TopicListItem,
  TopicRepository,
} from '../../../../src/domain/repositories/topic.repository';

describe('GetKnowledgeTopicsUseCase', () => {
  it('delegates to topicRepository.listForKnowledgeMap', async () => {
    const items: TopicListItem[] = [
      {
        id: '1',
        slug: 'js',
        title: 'JS',
        description: null,
        order: 0,
        questionsCount: 1,
        codeTasksCount: 2,
      },
    ];
    const topicRepository = {
      listForKnowledgeMap: jest.fn().mockResolvedValue(items),
      getTopicPreview: jest.fn(),
      getTopicQuestions: jest.fn(),
      getTopicCodeTasks: jest.fn(),
    } as unknown as TopicRepository;

    const useCase = new GetKnowledgeTopicsUseCase(topicRepository);
    const result = await useCase.execute();

    expect(topicRepository.listForKnowledgeMap).toHaveBeenCalled();
    expect(result).toBe(items);
  });
});
