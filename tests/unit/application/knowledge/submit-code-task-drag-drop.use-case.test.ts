/**
 * Unit tests for SubmitCodeTaskDragDropUseCase
 */

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SubmitCodeTaskDragDropUseCase } from '../../../../src/application/knowledge/submit-code-task-drag-drop.use-case';
import { CodeTaskAttemptRepository } from '../../../../src/domain/repositories/code-task-attempt.repository';
import { CodeTaskRepository } from '../../../../src/domain/repositories/code-task.repository';

describe('SubmitCodeTaskDragDropUseCase', () => {
  let codeTaskRepository: jest.Mocked<CodeTaskRepository>;
  let codeTaskAttemptRepository: jest.Mocked<CodeTaskAttemptRepository>;

  beforeEach(() => {
    codeTaskRepository = {
      findInTopic: jest.fn(),
    } as unknown as jest.Mocked<CodeTaskRepository>;

    codeTaskAttemptRepository = {
      create: jest.fn().mockResolvedValue({ id: 'att-1' }),
    } as unknown as jest.Mocked<CodeTaskAttemptRepository>;
  });

  it('throws NotFound when task missing', async () => {
    codeTaskRepository.findInTopic.mockResolvedValue(null);

    const useCase = new SubmitCodeTaskDragDropUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
    );

    await expect(
      useCase.execute({
        userId: 1,
        topicId: 't',
        codeTaskId: 'c',
        code: 'x',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequest when task is not DRAG_DROP', async () => {
    codeTaskRepository.findInTopic.mockResolvedValue({
      id: 'cid',
      title: 'T',
      description: 'D',
      taskType: 'AI_CHECK',
      referenceSolution: 'ref',
    });

    const useCase = new SubmitCodeTaskDragDropUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
    );

    await expect(
      useCase.execute({ userId: 1, topicId: 't', codeTaskId: 'c', code: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when reference solution is empty', async () => {
    codeTaskRepository.findInTopic.mockResolvedValue({
      id: 'cid',
      title: 'T',
      description: 'D',
      taskType: 'DRAG_DROP',
      referenceSolution: '   ',
    });

    const useCase = new SubmitCodeTaskDragDropUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
    );

    await expect(
      useCase.execute({ userId: 1, topicId: 't', codeTaskId: 'c', code: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('marks valid when normalized code matches reference', async () => {
    codeTaskRepository.findInTopic.mockResolvedValue({
      id: 'cid',
      title: 'T',
      description: 'D',
      taskType: 'DRAG_DROP',
      referenceSolution: '  a\nb  ',
    });

    const useCase = new SubmitCodeTaskDragDropUseCase(
      codeTaskRepository,
      codeTaskAttemptRepository,
    );

    const result = await useCase.execute({
      userId: 1,
      topicId: 't',
      codeTaskId: 'c',
      code: 'a\nb',
    });

    expect(result.valid).toBe(true);
    expect(result.codeTaskId).toBe('cid');
    expect(codeTaskAttemptRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ valid: true }),
    );
  });
});
