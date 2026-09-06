import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  Matches,
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
  @Matches(/^\+?[0-9]{7,20}$/)
  phoneNumber!: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.SHOP_OWNER)
  @IsLatitude()
  latitude?: number;

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.SHOP_OWNER)
  @IsLongitude()
  longitude?: number;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === Role.DELIVERY_COMPANY)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
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
