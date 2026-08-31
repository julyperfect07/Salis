import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  phoneNumber!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ValidateIf((dto: CreateUserDto) =>
    dto.role === Role.DELIVERY_COMPANY,
  )
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deliveryPrice?: number;

  @ValidateIf((dto: CreateUserDto) =>
    dto.role === Role.DELIVERY_COMPANY,
  )
  @IsString()
  openTime?: string;

  @ValidateIf((dto: CreateUserDto) =>
    dto.role === Role.DELIVERY_COMPANY,
  )
  @IsString()
  closeTime?: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.DRIVER)
  @IsUUID()
  companyId?: string;
}