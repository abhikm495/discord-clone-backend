import { IsNumber } from 'class-validator';

export class SignOutAuthDto {
  @IsNumber()
  userId: number;
}
