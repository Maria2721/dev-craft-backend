/**
 * Unit tests for PrismaQuestionRepository
 */

import { PrismaQuestionRepository } from '../../../../../src/infrastructure/persistence/question/prisma-question.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaQuestionRepository', () => {
  it('returns empty array when questionIds is empty', async () => {
    const prisma = {
      question: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaQuestionRepository(prisma);
    const result = await repo.findForAttempts('t', []);

    expect(result).toEqual([]);
    expect(prisma.question.findMany).not.toHaveBeenCalled();
  });

  it('maps options to correctOptionIds', async () => {
    const prisma = {
      question: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'q1',
            options: [{ id: 'o1' }, { id: 'o2' }],
          },
        ]),
        count: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaQuestionRepository(prisma);
    const result = await repo.findForAttempts('t', ['q1']);

    expect(result).toEqual([{ id: 'q1', correctOptionIds: ['o1', 'o2'] }]);
  });

  it('countByTopic delegates to prisma', async () => {
    const prisma = {
      question: {
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(7),
      },
    } as unknown as PrismaService;

    const repo = new PrismaQuestionRepository(prisma);
    await expect(repo.countByTopic('tid')).resolves.toBe(7);
  });
});
