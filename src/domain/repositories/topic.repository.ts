export type TopicListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  questionsCount: number;
  codeTasksCount: number;
};

export abstract class TopicRepository {
  abstract listForKnowledgeMap(): Promise<TopicListItem[]>;
}
