import { Conversation } from '@prisma/client';

export abstract class ConversationRepository {
  abstract findById(id: string, userId?: number): Promise<Conversation | null>;
  abstract create(data: {
    userId: number;
    taskId?: string;
    taskType?: string;
    taskTitle?: string;
  }): Promise<Conversation>;
  abstract setDifyConversationId(conversationId: string, difyConversationId: string): Promise<void>;
}
