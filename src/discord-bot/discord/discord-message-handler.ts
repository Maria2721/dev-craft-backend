import type { Message } from 'discord.js';

import { FfmpegWavPreparer } from '../audio/ffmpeg-wav-preparer';
import type { BotConfig } from '../bootstrap/load-config';
import type { ChatBackend } from '../chat/chat-backend';
import { DifySttClient } from '../dify/dify-stt-client';
import { ChunkedAssistantReplySender } from '../discord-delivery/chunked-reply-sender';
import { DiscordAttachmentDownloader } from './discord-attachment-downloader';
import { pickAudioAttachment } from './pick-audio-attachment';

export type DiscordMessageHandlerDeps = {
  config: BotConfig;
  chatBackend: ChatBackend;
  stt: DifySttClient;
  ffmpegPreparer: FfmpegWavPreparer;
  attachmentDownloader: DiscordAttachmentDownloader;
  replySender: ChunkedAssistantReplySender;
};

export class DiscordMessageHandler {
  constructor(private readonly deps: DiscordMessageHandlerDeps) {}

  async handle(message: Message): Promise<void> {
    if (message.author.bot) {
      return;
    }
    if (!message.channel.isTextBased() || message.channel.isDMBased()) {
      return;
    }
    const { allowedChannelId } = this.deps.config;
    if (allowedChannelId && message.channelId !== allowedChannelId) {
      return;
    }

    const content = message.content.trim();
    const audioAttachment = pickAudioAttachment(message);
    if (!content && !audioAttachment) {
      return;
    }

    try {
      let query = content;

      if (audioAttachment) {
        const rawAudio = await this.deps.attachmentDownloader.download(audioAttachment);
        const prepared = await this.deps.ffmpegPreparer.prepareForDifyStt(
          rawAudio,
          audioAttachment,
        );
        const transcript = await this.deps.stt.transcribe({
          ...prepared,
          discordUserId: message.author.id,
        });
        if (!transcript) {
          await message.reply({
            content:
              'Could not transcribe the voice message. Please try again or type your question as text.',
          });
          return;
        }
        if (content) {
          query = `${content}\n\n(Voice transcription: ${transcript})`;
        } else {
          query = transcript;
        }
      }

      const answer = await this.deps.chatBackend.complete({
        discordChannelId: message.channelId,
        discordUserId: message.author.id,
        message: query,
      });
      await this.deps.replySender.sendAssistantReplyInChunks(message, answer);
    } catch (err) {
      console.error('[discord-bot] Dify error:', err);
      try {
        await this.deps.replySender.sendErrorReply(message, err);
      } catch {
        //
      }
    }
  }
}
