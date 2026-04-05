/**
 * Unit tests for PrismaCodeTaskAttemptRepository
 */

import { PrismaCodeTaskAttemptRepository } from '../../../../../src/infrastructure/persistence/code-task-attempt/prisma-code-task-attempt.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaCodeTaskAttemptRepository', () => {
  it('create returns new id', async () => {
    const prisma = {
      codeTaskAttempt: {
        create: jest.fn().mockResolvedValue({ id: 'a1' }),
      },
    } as unknown as PrismaService;

    const repo = new PrismaCodeTaskAttemptRepository(prisma);
    const result = await repo.create({
      userId: 1,
      topicId: 't',
      codeTaskId: 'c',
      valid: true,
      hints: null,
      justification: null,
      improvements: null,
    });

    expect(result).toEqual({ id: 'a1' });
    expect(prisma.codeTaskAttempt.create).toHaveBeenCalled();
  });
});
