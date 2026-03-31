import { Injectable } from '@nestjs/common';

import {
  CodeTaskForAiCheck,
  CodeTaskRepository,
} from '../../../domain/repositories/code-task.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaCodeTaskRepository extends CodeTaskRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findInTopic(topicId: string, codeTaskId: string): Promise<CodeTaskForAiCheck | null> {
    const task = await this.prisma.codeTask.findFirst({
      where: { id: codeTaskId, topicId },
      select: {
        id: true,
        title: true,
        description: true,
        taskType: true,
        referenceSolution: true,
      },
    });
    if (!task) {
      return null;
    }
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      referenceSolution: task.referenceSolution,
    };
  }
}
