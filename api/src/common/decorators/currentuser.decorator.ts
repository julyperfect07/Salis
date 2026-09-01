import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtUser } from '../../auth/types/jwt-user.type';

type RequestWithUser = Request & {
  user?: JwtUser;
};

export const CurrentUser = createParamDecorator(
  (field: keyof JwtUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    return field ? user?.[field] : user;
  },
);
