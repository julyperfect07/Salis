import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureShopOwner(user: JwtUser) {
    if (user.role !== Role.SHOP_OWNER) {
      throw new ForbiddenException('Only shop owners can manage products');
    }
  }

  private async findOwnedProduct(shopOwnerId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        shopOwnerId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(user: JwtUser, createProductDto: CreateProductDto) {
    this.ensureShopOwner(user);

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        shopOwnerId: user.id,
      },
    });

    return {
      message: 'Product created successfully',
      product,
    };
  }

  async getProducts(user: JwtUser) {
    this.ensureShopOwner(user);

    const products = await this.prisma.product.findMany({
      where: {
        shopOwnerId: user.id,
      },
    });

    return {
      message: 'Products retrieved successfully',
      products,
    };
  }

  async getProductById(user: JwtUser, productId: string) {
    this.ensureShopOwner(user);

    const product = await this.findOwnedProduct(user.id, productId);

    return {
      message: 'Product retrieved successfully',
      product,
    };
  }

  async updateProduct(
    user: JwtUser,
    productId: string,
    updateProductDto: UpdateProductDto,
  ) {
    this.ensureShopOwner(user);

    await this.findOwnedProduct(user.id, productId);

    const product = await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: updateProductDto,
    });

    return {
      message: 'Product updated successfully',
      product,
    };
  }

  async deleteProduct(user: JwtUser, productId: string) {
    this.ensureShopOwner(user);

    await this.findOwnedProduct(user.id, productId);

    await this.prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return {
      message: 'Product deleted successfully',
    };
  }
}
