/**
 * Unit tests for SendChatMessageUseCase
 */

import {
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { SendChatMessageUseCase } from '../../../../src/application/ai/send-chat-message.use-case';
import { ChatReplyClient } from '../../../../src/domain/clients/chat-reply.client';
import { ConversationRepository } from '../../../../src/domain/repositories/conversation.repository';
import { MessageRepository } from '../../../../src/domain/repositories/message.repository';
import { Conversation, Message } from '@prisma/client';

describe('SendChatMessageUseCase', () => {
  const convId = 'conv-1';
  const mockConversation: Conversation = {
    id: convId,
    userId: 1,
    taskId: null,
    taskType: null,
    taskTitle: null,
    difyConversationId: null,
    discordChannelId: null,
    discordUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockMessage = (id: string): Message =>
    ({
      id,
      conversationId: convId,
      role: 'assistant',
      content: 'Reply',
      createdAt: new Date(),
    }) as Message;

  let conversationRepository: jest.Mocked<ConversationRepository>;
  let messageRepository: jest.Mocked<MessageRepository>;
  let chatReplyClient: jest.Mocked<ChatReplyClient>;

  beforeEach(() => {
    conversationRepository = {
      findById: jest.fn(),
      findByDiscordChannelAndUser: jest.fn(),
      create: jest.fn(),
      setDifyConversationId: jest.fn(),
    } as unknown as jest.Mocked<ConversationRepository>;

    messageRepository = {
      create: jest.fn(),
      findLastByConversationId: jest.fn(),
    } as unknown as jest.Mocked<MessageRepository>;

    chatReplyClient = {
      reply: jest.fn().mockResolvedValue({ reply: 'AI reply' }),
    } as unknown as jest.Mocked<ChatReplyClient>;

    delete process.env.AI_MAX_MESSAGE_LENGTH;
  });

  it('throws BadRequestException when message is empty', async () => {
    const useCase = new SendChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    await expect(useCase.execute({ userId: 1, message: '   ' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(useCase.execute({ userId: 1, message: '   ' })).rejects.toThrow(
      'message must not be empty',
    );

    expect(conversationRepository.create).not.toHaveBeenCalled();
    expect(chatReplyClient.reply).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when message exceeds length limit', async () => {
    const useCase = new SendChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );
    const longMessage = 'a'.repeat(4001);

    await expect(useCase.execute({ userId: 1, message: longMessage })).rejects.toThrow(
      BadRequestException,
    );
    await expect(useCase.execute({ userId: 1, message: longMessage })).rejects.toThrow(
      /must not exceed 4000 characters/,
    );
  });

  it('throws ForbiddenException when conversationId is given but conversation not found', async () => {
    conversationRepository.findById.mockResolvedValue(null);

    const useCase = new SendChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({
        userId: 1,
        message: 'Hello',
        conversationId: 'missing-conv',
      }),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      useCase.execute({
        userId: 1,
        message: 'Hello',
        conversationId: 'missing-conv',
      }),
    ).rejects.toThrow('Conversation not found or access denied');
  });

  it('creates new conversation and returns reply when message is valid and no conversationId', async () => {
    conversationRepository.create.mockResolvedValue(mockConversation);
    messageRepository.create
      .mockResolvedValueOnce(createMockMessage('msg-user'))
      .mockResolvedValueOnce(createMockMessage('msg-assistant'));

    const useCase = new SendChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    const result = await useCase.execute({
      userId: 1,
      message: 'Hello',
    });

    expect(conversationRepository.create).toHaveBeenCalledWith({
      userId: 1,
      taskId: undefined,
      taskType: undefined,
      taskTitle: undefined,
    });
    expect(chatReplyClient.reply).toHaveBeenCalled();
    expect(result).toEqual({
      conversationId: convId,
      messageId: 'msg-assistant',
      reply: 'AI reply',
    });
  });

  it('throws ServiceUnavailableException when LLM fails', async () => {
    conversationRepository.create.mockResolvedValue(mockConversation);
    messageRepository.create.mockResolvedValue(createMockMessage('msg-user'));
    chatReplyClient.reply.mockRejectedValue(new Error('Network error'));

    const useCase = new SendChatMessageUseCase(
      conversationRepository,
      messageRepository,
      chatReplyClient,
    );

    await expect(useCase.execute({ userId: 1, message: 'Hello' })).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(useCase.execute({ userId: 1, message: 'Hello' })).rejects.toThrow(
      'AI service temporarily unavailable',
    );
  });
});
