import { DifyChatClient } from '../dify/dify-chat-client';
import type { ChatBackend, ChatQuery } from './chat-backend';
import { InMemoryDifyConversationStore } from './in-memory-dify-conversation-store';

export class DirectDifyChatBackend implements ChatBackend {
  constructor(
    private readonly dify: DifyChatClient,
    private readonly conversations: InMemoryDifyConversationStore,
  ) {}

  async complete(query: ChatQuery): Promise<string> {
    const previous = this.conversations.get(query.discordChannelId, query.discordUserId);
    const out = await this.dify.sendChatMessage({
      query: query.message,
      discordUserId: query.discordUserId,
      conversationId: previous,
    });
    if (out.conversationId) {
      this.conversations.set(query.discordChannelId, query.discordUserId, out.conversationId);
    }
    return out.answer;
  }
}
