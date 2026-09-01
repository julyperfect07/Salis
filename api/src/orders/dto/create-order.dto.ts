import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DeliveryZone } from '../../../generated/prisma/enums';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @IsString()
  @IsNotEmpty()
  customerAddress!: string;

  @IsOptional()
  @IsString()
  customerNote?: string;

  @IsEnum(DeliveryZone)
  deliveryZone!: DeliveryZone;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
