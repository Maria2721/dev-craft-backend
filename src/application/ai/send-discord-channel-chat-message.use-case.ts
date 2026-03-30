import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Conversation } from '@prisma/client';

import { ChatReplyClient } from '../../domain/clients/chat-reply.client';
import { ChatMessage, ChatRole } from '../../domain/clients/llm.client';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import {
  DIFY_INPUT_DEVCRAFT_USER_ID_KEY,
  DIFY_INPUT_MESSAGE_SOURCE_KEY,
  DIFY_MESSAGE_SOURCE_DISCORD,
} from '../../infrastructure/llm/dify-chatflow.constants';
import { DEFAULT_MAX_MESSAGE_LENGTH, MAX_HISTORY_MESSAGES } from './ai-chat.constants';

export type SendDiscordChannelChatMessageInput = {
  discordChannelId: string;
  discordUserId: string;
  message: string;
};

export type SendDiscordChannelChatMessageResult = {
  conversationId: string;
  messageId: string;
  reply: string;
};

@Injectable()
export class SendDiscordChannelChatMessageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly chatReplyClient: ChatReplyClient,
  ) {}

  private asChatRole(role: string): ChatRole {
    if (role === ChatRole.System || role === ChatRole.User || role === ChatRole.Assistant) {
      return role;
    }
    return ChatRole.System;
  }

  private discordSystemUserId(): number {
    const raw = process.env.DISCORD_BOT_CONVERSATION_USER_ID?.trim();
    if (!raw) {
      throw new ServiceUnavailableException('Discord chat persistence is not configured');
    }
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) {
      throw new ServiceUnavailableException('Invalid DISCORD_BOT_CONVERSATION_USER_ID');
    }
    return n;
  }

  private assertDifyChatflowProvider(): void {
    if (process.env.AI_LLM_PROVIDER !== 'dify_chatflow') {
      throw new ServiceUnavailableException(
        'Discord channel chat requires AI_LLM_PROVIDER=dify_chatflow',
      );
    }
  }

  private maxUserMessageLength(): number {
    return (
      parseInt(process.env.AI_MAX_MESSAGE_LENGTH ?? String(DEFAULT_MAX_MESSAGE_LENGTH), 10) ||
      DEFAULT_MAX_MESSAGE_LENGTH
    );
  }

  private requireNonEmptyTrimmedMessage(message: string, maxLength: number): string {
    const trimmed = message.trim();
    if (!trimmed) {
      throw new BadRequestException('message must not be empty');
    }
    if (trimmed.length > maxLength) {
      throw new BadRequestException(`message must not exceed ${maxLength} characters`);
    }
    return trimmed;
  }

  private async resolveOrCreateDiscordConversation(
    input: SendDiscordChannelChatMessageInput,
    systemUserId: number,
  ): Promise<Conversation> {
    let conversation: Conversation | null =
      await this.conversationRepository.findByDiscordChannelAndUser(
        input.discordChannelId,
        input.discordUserId,
      );

    if (!conversation) {
      try {
        conversation = await this.conversationRepository.create({
          userId: systemUserId,
          discordChannelId: input.discordChannelId,
          discordUserId: input.discordUserId,
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          conversation = await this.conversationRepository.findByDiscordChannelAndUser(
            input.discordChannelId,
            input.discordUserId,
          );
        } else {
          throw e;
        }
      }
    }

    if (!conversation) {
      throw new ServiceUnavailableException('Could not resolve Discord conversation');
    }

    return conversation;
  }

  private async loadRecentHistory(conversationId: string): Promise<ChatMessage[]> {
    const lastMessages = await this.messageRepository.findLastByConversationId(
      conversationId,
      MAX_HISTORY_MESSAGES,
    );
    return lastMessages.map((m) => ({
      role: this.asChatRole(m.role),
      content: m.content,
    }));
  }

  private async completeWithAssistantReply(
    conversation: Conversation,
    systemUserId: number,
    trimmed: string,
    history: ChatMessage[],
    discordUserId: string,
  ): Promise<string> {
    const conversationId = conversation.id;
    const difyEndUser = `discord-${discordUserId}`;
    try {
      const out = await this.chatReplyClient.reply({
        userId: systemUserId,
        message: trimmed,
        history,
        difyConversationId: conversation.difyConversationId,
        difyEndUser,
        difyInputOverrides: {
          [DIFY_INPUT_MESSAGE_SOURCE_KEY]: DIFY_MESSAGE_SOURCE_DISCORD,
          [DIFY_INPUT_DEVCRAFT_USER_ID_KEY]: 0,
        },
      });
      if (out.difyConversationId && conversation.difyConversationId !== out.difyConversationId) {
        await this.conversationRepository.setDifyConversationId(
          conversationId,
          out.difyConversationId,
        );
      }
      return out.reply;
    } catch {
      throw new ServiceUnavailableException('AI service temporarily unavailable');
    }
  }

  async execute(
    input: SendDiscordChannelChatMessageInput,
  ): Promise<SendDiscordChannelChatMessageResult> {
    this.assertDifyChatflowProvider();

    const systemUserId = this.discordSystemUserId();
    const trimmed = this.requireNonEmptyTrimmedMessage(input.message, this.maxUserMessageLength());

    const conversation = await this.resolveOrCreateDiscordConversation(input, systemUserId);
    const history = await this.loadRecentHistory(conversation.id);

    await this.messageRepository.create({
      conversationId: conversation.id,
      role: ChatRole.User,
      content: trimmed,
    });

    const reply = await this.completeWithAssistantReply(
      conversation,
      systemUserId,
      trimmed,
      history,
      input.discordUserId,
    );

    const assistantMessage = await this.messageRepository.create({
      conversationId: conversation.id,
      role: ChatRole.Assistant,
      content: reply,
    });

    return {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      reply,
    };
  }
}
