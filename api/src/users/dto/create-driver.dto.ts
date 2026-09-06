import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @Matches(/^\+?[0-9]{7,20}$/)
  phoneNumber!: string;
}
