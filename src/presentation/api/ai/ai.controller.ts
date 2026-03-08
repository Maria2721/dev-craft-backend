import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { SendChatMessageUseCase } from '../../../application/ai/send-chat-message.use-case';
import { User } from '../../decorators/user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PostChatDto } from './dto/post-chat.dto';

@Controller('ai/chat')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly sendChatMessageUseCase: SendChatMessageUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async postChat(@User('userId') userId: number, @Body() dto: PostChatDto) {
    return this.sendChatMessageUseCase.execute({
      userId,
      message: dto.message,
      conversationId: dto.conversationId,
      context: dto.context,
    });
  }
}
