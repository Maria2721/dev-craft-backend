/**
 * Unit tests for pickAudioAttachment
 */

import type { Attachment, Message } from 'discord.js';
import { MessageFlags } from 'discord.js';

import { pickAudioAttachment } from '../../../../src/discord-bot/discord/pick-audio-attachment';

describe('pickAudioAttachment', () => {
  it('returns null when there are no attachments', () => {
    const message = {
      attachments: { first: () => undefined },
      flags: { has: () => false },
    } as unknown as Message;
    expect(pickAudioAttachment(message)).toBeNull();
  });

  it('returns first attachment for voice message flag', () => {
    const att = { contentType: 'text/plain' } as Attachment;
    const message = {
      attachments: { first: () => att },
      flags: { has: (f: number) => f === MessageFlags.IsVoiceMessage },
    } as unknown as Message;
    expect(pickAudioAttachment(message)).toBe(att);
  });

  it('returns attachment when content type is audio', () => {
    const att = { contentType: 'audio/mpeg' } as Attachment;
    const message = {
      attachments: { first: () => att },
      flags: { has: () => false },
    } as unknown as Message;
    expect(pickAudioAttachment(message)).toBe(att);
  });

  it('returns null for non-audio attachment without voice flag', () => {
    const att = { contentType: 'image/png' } as Attachment;
    const message = {
      attachments: { first: () => att },
      flags: { has: () => false },
    } as unknown as Message;
    expect(pickAudioAttachment(message)).toBeNull();
  });
});
