import { IsNumber, Length } from 'class-validator';

export class RefreshTokenDto {
  @IsNumber()
  public userId: number;
  @Length(1)
  public refreshToken: string;
}
