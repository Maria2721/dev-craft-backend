/**
 * Unit tests for SubmitTopicQuestionAttemptsUseCase
 */

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SubmitTopicQuestionAttemptsUseCase } from '../../../../src/application/knowledge/submit-topic-question-attempts.use-case';
import { QuestionAttemptRepository } from '../../../../src/domain/repositories/question-attempt.repository';
import { QuestionRepository } from '../../../../src/domain/repositories/question.repository';

describe('SubmitTopicQuestionAttemptsUseCase', () => {
  let questionRepository: jest.Mocked<QuestionRepository>;
  let questionAttemptRepository: jest.Mocked<QuestionAttemptRepository>;

  beforeEach(() => {
    questionRepository = {
      findForAttempts: jest.fn(),
      countByTopic: jest.fn(),
    } as unknown as jest.Mocked<QuestionRepository>;

    questionAttemptRepository = {
      createMany: jest.fn().mockResolvedValue(undefined),
      getTopicStats: jest.fn().mockResolvedValue({ attempted: 2, correct: 1 }),
    } as unknown as jest.Mocked<QuestionAttemptRepository>;
  });

  it('throws NotFound when topic has no questions', async () => {
    questionRepository.countByTopic.mockResolvedValue(0);

    const useCase = new SubmitTopicQuestionAttemptsUseCase(
      questionRepository,
      questionAttemptRepository,
    );

    await expect(useCase.execute({ userId: 1, topicId: 't', attempts: [] })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequest when question id not in topic', async () => {
    questionRepository.countByTopic.mockResolvedValue(2);
    questionRepository.findForAttempts.mockResolvedValue([{ id: 'q1', correctOptionIds: ['a'] }]);

    const useCase = new SubmitTopicQuestionAttemptsUseCase(
      questionRepository,
      questionAttemptRepository,
    );

    await expect(
      useCase.execute({
        userId: 1,
        topicId: 't',
        attempts: [{ questionId: 'missing', selectedOptionIds: ['a'] }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('grades attempts and persists', async () => {
    questionRepository.countByTopic.mockResolvedValue(2);
    questionRepository.findForAttempts.mockResolvedValue([
      { id: 'q1', correctOptionIds: ['a', 'b'] },
      { id: 'q2', correctOptionIds: ['x'] },
    ]);

    const useCase = new SubmitTopicQuestionAttemptsUseCase(
      questionRepository,
      questionAttemptRepository,
    );

    const result = await useCase.execute({
      userId: 5,
      topicId: 'top',
      attempts: [
        { questionId: 'q1', selectedOptionIds: ['b', 'a'] },
        { questionId: 'q2', selectedOptionIds: ['y'] },
      ],
    });

    expect(result.results[0].isCorrect).toBe(true);
    expect(result.results[1].isCorrect).toBe(false);
    expect(result.summary.submitted).toBe(2);
    expect(result.summary.correct).toBe(1);
    expect(questionAttemptRepository.createMany).toHaveBeenCalled();
    expect(result.topicProgress.totalQuestions).toBe(2);
  });
});
