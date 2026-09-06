import {
  IsEmail,
  IsOptional,
  Matches,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,20}$/)
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
