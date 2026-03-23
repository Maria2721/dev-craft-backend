import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Conversation } from '@prisma/client';

import { ChatReplyClient } from '../../domain/clients/chat-reply.client';
import { ChatMessage, ChatRole } from '../../domain/clients/llm.client';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { DEFAULT_MAX_MESSAGE_LENGTH, MAX_HISTORY_MESSAGES } from './ai-chat.constants';

export type SendChatMessageInput = {
  userId: number;
  message: string;
  conversationId?: string;
  context?: {
    taskId?: string;
    taskType?: string;
    taskTitle?: string;
    taskDescription?: string;
    codeSnippet?: string;
  };
};

export type SendChatMessageResult = {
  conversationId: string;
  messageId: string;
  reply: string;
};

function asChatRole(role: string): ChatRole {
  if (role === ChatRole.System || role === ChatRole.User || role === ChatRole.Assistant) {
    return role;
  }
  return ChatRole.System;
}

@Injectable()
export class SendChatMessageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly chatReplyClient: ChatReplyClient,
  ) {}

  async execute(input: SendChatMessageInput): Promise<SendChatMessageResult> {
    const maxLength =
      parseInt(process.env.AI_MAX_MESSAGE_LENGTH ?? String(DEFAULT_MAX_MESSAGE_LENGTH), 10) ||
      DEFAULT_MAX_MESSAGE_LENGTH;

    const trimmed = input.message.trim();
    if (!trimmed) {
      throw new BadRequestException('message must not be empty');
    }
    if (trimmed.length > maxLength) {
      throw new BadRequestException(`message must not exceed ${maxLength} characters`);
    }

    let conversation: Conversation;
    let history: ChatMessage[] = [];

    if (input.conversationId) {
      const found = await this.conversationRepository.findById(input.conversationId, input.userId);
      if (!found) {
        throw new ForbiddenException('Conversation not found or access denied');
      }
      if (found.userId !== input.userId) {
        throw new ForbiddenException('Conversation not found or access denied');
      }
      conversation = found;
      const lastMessages = await this.messageRepository.findLastByConversationId(
        conversation.id,
        MAX_HISTORY_MESSAGES,
      );
      history = lastMessages.map((m) => ({ role: asChatRole(m.role), content: m.content }));
    } else {
      conversation = await this.conversationRepository.create({
        userId: input.userId,
        taskId: input.context?.taskId,
        taskType: input.context?.taskType,
        taskTitle: input.context?.taskTitle,
      });
    }

    await this.messageRepository.create({
      conversationId: conversation.id,
      role: ChatRole.User,
      content: trimmed,
    });

    const conversationId = conversation.id;

    let reply: string;
    try {
      const out = await this.chatReplyClient.reply({
        userId: input.userId,
        message: trimmed,
        history,
        context: {
          taskTitle: input.context?.taskTitle,
          taskDescription: input.context?.taskDescription,
          codeSnippet: input.context?.codeSnippet,
        },
        difyConversationId: conversation.difyConversationId,
      });
      reply = out.reply;
      if (out.difyConversationId && conversation.difyConversationId !== out.difyConversationId) {
        await this.conversationRepository.setDifyConversationId(
          conversationId,
          out.difyConversationId,
        );
      }
    } catch {
      throw new ServiceUnavailableException('AI service temporarily unavailable');
    }

    const assistantMessage = await this.messageRepository.create({
      conversationId,
      role: ChatRole.Assistant,
      content: reply,
    });

    return {
      conversationId,
      messageId: assistantMessage.id,
      reply,
    };
  }
}
