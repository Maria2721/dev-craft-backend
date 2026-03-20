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

  async getTopicPreview(topicId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        questions: {
          select: {
            id: true,
            prompt: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
        codeTasks: {
          select: {
            id: true,
            title: true,
            description: true,
            taskType: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!topic) {
      return null;
    }

    return {
      topic: {
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        order: topic.order,
      },
      questions: topic.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        order: question.order,
      })),
      codeTasks: topic.codeTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        taskType: task.taskType,
        order: task.order,
      })),
    };
  }
}
