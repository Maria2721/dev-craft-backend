export interface CreateCodeTaskAttemptInput {
  userId: number;
  topicId: string;
  codeTaskId: string;
  valid: boolean;
  hints: string | null;
  justification: string | null;
  improvements: string | null;
}

export abstract class CodeTaskAttemptRepository {
  abstract create(input: CreateCodeTaskAttemptInput): Promise<{ id: string }>;
}
