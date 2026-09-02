import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class OrderQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
