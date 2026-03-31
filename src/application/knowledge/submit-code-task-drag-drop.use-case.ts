import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CodeTaskRepository } from '../../domain/repositories/code-task.repository';
import { CodeTaskAttemptRepository } from '../../domain/repositories/code-task-attempt.repository';
import { normalizeCodeTaskSolution } from './normalize-code-task-solution';

export interface SubmitCodeTaskDragDropInput {
  userId: number;
  topicId: string;
  codeTaskId: string;
  code: string;
}

export type SubmitCodeTaskDragDropResult = {
  codeTaskId: string;
  attemptId: string;
  valid: boolean;
  hints: null;
  justification: null;
  improvements: null;
};

@Injectable()
export class SubmitCodeTaskDragDropUseCase {
  constructor(
    private readonly codeTaskRepository: CodeTaskRepository,
    private readonly codeTaskAttemptRepository: CodeTaskAttemptRepository,
  ) {}

  async execute(input: SubmitCodeTaskDragDropInput): Promise<SubmitCodeTaskDragDropResult> {
    const task = await this.codeTaskRepository.findInTopic(input.topicId, input.codeTaskId);
    if (!task) {
      throw new NotFoundException('Code task not found');
    }
    if (task.taskType !== 'DRAG_DROP') {
      throw new BadRequestException(
        'Drag-and-drop submission is only available for DRAG_DROP tasks',
      );
    }
    const reference = task.referenceSolution?.trim();
    if (!reference) {
      throw new BadRequestException('Code task is missing reference solution');
    }

    const valid = normalizeCodeTaskSolution(input.code) === normalizeCodeTaskSolution(reference);

    const { id: attemptId } = await this.codeTaskAttemptRepository.create({
      userId: input.userId,
      topicId: input.topicId,
      codeTaskId: task.id,
      valid,
      hints: null,
      justification: null,
      improvements: null,
    });

    return {
      codeTaskId: task.id,
      attemptId,
      valid,
      hints: null,
      justification: null,
      improvements: null,
    };
  }
}
