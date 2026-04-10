import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../persistence/prisma/prisma.service';

const SHADOW_EMAIL_PREFIX = 'discord-';
const SHADOW_EMAIL_SUFFIX = '@discord.devcraft.internal';

@Injectable()
export class DiscordPracticeUserService {
  constructor(private readonly prisma: PrismaService) {}

  private sharedSystemUserId(): number {
    const raw = process.env.DISCORD_BOT_CONVERSATION_USER_ID?.trim();
    if (!raw) {
      throw new ServiceUnavailableException(
        'DISCORD_BOT_CONVERSATION_USER_ID is required when DISCORD_CODE_TASK_USER_MODE=shared',
      );
    }
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) {
      throw new ServiceUnavailableException('Invalid DISCORD_BOT_CONVERSATION_USER_ID');
    }
    return n;
  }

  private shadowEmail(discordUserId: string): string {
    return `${SHADOW_EMAIL_PREFIX}${discordUserId}${SHADOW_EMAIL_SUFFIX}`;
  }

  async resolveUserId(discordUserId: string): Promise<number> {
    const mode = (process.env.DISCORD_CODE_TASK_USER_MODE ?? 'shadow').trim().toLowerCase();
    if (mode === 'shared') {
      return this.sharedSystemUserId();
    }

    const email = this.shadowEmail(discordUserId);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return existing.id;
    }

    try {
      const created = await this.prisma.user.create({
        data: {
          name: 'Discord',
          surname: `u${discordUserId}`,
          email,
          passwordHash: null,
        },
        select: { id: true },
      });
      return created.id;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const again = await this.prisma.user.findUnique({ where: { email } });
        if (again) {
          return again.id;
        }
      }
      throw e;
    }
  }
}
