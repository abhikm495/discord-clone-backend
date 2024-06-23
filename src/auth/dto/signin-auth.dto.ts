import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInAuthDto {
  @IsEmail()
  public email: string;
  @IsNotEmpty()
  @IsString()
  public password: string;
}
