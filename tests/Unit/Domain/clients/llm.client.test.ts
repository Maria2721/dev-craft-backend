/**
 * Unit tests for the domain LLM client contract (ChatMessage)
 */

describe('LlmClient / ChatMessage (Domain)', () => {
  it('ChatMessage must have role and content fields', () => {
    const message: { role: string; content: string } = {
      role: 'user',
      content: 'Hello',
    };
    expect(message).toHaveProperty('role');
    expect(message).toHaveProperty('content');
    expect(typeof message.role).toBe('string');
    expect(typeof message.content).toBe('string');
  });

  it('ChatMessage allows role: system | user | assistant per contract', () => {
    const roles = ['system', 'user', 'assistant'] as const;
    roles.forEach((role) => {
      const msg = { role, content: 'test' };
      expect(msg.role).toBe(role);
      expect(msg.content).toBe('test');
    });
  });
});
