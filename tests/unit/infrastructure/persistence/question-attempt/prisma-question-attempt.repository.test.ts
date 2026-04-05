/**
 * Unit tests for PrismaQuestionAttemptRepository
 */

import { PrismaQuestionAttemptRepository } from '../../../../../src/infrastructure/persistence/question-attempt/prisma-question-attempt.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaQuestionAttemptRepository', () => {
  it('createMany no-ops on empty input', async () => {
    const prisma = {
      questionAttempt: {
        createMany: jest.fn(),
        count: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaQuestionAttemptRepository(prisma);
    await repo.createMany([]);

    expect(prisma.questionAttempt.createMany).not.toHaveBeenCalled();
  });

  it('createMany maps inputs', async () => {
    const prisma = {
      questionAttempt: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaQuestionAttemptRepository(prisma);
    await repo.createMany([
      {
        userId: 1,
        topicId: 't',
        questionId: 'q',
        selectedOptionIds: ['a'],
        isCorrect: true,
      },
    ]);

    expect(prisma.questionAttempt.createMany).toHaveBeenCalledWith({
      data: [
        {
          userId: 1,
          topicId: 't',
          questionId: 'q',
          selectedOptionIds: ['a'],
          isCorrect: true,
        },
      ],
    });
  });

  it('getTopicStats returns counts', async () => {
    const prisma = {
      questionAttempt: {
        createMany: jest.fn(),
        count: jest.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(2),
      },
    } as unknown as PrismaService;

    const repo = new PrismaQuestionAttemptRepository(prisma);
    const stats = await repo.getTopicStats(1, 't');

    expect(stats).toEqual({ attempted: 3, correct: 2 });
  });
});
