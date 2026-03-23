import { Injectable } from '@nestjs/common';

import {
  ChatReplyClient,
  ChatReplyInput,
  ChatReplyOutput,
} from '../../../domain/clients/chat-reply.client';
import { DifyChatflowClient } from '../../llm/dify-chatflow.client';
import { DIFY_INPUT_DEVCRAFT_USER_ID_KEY } from '../../llm/dify-chatflow.constants';
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
    const out = await this.difyChatflowClient.send({
      query: input.message,
      user: resolveDifyEndUser(input.userId),
      difyConversationId: input.difyConversationId,
      inputs,
    });

    return {
      reply: out.answer,
      difyConversationId: out.difyConversationId,
    };
  }
}
