import 'dotenv/config';

import { createCompositionRoot } from './bootstrap/composition-root';
import { loadBotConfig } from './bootstrap/load-config';
import { startDiscordBot } from './discord/bot-app';

const config = loadBotConfig();
const { messageHandler } = createCompositionRoot(config);
startDiscordBot(config, messageHandler);
