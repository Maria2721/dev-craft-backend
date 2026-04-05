/**
 * Unit tests for SubmitCodeTaskAiCheckUseCase
 */

import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { SubmitCodeTaskAiCheckUseCase } from '../../../../src/application/knowledge/submit-code-task-ai-check.use-case';
import { ChatReplyClient } from '../../../../src/domain/clients/chat-reply.client';
import { CodeTaskAttemptRepository } from '../../../../src/domain/repositories/code-task-attempt.repository';
import { CodeTaskRepository } from '../../../../src/domain/repositories/code-task.repository';

describe('SubmitCodeTaskAiCheckUseCase', () => {
  let codeTaskRepository: jest.Mocked<CodeTaskRepository>;
  let codeTaskAttemptRepository: jest.Mocked<CodeTaskAttemptRepository>;
  let chatReplyClient: jest.Mocked<ChatReplyClient>;

  const task = {
    id: 'task-id',
    title: 'T',
    description: 'D',
    taskType: 'AI_CHECK' as const,
    referenceSolution: 'ref code',
  };

  beforeEach(() => {
    codeTaskRepository = {
      findInTopic: jest.fn().mockResolvedValue(task),
    } as unknown as jest.Mocked<CodeTaskRepository>;

    codeTaskAttemptRepository = {
      create: jest.fn().mockResolvedValue({ id: 'attempt-1' }),
    } as unknown as jest.Mocked<CodeTaskAttemptRepository>;

    chatReplyClient = {
      reply: jest.fn().mockResolvedValue({
        reply: '{"valid":true,"hints":null,"justification":null,"improvements":null}',
      }),
    } as unknown as jest.Mocked<ChatReplyClient>;
  });

  it('throws NotFound when task missing', async () => {
    codeTaskRepository.findInTopic.mockResolvedValueOnce(null);

    const useCase = new SubmitCodeTaskAiCheckUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({ userId: 1, topicId: 't', codeTaskId: 'c', code: 'x' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequest when task is not AI_CHECK', async () => {
    codeTaskRepository.findInTopic.mockResolvedValueOnce({
      ...task,
      taskType: 'DRAG_DROP',
    });

    const useCase = new SubmitCodeTaskAiCheckUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({ userId: 1, topicId: 't', codeTaskId: 'c', code: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws ServiceUnavailable when AI client fails', async () => {
    chatReplyClient.reply.mockRejectedValueOnce(new Error('network'));

    const useCase = new SubmitCodeTaskAiCheckUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({ userId: 1, topicId: 't', codeTaskId: 'c', code: 'x' }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('throws ServiceUnavailable when reply is not valid JSON', async () => {
    chatReplyClient.reply.mockResolvedValueOnce({ reply: 'not json' });

    const useCase = new SubmitCodeTaskAiCheckUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
      chatReplyClient,
    );

    await expect(
      useCase.execute({ userId: 1, topicId: 't', codeTaskId: 'c', code: 'x' }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('persists parsed result on success', async () => {
    const useCase = new SubmitCodeTaskAiCheckUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
      chatReplyClient,
    );

    const result = await useCase.execute({
      userId: 1,
      topicId: 't',
      codeTaskId: 'c',
      code: 'user code',
    });

    expect(result.valid).toBe(true);
    expect(result.attemptId).toBe('attempt-1');
    expect(codeTaskAttemptRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        valid: true,
        codeTaskId: 'task-id',
      }),
    );
  });
});
