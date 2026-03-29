export type ChatQuery = {
  discordChannelId: string;
  discordUserId: string;
  message: string;
};

export interface ChatBackend {
  complete(query: ChatQuery): Promise<string>;
}
