import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { ChatReplyClient } from '../../domain/clients/chat-reply.client';
import { CodeTaskRepository } from '../../domain/repositories/code-task.repository';
import { CodeTaskAttemptRepository } from '../../domain/repositories/code-task-attempt.repository';
import { buildCodeTaskAiCheckPrompt } from './code-task-ai-check.constants';
import { CodeTaskAiCheckParseError } from './code-task-ai-check-parse.error';
import { CodeTaskAiCheckReplyParser } from './parse-code-task-ai-check-reply';

export interface SubmitCodeTaskAiCheckInput {
  userId: number;
  topicId: string;
  codeTaskId: string;
  code: string;
}

export type SubmitCodeTaskAiCheckResult = {
  codeTaskId: string;
  attemptId: string;
  valid: boolean;
  hints: string | null;
  justification: string | null;
  improvements: string | null;
};

@Injectable()
export class SubmitCodeTaskAiCheckUseCase {
  constructor(
    private readonly codeTaskRepository: CodeTaskRepository,
    private readonly codeTaskAttemptRepository: CodeTaskAttemptRepository,
    private readonly chatReplyClient: ChatReplyClient,
  ) {}

  async execute(input: SubmitCodeTaskAiCheckInput): Promise<SubmitCodeTaskAiCheckResult> {
    const task = await this.codeTaskRepository.findInTopic(input.topicId, input.codeTaskId);
    if (!task) {
      throw new NotFoundException('Code task not found');
    }
    if (task.taskType !== 'AI_CHECK') {
      throw new BadRequestException('AI check is only available for AI_CHECK tasks');
    }
    const reference = task.referenceSolution?.trim();
    if (!reference) {
      throw new BadRequestException('Code task is missing reference solution');
    }

    const message = buildCodeTaskAiCheckPrompt({
      title: task.title,
      description: task.description,
      referenceSolution: reference,
      userCode: input.code,
    });

    let replyText: string;
    try {
      const out = await this.chatReplyClient.reply({
        userId: input.userId,
        message,
        history: [],
        context: {
          taskTitle: task.title,
          taskDescription: task.description,
        },
      });
      replyText = out.reply;
    } catch {
      throw new ServiceUnavailableException('AI service temporarily unavailable');
    }

    let parsed;
    try {
      parsed = CodeTaskAiCheckReplyParser.parse(replyText);
    } catch (err) {
      if (err instanceof CodeTaskAiCheckParseError) {
        throw new ServiceUnavailableException('AI service temporarily unavailable');
      }
      throw err;
    }

    const { id: attemptId } = await this.codeTaskAttemptRepository.create({
      userId: input.userId,
      topicId: input.topicId,
      codeTaskId: task.id,
      valid: parsed.valid,
      hints: parsed.hints,
      justification: parsed.justification,
      improvements: parsed.improvements,
    });

    return {
      codeTaskId: task.id,
      attemptId,
      valid: parsed.valid,
      hints: parsed.hints,
      justification: parsed.justification,
      improvements: parsed.improvements,
    };
  }
}
