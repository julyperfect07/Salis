import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
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
import { DeliveryZone, Role } from '../../../generated/prisma/enums';

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

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.DELIVERY_COMPANY)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deliveryPrice?: number;

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.DELIVERY_COMPANY)
  @IsString()
  openTime?: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.DELIVERY_COMPANY)
  @IsString()
  closeTime?: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.DELIVERY_COMPANY)
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(DeliveryZone, { each: true })
  coverageZones?: DeliveryZone[];

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.DRIVER)
  @IsUUID()
  companyId?: string;
}
