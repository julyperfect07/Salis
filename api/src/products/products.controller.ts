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
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { CurrentUser } from '../common/decorators/currentuser.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

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

  @Get()
  getProducts(@CurrentUser() user: JwtUser) {
    return this.productsService.getProducts(user);
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
}
