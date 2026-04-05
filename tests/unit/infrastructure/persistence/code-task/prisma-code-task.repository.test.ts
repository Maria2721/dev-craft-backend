/**
 * Unit tests for PrismaCodeTaskRepository
 */

import { PrismaCodeTaskRepository } from '../../../../../src/infrastructure/persistence/code-task/prisma-code-task.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaCodeTaskRepository', () => {
  it('returns null when prisma finds nothing', async () => {
    const prisma = {
      codeTask: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    const repo = new PrismaCodeTaskRepository(prisma);
    const result = await repo.findInTopic('t1', 'ct1');

    expect(result).toBeNull();
  });

  it('maps row to CodeTaskForAiCheck', async () => {
    const prisma = {
      codeTask: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'ct',
          title: 'Title',
          description: 'Desc',
          taskType: 'AI_CHECK',
          referenceSolution: 'sol',
        }),
      },
    } as unknown as PrismaService;

    const repo = new PrismaCodeTaskRepository(prisma);
    const result = await repo.findInTopic('t', 'ct');

    expect(result).toEqual({
      id: 'ct',
      title: 'Title',
      description: 'Desc',
      taskType: 'AI_CHECK',
      referenceSolution: 'sol',
    });
  });
});
