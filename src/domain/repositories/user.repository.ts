import { User } from '@prisma/client';

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: number): Promise<User | null>;
  abstract create(data: {
    email: string;
    passwordHash: string;
    name: string;
    surname: string;
  }): Promise<User>;
}
