import { Injectable } from '@nestjs/common';
import { OAuthProvider, User } from '@prisma/client';

import { OAuthRepository } from '../../../domain/repositories/oauth.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaOAuthRepository extends OAuthRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async saveState(state: string, provider: OAuthProvider, expiresAt: Date) {
    await this.prisma.oAuthState.create({
      data: { state, provider, expiresAt },
    });
  }

  async consumeState(state: string): Promise<OAuthProvider | null> {
    const row = await this.prisma.oAuthState.findUnique({ where: { state } });
    if (!row || row.expiresAt < new Date()) {
      if (row) {
        await this.prisma.oAuthState.delete({ where: { id: row.id } });
      }
      return null;
    }
    await this.prisma.oAuthState.delete({ where: { id: row.id } });
    return row.provider;
  }

  async saveExchangeCode(code: string, userId: number, expiresAt: Date) {
    await this.prisma.oAuthExchangeCode.create({
      data: { code, userId, expiresAt },
    });
  }

  async consumeExchangeCode(code: string): Promise<number | null> {
    const row = await this.prisma.oAuthExchangeCode.findUnique({ where: { code } });
    if (!row || row.expiresAt < new Date()) {
      if (row) {
        await this.prisma.oAuthExchangeCode.delete({ where: { id: row.id } });
      }
      return null;
    }
    await this.prisma.oAuthExchangeCode.delete({ where: { id: row.id } });
    return row.userId;
  }

  async findAccount(provider: OAuthProvider, providerAccountId: string) {
    const row = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
    });
    return row ? { userId: row.userId } : null;
  }

  async findAccountForUser(userId: number, provider: OAuthProvider) {
    const row = await this.prisma.oAuthAccount.findUnique({
      where: { userId_provider: { userId, provider } },
    });
    return row ? { providerAccountId: row.providerAccountId } : null;
  }

  async createAccount(userId: number, provider: OAuthProvider, providerAccountId: string) {
    await this.prisma.oAuthAccount.create({
      data: { userId, provider, providerAccountId },
    });
  }

  async createUserWithProviderAccount(params: {
    email: string;
    name: string;
    surname: string;
    provider: OAuthProvider;
    providerAccountId: string;
  }): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: params.email,
          name: params.name,
          surname: params.surname,
          passwordHash: null,
        },
      });
      await tx.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: params.provider,
          providerAccountId: params.providerAccountId,
        },
      });
      return user;
    });
  }
}
