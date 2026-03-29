import { Injectable } from '@nestjs/common';

import {
  ChatReplyClient,
  ChatReplyInput,
  ChatReplyOutput,
} from '../../../domain/clients/chat-reply.client';
import { DifyChatflowClient } from '../../llm/dify-chatflow.client';
import {
  DIFY_INPUT_DEVCRAFT_USER_ID_KEY,
  DIFY_INPUT_MESSAGE_SOURCE_KEY,
  DIFY_MESSAGE_SOURCE_WEB,
} from '../../llm/dify-chatflow.constants';
import { buildDifyChatflowInputs, resolveDifyEndUser } from '../../llm/dify-chatflow.utils';

@Injectable()
export class DifyChatflowReplyClient extends ChatReplyClient {
  constructor(private readonly difyChatflowClient: DifyChatflowClient) {
    super();
  }

  async reply(input: ChatReplyInput): Promise<ChatReplyOutput> {
    const useContextInputs = process.env.AI_DIFY_USE_CONTEXT_INPUTS !== 'false';
    const inputs: Record<string, string | number | boolean> = {
      [DIFY_INPUT_DEVCRAFT_USER_ID_KEY]: String(input.userId),
      [DIFY_INPUT_MESSAGE_SOURCE_KEY]: DIFY_MESSAGE_SOURCE_WEB,
    };
    if (useContextInputs) {
      Object.assign(
        inputs,
        buildDifyChatflowInputs({
          taskTitle: input.context?.taskTitle,
          taskDescription: input.context?.taskDescription,
          codeSnippet: input.context?.codeSnippet,
        }),
      );
    }
    if (input.difyInputOverrides) {
      Object.assign(inputs, input.difyInputOverrides);
    }
    const out = await this.difyChatflowClient.send({
      query: input.message,
      user: input.difyEndUser ?? resolveDifyEndUser(input.userId),
      difyConversationId: input.difyConversationId,
      inputs,
    });

    return {
      reply: out.answer,
      difyConversationId: out.difyConversationId,
    };
  }
}
