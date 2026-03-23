import { Module } from '@nestjs/common';

import { SendChatMessageUseCase } from '../../../application/ai/send-chat-message.use-case';
import { ChatReplyClient } from '../../../domain/clients/chat-reply.client';
import { LlmClient } from '../../../domain/clients/llm.client';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { ApiLlmClient } from '../../llm/api-llm.client';
import { DifyChatflowClient } from '../../llm/dify-chatflow.client';
import { PrismaConversationRepository } from '../../persistence/conversation/prisma-conversation.repository';
import { PrismaMessageRepository } from '../../persistence/message/prisma-message.repository';
import { PrismaModule } from '../../persistence/prisma/prisma.module';
import { DifyChatflowReplyClient } from '../chat/dify-chatflow-reply.client';
import { LlmChatReplyClient } from '../chat/llm-chat-reply.client';

function createApiCompatibleLlmClient(config: {
  baseUrl: string;
  apiKey?: string;
  model: string;
}): LlmClient {
  return new ApiLlmClient(config);
}

function createStandardLlmClient(): LlmClient {
  const provider = process.env.AI_LLM_PROVIDER || 'api_llm';
  if (provider === 'local_llm') {
    return createApiCompatibleLlmClient({
      baseUrl: process.env.AI_LOCAL_BASE_URL ?? '',
      apiKey: process.env.AI_LOCAL_API_KEY,
      model: process.env.AI_LOCAL_MODEL ?? '',
    });
  }
  return createApiCompatibleLlmClient({
    baseUrl: process.env.AI_API_BASE_URL ?? '',
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_API_MODEL ?? '',
  });
}

function createChatReplyClient(): ChatReplyClient {
  if (process.env.AI_LLM_PROVIDER === 'dify_chatflow') {
    return new DifyChatflowReplyClient(
      new DifyChatflowClient({
        baseUrl: process.env.AI_DIFY_BASE_URL ?? '',
        apiKey: process.env.AI_DIFY_APP_API_KEY ?? '',
      }),
    );
  }
  return new LlmChatReplyClient(createStandardLlmClient());
}

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: ConversationRepository, useClass: PrismaConversationRepository },
    { provide: MessageRepository, useClass: PrismaMessageRepository },
    { provide: ChatReplyClient, useFactory: createChatReplyClient },
    SendChatMessageUseCase,
  ],
  exports: [SendChatMessageUseCase],
})
export class AiDiModule {}
