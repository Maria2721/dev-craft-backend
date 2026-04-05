/**
 * Unit tests for extensionFromAttachment
 */

import type { Attachment } from 'discord.js';

import { extensionFromAttachment } from '../../../../src/discord-bot/audio/extension-from-attachment';

function makeAtt(partial: Partial<Attachment> & { name?: string | null }): Attachment {
  return partial as Attachment;
}

describe('extensionFromAttachment', () => {
  it('uses file extension from name', () => {
    expect(extensionFromAttachment(makeAtt({ name: 'File.WAV' }))).toBe('.wav');
  });

  it('maps ogg from content type when name has no ext', () => {
    expect(extensionFromAttachment(makeAtt({ name: 'voice', contentType: 'audio/ogg' }))).toBe(
      '.ogg',
    );
  });

  it('maps webm and wav from content type', () => {
    expect(extensionFromAttachment(makeAtt({ name: 'x', contentType: 'audio/webm' }))).toBe(
      '.webm',
    );
    expect(extensionFromAttachment(makeAtt({ name: 'x', contentType: 'audio/wav' }))).toBe('.wav');
  });

  it('defaults to .bin when no extension and unknown content type', () => {
    expect(
      extensionFromAttachment(makeAtt({ name: 'noext', contentType: 'application/octet-stream' })),
    ).toBe('.bin');
  });
});
