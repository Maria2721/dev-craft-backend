export interface CreateQuestionAttemptInput {
  userId: number;
  topicId: string;
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
}

export interface TopicAttemptStats {
  attempted: number;
  correct: number;
}

export abstract class QuestionAttemptRepository {
  abstract createMany(inputs: CreateQuestionAttemptInput[]): Promise<void>;
  abstract getTopicStats(userId: number, topicId: string): Promise<TopicAttemptStats>;
}
