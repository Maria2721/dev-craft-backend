import { Injectable } from '@nestjs/common';

import { TopicRepository } from '../../../domain/repositories/topic.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaTopicRepository extends TopicRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listForKnowledgeMap() {
    const topics = await this.prisma.topic.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            questions: true,
            codeTasks: true,
          },
        },
      },
    });

    return topics.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      order: topic.order,
      questionsCount: topic._count.questions,
      codeTasksCount: topic._count.codeTasks,
    }));
  }
}
