import { FfmpegWavPreparer } from '../audio/ffmpeg-wav-preparer';
import type { ChatBackend } from '../chat/chat-backend';
import { DirectDifyChatBackend } from '../chat/direct-dify-chat-backend';
import { InMemoryDifyConversationStore } from '../chat/in-memory-dify-conversation-store';
import { InternalApiChatBackend } from '../chat/internal-api-chat-backend';
import { DifyChatClient } from '../dify/dify-chat-client';
import { DifySttClient } from '../dify/dify-stt-client';
import { DiscordAttachmentDownloader } from '../discord/discord-attachment-downloader';
import { DiscordMessageHandler } from '../discord/discord-message-handler';
import { ChunkedAssistantReplySender } from '../discord-delivery/chunked-reply-sender';
import type { BotConfig } from './load-config';

export type CompositionRoot = {
  messageHandler: DiscordMessageHandler;
};

export function createCompositionRoot(config: BotConfig): CompositionRoot {
  const difyChat = new DifyChatClient(config.difyBaseUrl, config.difyApiKey);
  const difyStt = new DifySttClient(config.difyBaseUrl, config.difyApiKey);
  const ffmpegPreparer = new FfmpegWavPreparer();
  const attachmentDownloader = new DiscordAttachmentDownloader(config.discordToken);
  const replySender = new ChunkedAssistantReplySender();

  let chatBackend: ChatBackend;
  if (config.useInternalChatPersistence) {
    chatBackend = new InternalApiChatBackend(
      config.internalChatBaseUrl as string,
      config.internalChatToken as string,
    );
  } else {
    chatBackend = new DirectDifyChatBackend(difyChat, new InMemoryDifyConversationStore());
  }

  const messageHandler = new DiscordMessageHandler({
    config,
    chatBackend,
    stt: difyStt,
    ffmpegPreparer,
    attachmentDownloader,
    replySender,
  });

  return { messageHandler };
}
