import { IsLatitude, IsLongitude } from 'class-validator';

export class UpdateShopLocationDto {
  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;
}
