/**
 * Unit tests for PrismaConversationRepository
 */

import { PrismaConversationRepository } from '../../../../../src/infrastructure/persistence/conversation/prisma-conversation.repository';
import { PrismaService } from '../../../../../src/infrastructure/persistence/prisma/prisma.service';

describe('PrismaConversationRepository', () => {
  it('findById without userId uses id only', async () => {
    const conv = { id: 'c1' };
    const prisma = {
      conversation: {
        findFirst: jest.fn().mockResolvedValue(conv),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaConversationRepository(prisma);
    const result = await repo.findById('c1');

    expect(result).toBe(conv);
    expect(prisma.conversation.findFirst).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });

  it('findById with userId adds filter', async () => {
    const prisma = {
      conversation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaConversationRepository(prisma);
    await repo.findById('c1', 5);

    expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
      where: { id: 'c1', userId: 5 },
    });
  });

  it('findByDiscordChannelAndUser delegates to findFirst', async () => {
    const prisma = {
      conversation: {
        findFirst: jest.fn().mockResolvedValue({ id: 'c' }),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as PrismaService;

    const repo = new PrismaConversationRepository(prisma);
    await repo.findByDiscordChannelAndUser('ch', 'usr');

    expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
      where: { discordChannelId: 'ch', discordUserId: 'usr' },
    });
  });

  it('setDifyConversationId updates row', async () => {
    const prisma = {
      conversation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as PrismaService;

    const repo = new PrismaConversationRepository(prisma);
    await repo.setDifyConversationId('c1', 'dify-1');

    expect(prisma.conversation.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { difyConversationId: 'dify-1' },
    });
  });
});
