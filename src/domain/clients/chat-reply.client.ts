import { ChatMessage } from './llm.client';

export type ChatReplyContext = {
  taskTitle?: string;
  taskDescription?: string;
  codeSnippet?: string;
};

export type ChatReplyInput = {
  userId: number;
  message: string;
  history: ChatMessage[];
  context?: ChatReplyContext;
  difyConversationId?: string | null;
};

export type ChatReplyOutput = {
  reply: string;
  difyConversationId?: string;
};

export abstract class ChatReplyClient {
  abstract reply(input: ChatReplyInput): Promise<ChatReplyOutput>;
}
