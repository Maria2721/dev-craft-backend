/**
 * Unit tests for LlmChatReplyClient
 */

import { LlmChatReplyClient } from '../../../../../src/infrastructure/ai/chat/llm-chat-reply.client';
import { ChatReplyInput } from '../../../../../src/domain/clients/chat-reply.client';
import { ChatMessage, ChatRole, LlmClient } from '../../../../../src/domain/clients/llm.client';

describe('LlmChatReplyClient', () => {
  it('builds messages with context and calls llm', async () => {
    const llmClient = {
      chat: jest.fn().mockResolvedValue('answer'),
    } as unknown as LlmClient;

    const client = new LlmChatReplyClient(llmClient);

    const input: ChatReplyInput = {
      userId: 1,
      message: 'user text',
      history: [{ role: ChatRole.Assistant, content: 'prev' }],
      context: {
        taskDescription: 'desc',
        codeSnippet: 'x'.repeat(9000),
      },
    };

    const out = await client.reply(input);

    expect(out.reply).toBe('answer');
    expect(llmClient.chat).toHaveBeenCalled();
    const messages = (llmClient.chat as jest.Mock).mock.calls[0][0] as ChatMessage[];
    expect(messages.some((m) => m.content.includes('desc'))).toBe(true);
    expect(messages.some((m) => m.role === ChatRole.User && m.content === 'user text')).toBe(true);
  });
});
