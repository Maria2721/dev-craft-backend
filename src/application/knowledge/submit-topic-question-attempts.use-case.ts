import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { QuestionRepository } from '../../domain/repositories/question.repository';
import { QuestionAttemptRepository } from '../../domain/repositories/question-attempt.repository';

export interface TopicQuestionAttemptInput {
  questionId: string;
  selectedOptionIds: string[];
}

export interface SubmitTopicQuestionAttemptsInput {
  userId: number;
  topicId: string;
  attempts: TopicQuestionAttemptInput[];
}

function areSameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const setA = new Set(a);
  if (setA.size !== b.length) {
    return false;
  }
  return b.every((item) => setA.has(item));
}

@Injectable()
export class SubmitTopicQuestionAttemptsUseCase {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionAttemptRepository: QuestionAttemptRepository,
  ) {}

  async execute(input: SubmitTopicQuestionAttemptsInput) {
    const uniqueQuestionIds = [...new Set(input.attempts.map((attempt) => attempt.questionId))];

    const [questions, topicQuestionsCount] = await Promise.all([
      this.questionRepository.findForAttempts(input.topicId, uniqueQuestionIds),
      this.questionRepository.countByTopic(input.topicId),
    ]);

    if (topicQuestionsCount === 0) {
      throw new NotFoundException('Topic not found');
    }

    const questionsMap = new Map(questions.map((question) => [question.id, question]));
    const missingIds = uniqueQuestionIds.filter((id) => !questionsMap.has(id));
    if (missingIds.length > 0) {
      throw new BadRequestException(`Questions not found in topic: ${missingIds.join(', ')}`);
    }

    const results = input.attempts.map((attempt) => {
      const question = questionsMap.get(attempt.questionId)!;
      const isCorrect = areSameSet(attempt.selectedOptionIds, question.correctOptionIds);
      return {
        questionId: attempt.questionId,
        selectedOptionIds: attempt.selectedOptionIds,
        correctOptionIds: question.correctOptionIds,
        isCorrect,
      };
    });

    await this.questionAttemptRepository.createMany(
      results.map((result) => ({
        userId: input.userId,
        topicId: input.topicId,
        questionId: result.questionId,
        selectedOptionIds: result.selectedOptionIds,
        isCorrect: result.isCorrect,
      })),
    );

    const stats = await this.questionAttemptRepository.getTopicStats(input.userId, input.topicId);

    return {
      results,
      summary: {
        submitted: results.length,
        correct: results.filter((result) => result.isCorrect).length,
      },
      topicProgress: {
        totalQuestions: topicQuestionsCount,
        attempted: stats.attempted,
        correct: stats.correct,
      },
    };
  }
}
