import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { SendDiscordChannelChatMessageUseCase } from '../../../application/ai/send-discord-channel-chat-message.use-case';
import { InternalTokenGuard } from '../../guards/internal-token.guard';
import { PostDiscordChatDto } from './dto/post-discord-chat.dto';

@Controller('internal/discord')
@UseGuards(InternalTokenGuard)
@Throttle({ default: { ttl: 3_600_000, limit: 200 } })
export class InternalDiscordChatController {
  constructor(
    private readonly sendDiscordChannelChatMessageUseCase: SendDiscordChannelChatMessageUseCase,
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async postChat(@Body() dto: PostDiscordChatDto) {
    return this.sendDiscordChannelChatMessageUseCase.execute({
      discordChannelId: dto.discordChannelId,
      discordUserId: dto.discordUserId,
      message: dto.message,
    });
  }
}
