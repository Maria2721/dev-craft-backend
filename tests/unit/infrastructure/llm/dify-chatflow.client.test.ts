/**
 * Unit tests for DifyChatflowClient
 */

jest.mock('axios');
import axios from 'axios';

import { DifyChatflowClient } from '../../../../src/infrastructure/llm/dify-chatflow.client';

describe('DifyChatflowClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('strips trailing slash from base URL and returns answer', async () => {
    const mockPost = jest.fn().mockResolvedValue({
      data: { answer: 'hello', conversation_id: 'cid' },
    });
    (axios.create as jest.Mock).mockReturnValue({ post: mockPost });

    const client = new DifyChatflowClient({ baseUrl: 'http://app/', apiKey: 'key' });

    const result = await client.send({ query: 'q', user: 'u1' });

    expect(result.answer).toBe('hello');
    expect(result.difyConversationId).toBe('cid');
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://app',
        headers: expect.objectContaining({ Authorization: 'Bearer key' }),
      }),
    );
  });

  it('includes conversation_id in body when provided', async () => {
    const mockPost = jest.fn().mockResolvedValue({
      data: { answer: 'x' },
    });
    (axios.create as jest.Mock).mockReturnValue({ post: mockPost });

    const client = new DifyChatflowClient({ baseUrl: 'http://x', apiKey: 'k' });
    await client.send({ query: 'q', user: 'u', difyConversationId: 'prev' });

    expect(mockPost.mock.calls[0][1]).toEqual(expect.objectContaining({ conversation_id: 'prev' }));
  });

  it('throws when answer is empty', async () => {
    const mockPost = jest.fn().mockResolvedValue({ data: { answer: '' } });
    (axios.create as jest.Mock).mockReturnValue({ post: mockPost });

    const client = new DifyChatflowClient({ baseUrl: 'http://x', apiKey: 'k' });

    await expect(client.send({ query: 'q', user: 'u' })).rejects.toThrow(
      'Empty or invalid response from Dify Chatflow',
    );
  });
});
