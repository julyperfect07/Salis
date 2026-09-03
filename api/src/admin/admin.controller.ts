import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { AdminService } from './admin.service';
import { Query } from '@nestjs/common';
import { UserQueryDto } from './dto/user-query.dto';
import { Param, ParseUUIDPipe, Body, Patch } from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { OrderQueryDto } from '../orders/dto/order-query.dto';

@Controller('admin')
@UseGuards(JwtGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Get the main admin dashboard statistics
  @Get('dashboard')
  getDashboard(@CurrentUser() user: JwtUser) {
    return this.adminService.getDashboard(user);
  }

  // List users with pagination, role filtering, and search
  @Get('users')
  getUsers(@CurrentUser() user: JwtUser, @Query() userQueryDto: UserQueryDto) {
    return this.adminService.getUsers(user, userQueryDto);
  }

  // Get one user with role-specific details
  @Get('users/:id')
  getUserById(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.adminService.getUserById(user, id);
  }

  // Update a user's basic account information
  @Patch('users/:id')
  updateUser(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(user, id, updateUserDto);
  }

  // Activate or deactivate a user account
  @Patch('users/:id/status')
  updateUserStatus(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(user, id, updateUserStatusDto);
  }

  // Reset a user's password
  @Patch('users/:id/reset-password')
  resetUserPassword(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resetUserPasswordDto: ResetUserPasswordDto,
  ) {
    return this.adminService.resetUserPassword(user, id, resetUserPasswordDto);
  }

  // Get every order with filtering and pagination
  @Get('orders')
  getOrders(
    @CurrentUser() user: JwtUser,
    @Query() orderQueryDto: OrderQueryDto,
  ) {
    return this.adminService.getOrders(user, orderQueryDto);
  }
}
