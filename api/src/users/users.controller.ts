import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateDeliveryCompanyProfileDto } from './dto/update-delivery-company-profile.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';

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

  // Create a driver inside the logged-in delivery company
  @Post('drivers')
  @UseGuards(JwtGuard)
  createCompanyDriver(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateDriverDto,
  ) {
    return this.usersService.createCompanyDriver(user, dto);
  }

  // Activate or suspend one of the company's drivers
  @Patch('drivers/:id/status')
  @UseGuards(JwtGuard)
  updateCompanyDriverStatus(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverStatusDto,
  ) {
    return this.usersService.updateCompanyDriverStatus(user, id, dto);
  }

  // Get the logged-in user's full profile
  @Get('me')
  @UseGuards(JwtGuard)
  getMyProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.getMyProfile(user);
  }

  // Update the logged-in user's profile
  @Patch('me')
  @UseGuards(JwtGuard)
  updateMyProfile(
    @CurrentUser() user: JwtUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateMyProfile(user, updateProfileDto);
  }

  // Change the logged-in user's password
  @Patch('me/change-password')
  @UseGuards(JwtGuard)
  changePassword(
    @CurrentUser() user: JwtUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user, changePasswordDto);
  }

  // Update the logged-in delivery company's operational profile
  @Patch('me/delivery-company')
  @UseGuards(JwtGuard)
  updateDeliveryCompanyProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateDeliveryCompanyProfileDto,
  ) {
    return this.usersService.updateDeliveryCompanyProfile(user, dto);
  }
}
