import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../domain/repositories/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash?: string | null;
    name: string;
    surname: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        surname: data.surname,
        passwordHash: data.passwordHash ?? null,
      },
    });
  }
}
