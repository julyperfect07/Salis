import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import type { Prisma } from '../../generated/prisma/client';
import {
  ProductQueryDto,
  ProductSortBy,
  SortOrder,
} from './dto/product-query.dto';

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

  // Get the shop owner's products
  async getProducts(user: JwtUser, productQueryDto: ProductQueryDto) {
    this.ensureShopOwner(user);

    const {
      page,
      limit,
      search,
      isActive = true,
      sortBy = ProductSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = productQueryDto;

    const skip = (page - 1) * limit;
    const cleanSearch = search?.trim();

    const where: Prisma.ProductWhereInput = {
      shopOwnerId: user.id,
      isActive,

      ...(cleanSearch && {
        OR: [
          {
            name: {
              contains: cleanSearch,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: cleanSearch,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),

      this.prisma.product.count({
        where,
      }),
    ]);

    return {
      message: 'Products retrieved successfully',
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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

  // Archive a product without removing it from old orders

  async deleteProduct(user: JwtUser, productId: string) {
    this.ensureShopOwner(user);

    const product = await this.findOwnedProduct(user.id, productId);

    if (!product.isActive) {
      throw new BadRequestException('Product is already archived');
    }

    await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        isActive: false,
      },
    });

    return {
      message: 'Product archived successfully',
    };
  }

  // Restore an archived product
  async restoreProduct(user: JwtUser, productId: string) {
    this.ensureShopOwner(user);

    const product = await this.findOwnedProduct(user.id, productId);

    if (product.isActive) {
      throw new BadRequestException('Product is already active');
    }

    const restoredProduct = await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        isActive: true,
      },
    });

    return {
      message: 'Product restored successfully',
      product: restoredProduct,
    };
  }
}
