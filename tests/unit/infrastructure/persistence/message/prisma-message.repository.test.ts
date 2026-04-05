/**
 * Unit tests for PrismaMessageRepository
 */

import { PrismaMessageRepository } from '../../../../../src/infrastructure/persistence/message/prisma-message.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaMessageRepository', () => {
  it('create delegates to prisma.message.create', async () => {
    const created = { id: 'm1' };
    const prisma = {
      message: {
        create: jest.fn().mockResolvedValue(created),
        findMany: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaMessageRepository(prisma);
    const data = { conversationId: 'c', role: 'user', content: 'hi' };
    const result = await repo.create(data);

    expect(result).toBe(created);
    expect(prisma.message.create).toHaveBeenCalledWith({ data });
  });

  it('findLastByConversationId reverses chronological rows', async () => {
    const rows = [
      { id: '2', createdAt: new Date(2) },
      { id: '1', createdAt: new Date(1) },
    ];
    const prisma = {
      message: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue(rows),
      },
    } as unknown as PrismaService;

    const repo = new PrismaMessageRepository(prisma);
    const result = await repo.findLastByConversationId('conv', 10);

    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: { conversationId: 'conv' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    expect(result.map((r) => r.id)).toEqual(['1', '2']);
  });
});
