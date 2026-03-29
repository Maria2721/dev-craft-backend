import type { Attachment } from 'discord.js';

export class DiscordAttachmentDownloader {
  constructor(private readonly botToken: string) {}

  async download(attachment: Attachment): Promise<Buffer> {
    const headers: Record<string, string> = {
      Authorization: `Bot ${this.botToken}`,
    };
    const res = await fetch(attachment.url, { headers });
    if (!res.ok) {
      throw new Error(`Discord attachment HTTP ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }
}
