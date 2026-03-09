import { Injectable } from '@nestjs/common';

import { MessageRepository } from '../../../domain/repositories/message.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaMessageRepository extends MessageRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: { conversationId: string; role: string; content: string }) {
    return this.prisma.message.create({ data });
  }

  async findLastByConversationId(conversationId: string, limit: number) {
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.reverse();
  }
}
