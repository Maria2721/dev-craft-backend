import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class InternalTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.DISCORD_BOT_INTERNAL_API_TOKEN?.trim();
    if (!expected) {
      throw new UnauthorizedException();
    }
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers['x-internal-token'];
    if (typeof header === 'string' && header === expected) {
      return true;
    }
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7).trim();
      if (token === expected) {
        return true;
      }
    }
    throw new UnauthorizedException();
  }
}
