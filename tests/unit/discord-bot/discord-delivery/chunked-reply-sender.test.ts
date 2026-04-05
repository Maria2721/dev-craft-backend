/**
 * Unit tests for ChunkedAssistantReplySender
 */

import type { Message } from 'discord.js';

import { ChunkedAssistantReplySender } from '../../../../src/discord-bot/discord-delivery/chunked-reply-sender';

describe('ChunkedAssistantReplySender', () => {
  it('sendAssistantReplyInChunks replies first chunk and sends rest on text channel', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const reply = jest.fn().mockResolvedValue(undefined);
    const message = {
      reply,
      channel: {
        isTextBased: () => true,
        isDMBased: () => false,
        send,
      },
    } as unknown as Message;

    const sender = new ChunkedAssistantReplySender();
    const long = 'a'.repeat(2500);
    await sender.sendAssistantReplyInChunks(message, long);

    expect(reply).toHaveBeenCalled();
    expect(send).toHaveBeenCalled();
  });

  it('sendAssistantReplyInChunks skips channel sends for DM', async () => {
    const send = jest.fn();
    const reply = jest.fn().mockResolvedValue(undefined);
    const message = {
      reply,
      channel: {
        isTextBased: () => true,
        isDMBased: () => true,
        send,
      },
    } as unknown as Message;

    const sender = new ChunkedAssistantReplySender();
    const long = `${'x'.repeat(1200)}\n\n${'y'.repeat(1200)}`;
    await sender.sendAssistantReplyInChunks(message, long);

    expect(reply).toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('sendAssistantReplyInChunks no-ops on empty chunks', async () => {
    const reply = jest.fn();
    const message = {
      reply,
      channel: { isTextBased: () => true, isDMBased: () => false, send: jest.fn() },
    } as unknown as Message;

    const sender = new ChunkedAssistantReplySender();
    await sender.sendAssistantReplyInChunks(message, '');

    expect(reply).not.toHaveBeenCalled();
  });

  it('sendErrorReply maps error to truncated reply', async () => {
    const reply = jest.fn().mockResolvedValue(undefined);
    const message = { reply } as unknown as Message;

    const sender = new ChunkedAssistantReplySender();
    await sender.sendErrorReply(message, new Error('Speech to text is not enabled'));

    expect(reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('speech recognition'),
      }),
    );
  });
});
