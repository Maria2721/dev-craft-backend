type DifyChatResponse = {
  answer?: string;
  conversation_id?: string;
};

export class DifyChatClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async sendChatMessage(options: {
    query: string;
    discordUserId: string;
    conversationId?: string;
  }): Promise<{ answer: string; conversationId?: string }> {
    const url = `${this.baseUrl}/chat-messages`;
    const body: Record<string, unknown> = {
      query: options.query,
      user: `discord-${options.discordUserId}`,
      response_mode: 'blocking',
      inputs: {
        message_source: 'discord',
        devcraft_user_id: '0',
        discord_user_id: options.discordUserId,
      },
    };
    if (options.conversationId) {
      body.conversation_id = options.conversationId;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dify HTTP ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = (await res.json()) as DifyChatResponse;
    if (data.answer == null || data.answer === '') {
      throw new Error('Empty answer from Dify');
    }

    return {
      answer: data.answer,
      conversationId: data.conversation_id,
    };
  }
}
