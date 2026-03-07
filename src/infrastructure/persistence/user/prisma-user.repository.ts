import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../domain/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: { email: string; passwordHash: string; name: string; surname: string }) {
    return this.prisma.user.create({ data });
  }
}
