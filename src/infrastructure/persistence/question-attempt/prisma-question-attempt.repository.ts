import { Injectable } from '@nestjs/common';

import {
  CreateQuestionAttemptInput,
  QuestionAttemptRepository,
} from '../../../domain/repositories/question-attempt.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaQuestionAttemptRepository extends QuestionAttemptRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createMany(inputs: CreateQuestionAttemptInput[]): Promise<void> {
    if (inputs.length === 0) {
      return;
    }

    await this.prisma.questionAttempt.createMany({
      data: inputs.map((input) => ({
        userId: input.userId,
        topicId: input.topicId,
        questionId: input.questionId,
        selectedOptionIds: input.selectedOptionIds,
        isCorrect: input.isCorrect,
      })),
    });
  }

  async getTopicStats(userId: number, topicId: string) {
    const [attempted, correct] = await Promise.all([
      this.prisma.questionAttempt.count({
        where: { userId, topicId },
      }),
      this.prisma.questionAttempt.count({
        where: { userId, topicId, isCorrect: true },
      }),
    ]);

    return { attempted, correct };
  }
}
