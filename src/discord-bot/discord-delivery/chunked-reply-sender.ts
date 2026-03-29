import type { Message } from 'discord.js';

import { mapUserFacingDifyError } from '../errors/user-facing-error-mapper';
import { splitDiscordChunks, truncateForDiscord } from './chunk-splitter';

export class ChunkedAssistantReplySender {
  async sendAssistantReplyInChunks(message: Message, fullText: string): Promise<void> {
    const chunks = splitDiscordChunks(fullText);
    if (chunks.length === 0) {
      return;
    }
    await message.reply({ content: chunks[0] });
    const channel = message.channel;
    if (!channel.isTextBased() || channel.isDMBased()) {
      return;
    }
    for (let i = 1; i < chunks.length; i++) {
      await channel.send({ content: chunks[i] });
    }
  }

  async sendErrorReply(message: Message, err: unknown): Promise<void> {
    await message.reply({ content: truncateForDiscord(mapUserFacingDifyError(err)) });
  }
}
