import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

import type { Attachment } from 'discord.js';

import { extensionFromAttachment } from './extension-from-attachment';

const execFileAsync = promisify(execFile);

export class FfmpegWavPreparer {
  async convertToWav(input: Buffer, inputExt: string): Promise<Buffer> {
    const id = randomBytes(8).toString('hex');
    const inPath = path.join(os.tmpdir(), `dc-in-${id}${inputExt}`);
    const outPath = path.join(os.tmpdir(), `dc-out-${id}.wav`);
    try {
      await fs.writeFile(inPath, input);
      await execFileAsync(
        'ffmpeg',
        [
          '-hide_banner',
          '-loglevel',
          'error',
          '-y',
          '-i',
          inPath,
          '-ac',
          '1',
          '-ar',
          '16000',
          outPath,
        ],
        { timeout: 120_000 },
      );
      return await fs.readFile(outPath);
    } finally {
      await fs.unlink(inPath).catch(() => {});
      await fs.unlink(outPath).catch(() => {});
    }
  }

  async prepareForDifyStt(
    raw: Buffer,
    attachment: Attachment,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const ext = extensionFromAttachment(attachment);
    const inExt = ext === '.bin' ? '.ogg' : ext;
    const wav = await this.convertToWav(raw, inExt);
    return { buffer: wav, filename: 'voice.wav', mimeType: 'audio/wav' };
  }
}
