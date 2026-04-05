import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OAuthProvider, User } from '@prisma/client';

import { OAuthRepository } from '../../../domain/repositories/oauth.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class OAuthAccountLinkingService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly oauthRepository: OAuthRepository,
  ) {}

  async provisionUser(params: {
    provider: OAuthProvider;
    providerAccountId: string;
    email: string;
    name: string;
    surname: string;
  }): Promise<User> {
    const linked = await this.oauthRepository.findAccount(
      params.provider,
      params.providerAccountId,
    );
    if (linked) {
      const user = await this.userRepository.findById(linked.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    }

    const userByEmail = await this.userRepository.findByEmail(params.email);
    if (userByEmail) {
      const existingSameProvider = await this.oauthRepository.findAccountForUser(
        userByEmail.id,
        params.provider,
      );
      if (
        existingSameProvider &&
        existingSameProvider.providerAccountId !== params.providerAccountId
      ) {
        throw new ConflictException('This email is already linked to another OAuth account');
      }
      if (!existingSameProvider) {
        await this.oauthRepository.createAccount(
          userByEmail.id,
          params.provider,
          params.providerAccountId,
        );
      }
      return userByEmail;
    }

    return this.oauthRepository.createUserWithProviderAccount({
      email: params.email,
      name: params.name,
      surname: params.surname,
      provider: params.provider,
      providerAccountId: params.providerAccountId,
    });
  }
}
