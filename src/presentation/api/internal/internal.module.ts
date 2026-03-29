import { Module } from '@nestjs/common';

import { AiDiModule } from '../../../infrastructure/ai/di/ai-di.module';
import { InternalDiscordChatController } from './internal-discord-chat.controller';

@Module({
  imports: [AiDiModule],
  controllers: [InternalDiscordChatController],
})
export class InternalModule {}
