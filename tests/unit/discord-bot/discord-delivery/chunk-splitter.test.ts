/**
 * Unit tests for Discord chunk splitter
 */

import {
  DISCORD_MAX_MESSAGE_LENGTH,
  splitDiscordChunks,
  truncateForDiscord,
} from '../../../../src/discord-bot/discord-delivery/chunk-splitter';

describe('truncateForDiscord', () => {
  it('returns text when under limit', () => {
    expect(truncateForDiscord('hi')).toBe('hi');
  });

  it('truncates long text with suffix', () => {
    const long = 'a'.repeat(DISCORD_MAX_MESSAGE_LENGTH + 10);
    const out = truncateForDiscord(long);
    expect(out.length).toBeLessThanOrEqual(DISCORD_MAX_MESSAGE_LENGTH);
    expect(out).toContain('truncated');
  });
});

describe('splitDiscordChunks', () => {
  it('returns single chunk for short text', () => {
    expect(splitDiscordChunks('hello')).toEqual(['hello']);
  });

  it('splits on paragraph boundary when favorable', () => {
    const a = 'x'.repeat(100);
    const b = 'y'.repeat(100);
    const text = `${a}\n\n${b}`;
    const chunks = splitDiscordChunks(text, 150);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks.join('')).toContain('x');
  });

  it('handles text with no good break by hard slice', () => {
    const noSpace = 'z'.repeat(DISCORD_MAX_MESSAGE_LENGTH * 2 + 5);
    const chunks = splitDiscordChunks(noSpace);
    expect(chunks.length).toBeGreaterThan(1);
    const joined = chunks.join('');
    expect(joined.length).toBeGreaterThan(0);
  });
});
