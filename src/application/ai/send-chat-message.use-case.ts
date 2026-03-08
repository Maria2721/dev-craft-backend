import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import { ChatMessage, LlmClient } from '../../domain/clients/llm.client';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../domain/repositories/message.repository';
import {
  AI_CHAT_SYSTEM_PROMPT,
  DEFAULT_MAX_MESSAGE_LENGTH,
  MAX_CODE_SNIPPET_LENGTH,
  MAX_HISTORY_MESSAGES,
} from './ai-chat.constants';

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

@Injectable()
export class SendChatMessageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly llmClient: LlmClient,
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

    let conversationId: string;
    let history: { role: string; content: string }[] = [];

    if (input.conversationId) {
      const conversation = await this.conversationRepository.findById(
        input.conversationId,
        input.userId,
      );
      if (!conversation) {
        throw new ForbiddenException('Conversation not found or access denied');
      }
      if (conversation.userId !== input.userId) {
        throw new ForbiddenException('Conversation not found or access denied');
      }
      conversationId = conversation.id;
      const lastMessages = await this.messageRepository.findLastByConversationId(
        conversationId,
        MAX_HISTORY_MESSAGES,
      );
      history = lastMessages.map((m) => ({ role: m.role, content: m.content }));
    } else {
      const conversation = await this.conversationRepository.create({
        userId: input.userId,
        taskId: input.context?.taskId,
        taskType: input.context?.taskType,
        taskTitle: input.context?.taskTitle,
      });
      conversationId = conversation.id;
    }

    await this.messageRepository.create({
      conversationId,
      role: 'user',
      content: trimmed,
    });

    const messagesForLlm: ChatMessage[] = [{ role: 'system', content: AI_CHAT_SYSTEM_PROMPT }];

    if (input.context?.taskDescription) {
      messagesForLlm.push({
        role: 'system',
        content: `Контекст задачи: ${input.context.taskDescription}`,
      });
    }
    if (input.context?.codeSnippet) {
      const snippet =
        input.context.codeSnippet.length > MAX_CODE_SNIPPET_LENGTH
          ? input.context.codeSnippet.slice(0, MAX_CODE_SNIPPET_LENGTH) + '...'
          : input.context.codeSnippet;
      messagesForLlm.push({
        role: 'system',
        content: `Фрагмент кода пользователя:\n${snippet}`,
      });
    }

    for (const m of history) {
      messagesForLlm.push({ role: m.role, content: m.content });
    }
    messagesForLlm.push({ role: 'user', content: trimmed });

    let reply: string;
    try {
      reply = await this.llmClient.chat(messagesForLlm);
    } catch {
      throw new ServiceUnavailableException('AI service temporarily unavailable');
    }

    const assistantMessage = await this.messageRepository.create({
      conversationId,
      role: 'assistant',
      content: reply,
    });

    return {
      conversationId,
      messageId: assistantMessage.id,
      reply,
    };
  }
}
