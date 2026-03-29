import * as path from 'node:path';

import type { Attachment } from 'discord.js';

export function extensionFromAttachment(attachment: Attachment): string {
  const n = attachment.name?.toLowerCase() ?? '';
  const ext = path.extname(n);
  if (ext) {
    return ext;
  }
  const ct = attachment.contentType ?? '';
  if (ct.includes('ogg')) {
    return '.ogg';
  }
  if (ct.includes('webm')) {
    return '.webm';
  }
  if (ct.includes('wav')) {
    return '.wav';
  }
  return '.bin';
}
