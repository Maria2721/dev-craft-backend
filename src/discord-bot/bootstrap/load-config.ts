export type BotConfig = {
  discordToken: string;
  difyBaseUrl: string;
  difyApiKey: string;
  allowedChannelId?: string;
  internalChatBaseUrl?: string;
  internalChatToken?: string;
  useInternalChatPersistence: boolean;
};

export function loadBotConfig(): BotConfig {
  const discordToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const difyBase = process.env.AI_DIFY_BASE_URL?.replace(/\/$/, '');
  const difyKey = process.env.AI_DIFY_APP_API_KEY?.trim();

  if (!discordToken || !difyBase || !difyKey) {
    console.error('Missing env: DISCORD_BOT_TOKEN, AI_DIFY_BASE_URL, and/or AI_DIFY_APP_API_KEY');
    process.exit(1);
  }

  const internalChatBase = process.env.INTERNAL_CHAT_API_BASE_URL?.replace(/\/$/, '');
  const internalChatToken = process.env.DISCORD_BOT_INTERNAL_API_TOKEN?.trim();
  const useInternalChatPersistence = Boolean(internalChatBase && internalChatToken);

  return {
    discordToken,
    difyBaseUrl: difyBase,
    difyApiKey: difyKey,
    allowedChannelId: process.env.DISCORD_BOT_CHANNEL_ID?.trim() || undefined,
    internalChatBaseUrl: internalChatBase || undefined,
    internalChatToken: internalChatToken || undefined,
    useInternalChatPersistence,
  };
}
