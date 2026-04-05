/**
 * Unit tests for SendDiscordChannelChatMessageUseCase
 */

import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Conversation, Message } from '@prisma/client';

import { SendDiscordChannelChatMessageUseCase } from '../../../../src/application/ai/send-discord-channel-chat-message.use-case';
import { ChatReplyClient } from '../../../../src/domain/clients/chat-reply.client';
import { ConversationRepository } from '../../../../src/domain/repositories/conversation.repository';
import { MessageRepository } from '../../../../src/domain/repositories/message.repository';

describe('SendDiscordChannelChatMessageUseCase', () => {
  let conversationRepository: jest.Mocked<ConversationRepository>;
  let messageRepository: jest.Mocked<MessageRepository>;
  let chatReplyClient: jest.Mocked<ChatReplyClient>;

  const conv: Conversation = {
    id: 'conv-1',
    userId: 1,
    taskId: null,
    taskType: null,
    taskTitle: null,
    difyConversationId: null,
    discordChannelId: 'ch',
    discordUserId: 'du',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const savedEnv = {
    AI_LLM_PROVIDER: process.env.AI_LLM_PROVIDER,
    DISCORD_BOT_CONVERSATION_USER_ID: process.env.DISCORD_BOT_CONVERSATION_USER_ID,
    AI_MAX_MESSAGE_LENGTH: process.env.AI_MAX_MESSAGE_LENGTH,
  };

  beforeEach(() => {
    process.env.AI_LLM_PROVIDER = 'dify_chatflow';
    process.env.DISCORD_BOT_CONVERSATION_USER_ID = '1';

    conversationRepository = {
      findByDiscordChannelAndUser: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setDifyConversationId: jest.fn(),
    } as unknown as jest.Mocked<ConversationRepository>;

    messageRepository = {
      create: jest.fn(),
      findLastByConversationId: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<MessageRepository>;

    chatReplyClient = {
      reply: jest.fn().mockResolvedValue({ reply: 'AI says hi' }),
    } as unknown as jest.Mocked<ChatReplyClient>;
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(savedEnv)) {
      const key = k as keyof typeof savedEnv;
      if (v === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = v;
      }
    }
  });

  it('throws when AI_LLM_PROVIDER is not dify_chatflow', async () => {
    process.env.AI_LLM_PROVIDER = 'other';

    const useCase = new SendDiscordChannelChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({ discordChannelId: 'c', discordUserId: 'u', message: 'hi' }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('throws when DISCORD_BOT_CONVERSATION_USER_ID is missing', async () => {
    delete process.env.DISCORD_BOT_CONVERSATION_USER_ID;

    const useCase = new SendDiscordChannelChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({ discordChannelId: 'c', discordUserId: 'u', message: 'hi' }),
    ).rejects.toThrow('Discord chat persistence is not configured');
  });

  it('throws on empty message', async () => {
    const useCase = new SendDiscordChannelChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({ discordChannelId: 'c', discordUserId: 'u', message: '   ' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('completes flow with existing conversation', async () => {
    conversationRepository.findByDiscordChannelAndUser.mockResolvedValue(conv);

    const assistantMsg = { id: 'm2' } as Message;
    messageRepository.create
      .mockResolvedValueOnce({ id: 'm1' } as Message)
      .mockResolvedValueOnce(assistantMsg);

    const useCase = new SendDiscordChannelChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    const result = await useCase.execute({
      discordChannelId: 'ch',
      discordUserId: 'du',
      message: ' Hello ',
    });

    expect(result.conversationId).toBe(conv.id);
    expect(result.messageId).toBe('m2');
    expect(result.reply).toBe('AI says hi');
    expect(chatReplyClient.reply).toHaveBeenCalled();
    expect(messageRepository.create).toHaveBeenCalledTimes(2);
  });

  it('retries conversation lookup after P2002 on create', async () => {
    conversationRepository.findByDiscordChannelAndUser
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(conv);

    const p2002 = new Prisma.PrismaClientKnownRequestError('unique', {
      code: 'P2002',
      clientVersion: 'test',
    });
    conversationRepository.create.mockRejectedValueOnce(p2002);

    messageRepository.create
      .mockResolvedValueOnce({ id: 'm1' } as Message)
      .mockResolvedValueOnce({ id: 'm2' } as Message);

    const useCase = new SendDiscordChannelChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    const result = await useCase.execute({
      discordChannelId: 'ch',
      discordUserId: 'du',
      message: 'x',
    });

    expect(result.conversationId).toBe(conv.id);
    expect(conversationRepository.findByDiscordChannelAndUser).toHaveBeenCalledTimes(2);
  });

  it('throws ServiceUnavailable when AI reply fails', async () => {
    conversationRepository.findByDiscordChannelAndUser.mockResolvedValue(conv);
    messageRepository.create.mockResolvedValue({ id: 'm1' } as Message);
    chatReplyClient.reply.mockRejectedValueOnce(new Error('down'));

    const useCase = new SendDiscordChannelChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({ discordChannelId: 'ch', discordUserId: 'du', message: 'hi' }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('persists new dify conversation id when returned', async () => {
    const convNoDify = { ...conv, difyConversationId: null };
    conversationRepository.findByDiscordChannelAndUser.mockResolvedValue(convNoDify);
    chatReplyClient.reply.mockResolvedValueOnce({
      reply: 'r',
      difyConversationId: 'new-dify',
    });
    messageRepository.create
      .mockResolvedValueOnce({ id: 'm1' } as Message)
      .mockResolvedValueOnce({ id: 'm2' } as Message);

    const useCase = new SendDiscordChannelChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    await useCase.execute({ discordChannelId: 'ch', discordUserId: 'du', message: 'hi' });

    expect(conversationRepository.setDifyConversationId).toHaveBeenCalledWith('conv-1', 'new-dify');
  });
});
