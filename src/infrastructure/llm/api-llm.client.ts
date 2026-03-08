import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { ChatMessage, LlmClient } from '../../domain/clients/llm.client';
import { CHAT_COMPLETIONS_PATH, CHAT_COMPLETIONS_PATH_WITH_V1 } from './api-llm.constants';

type ApiLlmClientConfig = {
  baseUrl: string;
  apiKey?: string;
  model: string;
};

@Injectable()
export class ApiLlmClient extends LlmClient {
  private readonly client: AxiosInstance;
  private readonly model: string;

  constructor(config: ApiLlmClientConfig) {
    super();
    this.model = config.model;
    this.client = axios.create({
      baseURL: config.baseUrl.replace(/\/$/, ''),
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const path = this.client.defaults.baseURL?.endsWith('/v1')
      ? CHAT_COMPLETIONS_PATH
      : CHAT_COMPLETIONS_PATH_WITH_V1;
    const { data } = await this.client.post<{
      choices?: Array<{ message?: { content?: string } }>;
    }>(path, {
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const content = data.choices?.[0]?.message?.content;
    if (content == null) {
      throw new Error('Empty or invalid response from LLM');
    }
    return content;
  }
}
