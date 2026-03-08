import { Message } from '@prisma/client';

export abstract class MessageRepository {
  abstract create(data: {
    conversationId: string;
    role: string;
    content: string;
  }): Promise<Message>;
  abstract findLastByConversationId(conversationId: string, limit: number): Promise<Message[]>;
}
