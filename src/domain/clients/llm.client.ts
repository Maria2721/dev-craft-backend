export enum ChatRole {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
}

export type ChatMessage = { role: ChatRole; content: string };

export abstract class LlmClient {
  abstract chat(messages: ChatMessage[]): Promise<string>;
}
