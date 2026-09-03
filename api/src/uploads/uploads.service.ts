import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Role } from '../../generated/prisma/enums';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  // Upload multiple product images
  async uploadProductImages(user: JwtUser, files: Express.Multer.File[]) {
    if (user.role !== Role.SHOP_OWNER) {
      throw new ForbiddenException(
        'Only shop owners can upload product images',
      );
    }

    if (!files?.length) {
      throw new BadRequestException('At least one image is required');
    }

    const imageUrls = await Promise.all(
      files.map((file) => this.uploadImage(file, 'salis/products')),
    );

    return {
      message: 'Images uploaded successfully',
      imageUrls,
    };
  }

  // Upload and save the user's avatar
  async uploadAvatar(user: JwtUser, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('A profile image is required');
    }

    const imageUrl = await this.uploadImage(file, 'salis/avatars');

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        imageUrl,
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

    return {
      message: 'Profile image updated successfully',
      user: updatedUser,
    };
  }

  // Upload one image to Cloudinary
  private uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);

            reject(new InternalServerErrorException('Image upload failed'));
            return;
          }

          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
