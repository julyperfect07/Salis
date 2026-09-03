import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

import { PaginationDto } from '../common/dto/pagination.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller('products')
@UseGuards(JwtGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  createProduct(
    @CurrentUser() user: JwtUser,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(user, createProductDto);
  }

  // Get products with filtering, searching, and sorting
  @Get()
  getProducts(
    @CurrentUser() user: JwtUser,
    @Query() productQueryDto: ProductQueryDto,
  ) {
    return this.productsService.getProducts(user, productQueryDto);
  }

  @Get(':id')
  getProductById(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.getProductById(user, id);
  }

  @Patch(':id')
  updateProduct(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(user, id, updateProductDto);
  }

  @Delete(':id')
  deleteProduct(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.deleteProduct(user, id);
  }

  // Restore one of the shop owner's archived products
  @Patch(':id/restore')
  restoreProduct(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.restoreProduct(user, id);
  }
}
