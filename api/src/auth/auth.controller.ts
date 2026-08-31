import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUser } from '../common/decorators/currentuser.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieSameSite = isProd ? 'none' : 'lax';

    res.cookie('access_token', accessToken, {
      httpOnly: true,

      sameSite: cookieSameSite as any,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: cookieSameSite as any,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    const { access_token, refresh_token } = await this.authService.login({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    this.setAuthCookies(res, access_token, refresh_token);

    return res.json({
      message: 'Login successful',
    });
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@CurrentUser('id') userId: string, @Res() res: Response) {
    await this.authService.logout(userId);

    const isProd = process.env.NODE_ENV === 'production';

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as any,
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return res.json({
      message: 'Logout successful',
    });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const newAccessToken = await this.authService.refreshToken(refreshToken);

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as any,
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      message: 'Token refreshed successfully',
    });
  }

  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@CurrentUser() user) {
    return user;
  }
}
