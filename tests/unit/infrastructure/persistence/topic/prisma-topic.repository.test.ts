/**
 * Unit tests for PrismaTopicRepository
 */

import { PrismaTopicRepository } from '../../../../../src/infrastructure/persistence/topic/prisma-topic.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaTopicRepository', () => {
  it('listForKnowledgeMap maps counts', async () => {
    const prisma = {
      topic: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            slug: 'js',
            title: 'JS',
            description: null,
            order: 0,
            _count: { questions: 2, codeTasks: 3 },
          },
        ]),
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaTopicRepository(prisma);
    const list = await repo.listForKnowledgeMap();

    expect(list).toEqual([
      {
        id: '1',
        slug: 'js',
        title: 'JS',
        description: null,
        order: 0,
        questionsCount: 2,
        codeTasksCount: 3,
      },
    ]);
  });

  it('getTopicPreview returns null when topic missing', async () => {
    const prisma = {
      topic: {
        findMany: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    const repo = new PrismaTopicRepository(prisma);
    await expect(repo.getTopicPreview('missing')).resolves.toBeNull();
  });

  it('getTopicPreview maps questions and code tasks', async () => {
    const prisma = {
      topic: {
        findMany: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({
          id: 't1',
          slug: 's',
          title: 'T',
          description: 'D',
          order: 1,
          questions: [{ id: 'q1', prompt: 'P', order: 0 }],
          codeTasks: [
            {
              id: 'c1',
              title: 'CT',
              description: 'CD',
              taskType: 'AI_CHECK',
              order: 0,
            },
          ],
        }),
      },
    } as unknown as PrismaService;

    const repo = new PrismaTopicRepository(prisma);
    const preview = await repo.getTopicPreview('t1');

    expect(preview?.topic.id).toBe('t1');
    expect(preview?.questions).toHaveLength(1);
    expect(preview?.codeTasks[0].taskType).toBe('AI_CHECK');
  });

  it('getTopicQuestions maps options and correctOptionIds', async () => {
    const prisma = {
      topic: {
        findMany: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({
          id: 't1',
          slug: 's',
          title: 'T',
          description: null,
          order: 0,
          questions: [
            {
              id: 'q1',
              prompt: 'P',
              codeSnippet: null,
              order: 0,
              options: [
                { id: 'o1', label: 'A', text: 't1', order: 0, isCorrect: true },
                { id: 'o2', label: 'B', text: 't2', order: 1, isCorrect: false },
              ],
            },
          ],
        }),
      },
    } as unknown as PrismaService;

    const repo = new PrismaTopicRepository(prisma);
    const data = await repo.getTopicQuestions('t1');

    expect(data?.questions[0].correctOptionIds).toEqual(['o1']);
    expect(data?.questions[0].options).toHaveLength(2);
  });

  it('getTopicCodeTasks hides reference for non-DRAG_DROP', async () => {
    const prisma = {
      topic: {
        findMany: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({
          id: 't1',
          slug: 's',
          title: 'T',
          description: null,
          order: 0,
          codeTasks: [
            {
              id: 'c1',
              title: 'CT',
              description: 'CD',
              taskType: 'AI_CHECK',
              referenceSolution: 'secret',
              order: 0,
            },
            {
              id: 'c2',
              title: 'DD',
              description: 'd',
              taskType: 'DRAG_DROP',
              referenceSolution: 'ref',
              order: 1,
            },
          ],
        }),
      },
    } as unknown as PrismaService;

    const repo = new PrismaTopicRepository(prisma);
    const data = await repo.getTopicCodeTasks('t1');

    expect(data?.codeTasks[0].referenceSolution).toBeNull();
    expect(data?.codeTasks[1].referenceSolution).toBe('ref');
  });
});
