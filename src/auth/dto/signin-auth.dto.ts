import { PartialType } from '@nestjs/mapped-types';
import { SignUpAuthDto } from './signup-auth.dto';

export class SignInAuthDto extends PartialType(SignUpAuthDto) {
  public email?: string;
  public password?: string;
}
