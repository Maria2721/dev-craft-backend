import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';

export type UserPracticeStatsInput = {
  userId: number;
  topicId?: string;
  topicSlug?: string;
};

export type UserPracticeStatsResult = {
  resolvedTopic: { id: string; slug: string; title: string } | null;
  codeTaskAttemptsTotal: number;
  codeTaskAttemptsValid: number;
  codeTaskAttemptsLast7Days: number;
  codeTaskAttemptsValidLast7Days: number;
};

@Injectable()
export class GetPlatformStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: UserPracticeStatsInput): Promise<UserPracticeStatsResult> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userWhere = { userId: input.userId };

    let resolvedTopic: { id: string; slug: string; title: string } | null = null;
    if (input.topicId != null && input.topicId !== '') {
      const t = await this.prisma.topic.findUnique({
        where: { id: input.topicId },
        select: { id: true, slug: true, title: true },
      });
      resolvedTopic = t;
    } else if (input.topicSlug != null && input.topicSlug.trim() !== '') {
      const t = await this.prisma.topic.findUnique({
        where: { slug: input.topicSlug.trim() },
        select: { id: true, slug: true, title: true },
      });
      resolvedTopic = t;
    }

    const topicFilter = resolvedTopic ? { topicId: resolvedTopic.id } : {};

    const [
      codeTaskAttemptsTotal,
      codeTaskAttemptsValid,
      codeTaskAttemptsLast7Days,
      codeTaskAttemptsValidLast7Days,
    ] = await Promise.all([
      this.prisma.codeTaskAttempt.count({ where: { ...userWhere, ...topicFilter } }),
      this.prisma.codeTaskAttempt.count({
        where: { ...userWhere, ...topicFilter, valid: true },
      }),
      this.prisma.codeTaskAttempt.count({
        where: {
          ...userWhere,
          ...topicFilter,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.codeTaskAttempt.count({
        where: {
          ...userWhere,
          ...topicFilter,
          valid: true,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    return {
      resolvedTopic,
      codeTaskAttemptsTotal,
      codeTaskAttemptsValid,
      codeTaskAttemptsLast7Days,
      codeTaskAttemptsValidLast7Days,
    };
  }
}
