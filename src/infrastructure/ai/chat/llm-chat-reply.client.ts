import { Injectable } from '@nestjs/common';

import {
  AI_CHAT_SYSTEM_PROMPT,
  AI_TASK_CONTEXT_PREFIX,
  AI_TRUNCATION_SUFFIX,
  AI_USER_CODE_SNIPPET_PREFIX,
  MAX_CODE_SNIPPET_LENGTH,
} from '../../../application/ai/ai-chat.constants';
import {
  ChatReplyClient,
  ChatReplyInput,
  ChatReplyOutput,
} from '../../../domain/clients/chat-reply.client';
import { ChatMessage, ChatRole, LlmClient } from '../../../domain/clients/llm.client';

@Injectable()
export class LlmChatReplyClient extends ChatReplyClient {
  constructor(private readonly llmClient: LlmClient) {
    super();
  }

  async reply(input: ChatReplyInput): Promise<ChatReplyOutput> {
    const messagesForLlm: ChatMessage[] = [
      { role: ChatRole.System, content: AI_CHAT_SYSTEM_PROMPT },
    ];

    if (input.context?.taskDescription) {
      messagesForLlm.push({
        role: ChatRole.System,
        content: `${AI_TASK_CONTEXT_PREFIX}${input.context.taskDescription}`,
      });
    }

    if (input.context?.codeSnippet) {
      const snippet =
        input.context.codeSnippet.length > MAX_CODE_SNIPPET_LENGTH
          ? input.context.codeSnippet.slice(0, MAX_CODE_SNIPPET_LENGTH) + AI_TRUNCATION_SUFFIX
          : input.context.codeSnippet;
      messagesForLlm.push({
        role: ChatRole.System,
        content: `${AI_USER_CODE_SNIPPET_PREFIX}${snippet}`,
      });
    }

    messagesForLlm.push(...input.history);
    messagesForLlm.push({ role: ChatRole.User, content: input.message });

    const reply = await this.llmClient.chat(messagesForLlm);
    return { reply };
  }
}
