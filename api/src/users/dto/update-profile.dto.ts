import {
  IsOptional,
  Matches,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Matches(/^[\p{L}\p{N}]+(?:[ '\-][\p{L}\p{N}]+)*$/u, {
    message:
      'Name can contain only letters, numbers, spaces, apostrophes, and hyphens',
  })
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
