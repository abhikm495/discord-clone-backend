import { IsString } from 'class-validator';

export class UpdateMemberDto {
  @IsString()
  role: 'GUEST' | 'MODERATOR';
}
