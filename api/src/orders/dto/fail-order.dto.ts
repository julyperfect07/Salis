import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class FailOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}
