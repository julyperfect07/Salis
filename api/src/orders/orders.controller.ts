import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(
    @CurrentUser() user: JwtUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user, createOrderDto);
  }

  @Get()
  getOrders(
    @CurrentUser() user: JwtUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.getOrders(user, paginationDto);
  }

  @Get(':id')
  getOrderById(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.getOrderById(user, id);
  }
}
