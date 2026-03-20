export type TopicListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  questionsCount: number;
  codeTasksCount: number;
};

export type TopicPreview = {
  topic: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    order: number;
  };
  questions: Array<{
    id: string;
    prompt: string;
    order: number;
  }>;
  codeTasks: Array<{
    id: string;
    title: string;
    description: string;
    taskType: 'AI_CHECK' | 'DRAG_DROP';
    order: number;
  }>;
};

export abstract class TopicRepository {
  abstract listForKnowledgeMap(): Promise<TopicListItem[]>;
  abstract getTopicPreview(topicId: string): Promise<TopicPreview | null>;
}
