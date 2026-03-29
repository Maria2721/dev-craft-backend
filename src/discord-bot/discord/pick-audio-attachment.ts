import type { Attachment, Message } from 'discord.js';
import { MessageFlags } from 'discord.js';

export function pickAudioAttachment(message: Message): Attachment | null {
  const first = message.attachments.first();
  if (!first) {
    return null;
  }
  if (message.flags.has(MessageFlags.IsVoiceMessage)) {
    return first;
  }
  const ct = first.contentType ?? '';
  if (ct.startsWith('audio/')) {
    return first;
  }
  return null;
}
