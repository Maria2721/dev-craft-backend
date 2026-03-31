import { Injectable } from '@nestjs/common';

import {
  CodeTaskAttemptRepository,
  CreateCodeTaskAttemptInput,
} from '../../../domain/repositories/code-task-attempt.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaCodeTaskAttemptRepository extends CodeTaskAttemptRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateCodeTaskAttemptInput): Promise<{ id: string }> {
    const row = await this.prisma.codeTaskAttempt.create({
      data: {
        userId: input.userId,
        topicId: input.topicId,
        codeTaskId: input.codeTaskId,
        valid: input.valid,
        hints: input.hints,
        justification: input.justification,
        improvements: input.improvements,
      },
      select: { id: true },
    });
    return { id: row.id };
  }
}
