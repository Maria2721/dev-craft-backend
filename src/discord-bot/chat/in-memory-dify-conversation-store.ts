export class InMemoryDifyConversationStore {
  private readonly map = new Map<string, string>();

  get(channelId: string, discordUserId: string): string | undefined {
    return this.map.get(`${channelId}:${discordUserId}`);
  }

  set(channelId: string, discordUserId: string, conversationId: string): void {
    this.map.set(`${channelId}:${discordUserId}`, conversationId);
  }
}
