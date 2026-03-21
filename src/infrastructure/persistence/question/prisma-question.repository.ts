import { Injectable } from '@nestjs/common';

import { QuestionRepository } from '../../../domain/repositories/question.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaQuestionRepository extends QuestionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findForAttempts(topicId: string, questionIds: string[]) {
    if (questionIds.length === 0) {
      return [];
    }

    const questions = await this.prisma.question.findMany({
      where: {
        topicId,
        id: { in: questionIds },
      },
      select: {
        id: true,
        options: {
          where: { isCorrect: true },
          select: { id: true },
        },
      },
    });

    return questions.map((question) => ({
      id: question.id,
      correctOptionIds: question.options.map((option) => option.id),
    }));
  }

  async countByTopic(topicId: string): Promise<number> {
    return this.prisma.question.count({ where: { topicId } });
  }
}
