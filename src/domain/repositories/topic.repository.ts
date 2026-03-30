export type CodeTaskType = 'AI_CHECK' | 'DRAG_DROP';

export interface TopicBase {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
}

export interface TopicListItem extends TopicBase {
  questionsCount: number;
  codeTasksCount: number;
}

export interface TopicQuestionPreview {
  id: string;
  prompt: string;
  order: number;
}

export interface TopicCodeTaskPreview {
  id: string;
  title: string;
  description: string;
  taskType: CodeTaskType;
  order: number;
}

export interface TopicCodeTaskItem extends TopicCodeTaskPreview {
  referenceSolution: string | null;
}

export interface TopicPreview {
  topic: TopicBase;
  questions: TopicQuestionPreview[];
  codeTasks: TopicCodeTaskPreview[];
}

export interface TopicQuestionOption {
  id: string;
  label: string;
  text: string;
  order: number;
}

export interface TopicQuestionDetails extends TopicQuestionPreview {
  codeSnippet: string | null;
  options: TopicQuestionOption[];
  correctOptionIds: string[];
}

export interface TopicQuestions {
  topic: TopicBase;
  questions: TopicQuestionDetails[];
}

export interface TopicCodeTasks {
  topic: TopicBase;
  codeTasks: TopicCodeTaskItem[];
}

export abstract class TopicRepository {
  abstract listForKnowledgeMap(): Promise<TopicListItem[]>;
  abstract getTopicPreview(topicId: string): Promise<TopicPreview | null>;
  abstract getTopicQuestions(topicId: string): Promise<TopicQuestions | null>;
  abstract getTopicCodeTasks(topicId: string): Promise<TopicCodeTasks | null>;
}
