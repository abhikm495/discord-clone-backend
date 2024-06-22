import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignUpAuthDto {
  @IsString()
  public name: string;
  @IsEmail()
  public email: string;
  @IsNotEmpty()
  @IsString()
  @Length(3, 20, { message: 'Password length must be between 3 and 20' })
  public password: string;
}
