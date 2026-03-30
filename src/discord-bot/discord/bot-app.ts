import { Client, Events, GatewayIntentBits } from 'discord.js';

import type { BotConfig } from '../bootstrap/load-config';
import { DiscordMessageHandler } from './discord-message-handler';

export function startDiscordBot(config: BotConfig, messageHandler: DiscordMessageHandler): void {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`Discord bot logged in as ${c.user.tag}`);
    if (config.useInternalChatPersistence) {
      console.log('[discord-bot] Using Nest internal chat API (Postgres persistence)');
    } else {
      console.log('[discord-bot] Using direct Dify + in-memory conversation_id (no DB)');
    }
  });

  client.on(Events.MessageCreate, (message) => {
    void messageHandler.handle(message);
  });

  void client.login(config.discordToken);
}
