/**
 * Unit tests for ApiLlmClient
 */

jest.mock('axios');
import axios from 'axios';

import { ChatMessage, ChatRole } from '../../../../src/domain/clients/llm.client';
import { ApiLlmClient } from '../../../../src/infrastructure/llm/api-llm.client';

describe('ApiLlmClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts chat completion and returns content', async () => {
    const mockPost = jest.fn().mockResolvedValue({
      data: { choices: [{ message: { content: 'reply text' } }] },
    });
    (axios.create as jest.Mock).mockReturnValue({
      post: mockPost,
      defaults: { baseURL: 'https://api.openai.com/v1' },
    });

    const client = new ApiLlmClient({
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'k',
      model: 'gpt-test',
    });

    const messages: ChatMessage[] = [{ role: ChatRole.User, content: 'hi' }];
    const out = await client.chat(messages);

    expect(out).toBe('reply text');
    expect(mockPost).toHaveBeenCalled();
  });

  it('throws when response has no content', async () => {
    const mockPost = jest.fn().mockResolvedValue({
      data: { choices: [{}] },
    });
    (axios.create as jest.Mock).mockReturnValue({
      post: mockPost,
      defaults: { baseURL: 'http://x/v1' },
    });

    const client = new ApiLlmClient({ baseUrl: 'http://x/v1', model: 'm' });

    await expect(client.chat([{ role: ChatRole.User, content: 'x' }])).rejects.toThrow(
      'Empty or invalid response',
    );
  });
});
