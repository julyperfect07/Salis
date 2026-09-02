import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyPickupCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  pickupCode!: string;
}
