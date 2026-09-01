import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { JwtUser } from '../types/jwt-user.type';
import { Role } from '../../../generated/prisma/enums';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.access_token ?? null,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: JwtPayload): JwtUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
