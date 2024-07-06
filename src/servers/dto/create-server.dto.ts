import { Length } from 'class-validator';

export class CreateServerDto {
  @Length(4, 8)
  name: string;
}
