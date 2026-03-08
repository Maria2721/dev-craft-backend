import { Injectable } from '@nestjs/common';

import { ConversationRepository } from '../../../domain/repositories/conversation.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaConversationRepository extends ConversationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string, userId?: number) {
    const where: { id: string; userId?: number } = { id };
    if (userId !== undefined) {
      where.userId = userId;
    }
    return this.prisma.conversation.findFirst({ where });
  }

  async create(data: { userId: number; taskId?: string; taskType?: string; taskTitle?: string }) {
    return this.prisma.conversation.create({ data });
  }
}
