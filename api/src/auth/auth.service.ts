import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: JwtPayload) {
    const payload = {
      sub: user.sub,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);

    await this.prisma.user.update({
      where: { id: user.sub },
      data: { refreshTokenHash },
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload =
        this.jwtService.verify<JwtPayload>(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user?.refreshTokenHash) {
        throw new UnauthorizedException();
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException();
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}