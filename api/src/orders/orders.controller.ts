import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { VerifyPickupCodeDto } from './dto/verify-pickup-code.dto';
import { FailOrderDto } from './dto/fail-order.dto';

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create an order as a shop owner
  @Post()
  createOrder(
    @CurrentUser() user: JwtUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user, createOrderDto);
  }

  // Get the shop owner's orders
  @Get()
  getOrders(
    @CurrentUser() user: JwtUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.getOrders(user, paginationDto);
  }

  // Get orders assigned to the delivery company
  @Get('assigned')
  getAssignedOrders(
    @CurrentUser() user: JwtUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.getAssignedOrders(user, paginationDto);
  }

  // Get one order by its ID
  @Get(':id')
  getOrderById(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.getOrderById(user, id);
  }

  // Accept an order as a delivery company
  @Patch(':id/accept')
  acceptOrder(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.acceptOrder(user, id);
  }

  // Assign a company driver to an accepted order
  @Patch(':id/assign-driver')
  assignDriver(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDriverDto: AssignDriverDto,
  ) {
    return this.ordersService.assignDriver(user, id, assignDriverDto);
  }
  // Get orders assigned to the logged-in driver
  @Get('driver/assigned')
  getDriverOrders(
    @CurrentUser() user: JwtUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.getDriverOrders(user, paginationDto);
  }
  // Verify the pickup code and mark the order as picked up
  @Patch(':id/pickup')
  pickupOrder(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() verifyPickupCodeDto: VerifyPickupCodeDto,
  ) {
    return this.ordersService.pickupOrder(user, id, verifyPickupCodeDto);
  }

  // Start delivering a picked-up order
  @Patch(':id/start-delivery')
  startDelivery(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.startDelivery(user, id);
  }

  // Mark an order as successfully delivered
  @Patch(':id/deliver')
  deliverOrder(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.deliverOrder(user, id);
  }
  // Mark a delivery attempt as failed
  @Patch(':id/mark-failed')
  failOrder(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() failOrderDto: FailOrderDto,
  ) {
    return this.ordersService.failOrder(user, id, failOrderDto);
  }

  // Confirm that a failed order was returned to the shop
  @Patch(':id/confirm-return')
  confirmReturn(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.confirmReturn(user, id);
  }

  // Confirm receiving payment for a delivered order
  @Patch(':id/confirm-payment')
  confirmPayment(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.confirmPayment(user, id);
  }

  // Cancel an order before the delivery company accepts it
  @Patch(':id/cancel')
  cancelOrder(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.cancelOrder(user, id);
  }
}
