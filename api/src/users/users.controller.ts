import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtGuard)
  createUser(@CurrentUser() currentUser, @Body() createUserDto: CreateUserDto) {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return this.usersService.create(createUserDto);
  }
  // Get drivers belonging to the logged-in delivery company
  @Get('drivers')
  @UseGuards(JwtGuard)
  getCompanyDrivers(
    @CurrentUser() user: JwtUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.getCompanyDrivers(user, paginationDto);
  }
}
