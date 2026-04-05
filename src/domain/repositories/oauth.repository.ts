import { OAuthProvider, User } from '@prisma/client';

export abstract class OAuthRepository {
  abstract saveState(state: string, provider: OAuthProvider, expiresAt: Date): Promise<void>;
  abstract consumeState(state: string): Promise<OAuthProvider | null>;
  abstract saveExchangeCode(code: string, userId: number, expiresAt: Date): Promise<void>;
  abstract consumeExchangeCode(code: string): Promise<number | null>;
  abstract findAccount(
    provider: OAuthProvider,
    providerAccountId: string,
  ): Promise<{ userId: number } | null>;
  abstract findAccountForUser(
    userId: number,
    provider: OAuthProvider,
  ): Promise<{ providerAccountId: string } | null>;
  abstract createAccount(
    userId: number,
    provider: OAuthProvider,
    providerAccountId: string,
  ): Promise<void>;
  abstract createUserWithProviderAccount(params: {
    email: string;
    name: string;
    surname: string;
    provider: OAuthProvider;
    providerAccountId: string;
  }): Promise<User>;
}
