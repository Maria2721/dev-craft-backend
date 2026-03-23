import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import {
  DIFY_CHAT_MESSAGES_PATH,
  DIFY_CHATFLOW_RESPONSE_MODE_BLOCKING,
} from './dify-chatflow.constants';

export type DifyChatflowSendInput = {
  query: string;
  user: string;
  difyConversationId?: string | null;
  inputs?: Record<string, string | number | boolean>;
};

export type DifyChatflowSendResult = {
  answer: string;
  difyConversationId?: string;
};

type DifyChatCompletionBody = {
  answer?: string;
  conversation_id?: string;
};

@Injectable()
export class DifyChatflowClient {
  private readonly client: AxiosInstance;

  constructor(config: { baseUrl: string; apiKey: string }) {
    this.client = axios.create({
      baseURL: config.baseUrl.replace(/\/$/, ''),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
    });
  }

  async send(input: DifyChatflowSendInput): Promise<DifyChatflowSendResult> {
    const body: Record<string, unknown> = {
      query: input.query,
      user: input.user,
      response_mode: DIFY_CHATFLOW_RESPONSE_MODE_BLOCKING,
      inputs: input.inputs ?? {},
    };
    if (input.difyConversationId) {
      body.conversation_id = input.difyConversationId;
    }

    const { data } = await this.client.post<DifyChatCompletionBody>(DIFY_CHAT_MESSAGES_PATH, body);

    const answer = data?.answer;
    if (answer == null || answer === '') {
      throw new Error('Empty or invalid response from Dify Chatflow');
    }

    return {
      answer,
      difyConversationId: data.conversation_id,
    };
  }
}
