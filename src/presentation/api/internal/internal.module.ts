import { Module } from '@nestjs/common';

import { AiDiModule } from '../../../infrastructure/ai/di/ai-di.module';
import { DiscordPracticeUserService } from '../../../infrastructure/discord/discord-practice-user.service';
import { KnowledgeDiModule } from '../../../infrastructure/knowledge/di/knowledge-di.module';
import { PrismaModule } from '../../../infrastructure/persistence/prisma/prisma.module';
import { InternalDiscordChatController } from './internal-discord-chat.controller';

@Module({
  imports: [AiDiModule, KnowledgeDiModule, PrismaModule],
  controllers: [InternalDiscordChatController],
  providers: [DiscordPracticeUserService],
  exports: [DiscordPracticeUserService],
})
export class InternalModule {}
