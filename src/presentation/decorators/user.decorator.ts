import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RequestUser = { userId: number };

export const User = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | number => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
