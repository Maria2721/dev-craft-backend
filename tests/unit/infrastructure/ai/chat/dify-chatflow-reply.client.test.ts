/**
 * Unit tests for DifyChatflowReplyClient
 */

import { DifyChatflowReplyClient } from '../../../../../src/infrastructure/ai/chat/dify-chatflow-reply.client';
import { ChatReplyInput } from '../../../../../src/domain/clients/chat-reply.client';
import { ChatRole } from '../../../../../src/domain/clients/llm.client';
import { DifyChatflowClient } from '../../../../../src/infrastructure/llm/dify-chatflow.client';

describe('DifyChatflowReplyClient', () => {
  const saved = process.env.AI_DIFY_USE_CONTEXT_INPUTS;

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.AI_DIFY_USE_CONTEXT_INPUTS;
    } else {
      process.env.AI_DIFY_USE_CONTEXT_INPUTS = saved;
    }
  });

  it('calls dify client with merged inputs and overrides', async () => {
    process.env.AI_DIFY_USE_CONTEXT_INPUTS = 'true';

    const difyChatflowClient = {
      send: jest.fn().mockResolvedValue({
        answer: 'ok',
        difyConversationId: 'dc-1',
      }),
    } as unknown as DifyChatflowClient;

    const client = new DifyChatflowReplyClient(difyChatflowClient);

    const input: ChatReplyInput = {
      userId: 3,
      message: 'hello',
      history: [{ role: ChatRole.User, content: 'h' }],
      context: { taskTitle: 'T', taskDescription: 'D' },
      difyConversationId: 'existing',
      difyEndUser: 'custom-user',
      difyInputOverrides: { extra: 1 },
    };

    const out = await client.reply(input);

    expect(out.reply).toBe('ok');
    expect(out.difyConversationId).toBe('dc-1');
    expect(difyChatflowClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'hello',
        user: 'custom-user',
        difyConversationId: 'existing',
      }),
    );
  });

  it('skips context inputs when AI_DIFY_USE_CONTEXT_INPUTS is false', async () => {
    process.env.AI_DIFY_USE_CONTEXT_INPUTS = 'false';

    const difyChatflowClient = {
      send: jest.fn().mockResolvedValue({ answer: 'x' }),
    } as unknown as DifyChatflowClient;

    const client = new DifyChatflowReplyClient(difyChatflowClient);

    await client.reply({
      userId: 1,
      message: 'm',
      history: [],
      context: { taskTitle: 'SHOULD_NOT_APPEAR_IN_INPUTS' },
    });

    const call = (difyChatflowClient.send as jest.Mock).mock.calls[0][0];
    const inputsStr = JSON.stringify(call.inputs);
    expect(inputsStr).not.toContain('SHOULD_NOT_APPEAR_IN_INPUTS');
  });
});
