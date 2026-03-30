export class DifySttClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async transcribe(options: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
    discordUserId: string;
  }): Promise<string> {
    const form = new FormData();
    form.append(
      'file',
      new Blob([options.buffer], { type: options.mimeType || 'application/octet-stream' }),
      options.filename,
    );
    form.append('user', `discord-${options.discordUserId}`);

    const res = await fetch(`${this.baseUrl}/audio-to-text`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dify audio-to-text HTTP ${res.status}: ${text.slice(0, 500)}`);
    }
    const data = (await res.json()) as { text?: string };
    return (data.text ?? '').trim();
  }
}
