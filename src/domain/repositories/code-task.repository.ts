import { CodeTaskType } from './topic.repository';

export interface CodeTaskForAiCheck {
  id: string;
  title: string;
  description: string;
  taskType: CodeTaskType;
  referenceSolution: string | null;
}

export abstract class CodeTaskRepository {
  abstract findInTopic(topicId: string, codeTaskId: string): Promise<CodeTaskForAiCheck | null>;
}
