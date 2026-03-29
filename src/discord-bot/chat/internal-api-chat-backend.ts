import type { ChatBackend, ChatQuery } from './chat-backend';

type InternalChatResponse = {
  conversationId?: string;
  messageId?: string;
  reply?: string;
};

export class InternalApiChatBackend implements ChatBackend {
  constructor(
    private readonly baseUrl: string,
    private readonly internalToken: string,
  ) {}

  async complete(query: ChatQuery): Promise<string> {
    const res = await fetch(`${this.baseUrl}/internal/discord/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': this.internalToken,
      },
      body: JSON.stringify({
        discordChannelId: query.discordChannelId,
        discordUserId: query.discordUserId,
        message: query.message,
      }),
    });

    const text = await res.text();
    let data: InternalChatResponse = {};
    try {
      data = JSON.parse(text) as InternalChatResponse;
    } catch {
      //
    }

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Internal chat API rejected token (401)');
      }
      const detail =
        data && typeof data === 'object' && 'message' in data ? String(data.message) : text;
      throw new Error(`Internal chat HTTP ${res.status}: ${detail.slice(0, 500)}`);
    }

    const reply = data.reply;
    if (reply == null || reply === '') {
      throw new Error('Empty reply from internal chat API');
    }
    return reply;
  }
}
