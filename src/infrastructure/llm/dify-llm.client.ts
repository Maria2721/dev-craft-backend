import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { ChatMessage, LlmClient } from '../../domain/clients/llm.client';
import {
  DIFY_COMPLETION_MESSAGES_PATH,
  DIFY_DEFAULT_USER,
  DIFY_INPUT_QUERY_KEY,
  DIFY_PROMPT_ROLE_LABELS,
  DIFY_RESPONSE_MODE_BLOCKING,
} from './dify-llm.constants';

type DifyLlmClientConfig = {
  baseUrl: string;
  apiKey: string;
  user?: string;
};

function buildPromptFromMessages(messages: ChatMessage[]): string {
  return messages
    .map((m) => {
      const label =
        DIFY_PROMPT_ROLE_LABELS[m.role as keyof typeof DIFY_PROMPT_ROLE_LABELS] ??
        DIFY_PROMPT_ROLE_LABELS.system;
      return `${label}:\n${m.content}`;
    })
    .join('\n\n');
}

@Injectable()
export class DifyLlmClient extends LlmClient {
  private readonly client: AxiosInstance;
  private readonly user: string;

  constructor(config: DifyLlmClientConfig) {
    super();
    this.user = config.user ?? DIFY_DEFAULT_USER;
    this.client = axios.create({
      baseURL: config.baseUrl.replace(/\/$/, ''),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
    });
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const query = buildPromptFromMessages(messages);
    const { data } = await this.client.post<{ answer?: string }>(DIFY_COMPLETION_MESSAGES_PATH, {
      inputs: { [DIFY_INPUT_QUERY_KEY]: query },
      response_mode: DIFY_RESPONSE_MODE_BLOCKING,
      user: this.user,
    });
    const answer = data?.answer;
    if (answer == null) {
      throw new Error('Empty or invalid response from Dify');
    }
    return answer;
  }
}
