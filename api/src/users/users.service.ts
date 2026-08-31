import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    if (createUserDto.role === Role.ADMIN) {
      throw new BadRequestException('Creating another admin is not allowed');
    }

    if (
      createUserDto.role === Role.DELIVERY_COMPANY &&
      (createUserDto.deliveryPrice === undefined ||
        !createUserDto.openTime ||
        !createUserDto.closeTime)
    ) {
      throw new BadRequestException(
        'Delivery price, open time and close time are required',
      );
    }

    if (createUserDto.role === Role.DRIVER) {
      if (!createUserDto.companyId) {
        throw new BadRequestException('Company ID is required');
      }

      const company = await this.prisma.deliveryCompany.findUnique({
        where: {
          userId: createUserDto.companyId,
        },
      });

      if (!company) {
        throw new NotFoundException('Delivery company not found');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: createUserDto.name.trim(),
          email,
          password: hashedPassword,
          phoneNumber: createUserDto.phoneNumber,
          imageUrl: createUserDto.imageUrl,
          role: createUserDto.role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          imageUrl: true,
          role: true,
        },
      });

      if (createUserDto.role === Role.SHOP_OWNER) {
        await transaction.shopOwner.create({
          data: {
            userId: user.id,
          },
        });
      }

      if (createUserDto.role === Role.DELIVERY_COMPANY) {
        await transaction.deliveryCompany.create({
          data: {
            userId: user.id,
            deliveryPrice: createUserDto.deliveryPrice!,
            openTime: createUserDto.openTime!,
            closeTime: createUserDto.closeTime!,
          },
        });
      }

      if (createUserDto.role === Role.DRIVER) {
        await transaction.driver.create({
          data: {
            userId: user.id,
            companyId: createUserDto.companyId!,
          },
        });
      }

      return user;
    });
  }
}
