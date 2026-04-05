/**
 * Unit tests for DiscordAttachmentDownloader
 */

import type { Attachment } from 'discord.js';

import { DiscordAttachmentDownloader } from '../../../../src/discord-bot/discord/discord-attachment-downloader';

describe('DiscordAttachmentDownloader', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('downloads attachment bytes on HTTP 200', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    });

    const dl = new DiscordAttachmentDownloader('bot-token');
    const buf = await dl.download({ url: 'https://cdn.discord/att' } as Attachment);

    expect(Buffer.from(buf).equals(Buffer.from([1, 2, 3]))).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://cdn.discord/att', {
      headers: { Authorization: 'Bot bot-token' },
    });
  });

  it('throws on non-OK response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      arrayBuffer: async () => new ArrayBuffer(0),
    });

    const dl = new DiscordAttachmentDownloader('t');

    await expect(dl.download({ url: 'https://x' } as Attachment)).rejects.toThrow('HTTP 404');
  });
});
