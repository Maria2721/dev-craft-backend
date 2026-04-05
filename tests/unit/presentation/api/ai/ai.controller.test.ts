/**
 * Unit tests for AiController
 */

import { Test } from '@nestjs/testing';

import { SendChatMessageUseCase } from '../../../../../src/application/ai/send-chat-message.use-case';
import { AiController } from '../../../../../src/presentation/api/ai/ai.controller';
import { JwtAuthGuard } from '../../../../../src/presentation/guards/jwt-auth.guard';

describe('AiController', () => {
  it('postChat delegates to SendChatMessageUseCase', async () => {
    const execute = jest.fn().mockResolvedValue({ reply: 'ok' });

    const moduleRef = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: SendChatMessageUseCase, useValue: { execute } }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const controller = moduleRef.get(AiController);
    const dto = { message: 'hi', conversationId: 'c1' };

    const result = await controller.postChat(42, dto);

    expect(execute).toHaveBeenCalledWith({
      userId: 42,
      message: 'hi',
      conversationId: 'c1',
      context: undefined,
    });
    expect(result).toEqual({ reply: 'ok' });
  });
});
