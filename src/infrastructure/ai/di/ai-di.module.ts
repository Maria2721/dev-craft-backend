import { Module } from '@nestjs/common';

import { SendChatMessageUseCase } from '../../../application/ai/send-chat-message.use-case';
import { LlmClient } from '../../../domain/clients/llm.client';
import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { ApiLlmClient } from '../../llm/api-llm.client';
import { DifyLlmClient } from '../../llm/dify-llm.client';
import { PrismaConversationRepository } from '../../persistence/conversation/prisma-conversation.repository';
import { PrismaMessageRepository } from '../../persistence/message/prisma-message.repository';
import { PrismaModule } from '../../persistence/prisma/prisma.module';

function createLlmClient(): LlmClient {
  const provider = process.env.AI_LLM_PROVIDER || 'api_llm';
  if (provider === 'local_llm') {
    return new ApiLlmClient({
      baseUrl: process.env.AI_LOCAL_BASE_URL ?? '',
      apiKey: process.env.AI_LOCAL_API_KEY,
      model: process.env.AI_LOCAL_MODEL ?? '',
    });
  }
  if (provider === 'ai_platform') {
    return new DifyLlmClient({
      baseUrl: process.env.AI_PLATFORM_BASE_URL ?? '',
      apiKey: process.env.AI_PLATFORM_API_KEY ?? '',
      user: process.env.AI_PLATFORM_USER,
    });
  }
  return new ApiLlmClient({
    baseUrl: process.env.AI_API_BASE_URL ?? '',
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_API_MODEL ?? '',
  });
}

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: ConversationRepository, useClass: PrismaConversationRepository },
    { provide: MessageRepository, useClass: PrismaMessageRepository },
    { provide: LlmClient, useFactory: createLlmClient },
    SendChatMessageUseCase,
  ],
  exports: [SendChatMessageUseCase],
})
export class AiDiModule {}
