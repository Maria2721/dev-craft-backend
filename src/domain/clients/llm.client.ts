export type ChatMessage = { role: string; content: string };

export abstract class LlmClient {
  abstract chat(messages: ChatMessage[]): Promise<string>;
}
