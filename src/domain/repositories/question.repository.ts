export interface QuestionForAttempt {
  id: string;
  correctOptionIds: string[];
}

export abstract class QuestionRepository {
  abstract findForAttempts(topicId: string, questionIds: string[]): Promise<QuestionForAttempt[]>;
  abstract countByTopic(topicId: string): Promise<number>;
}
