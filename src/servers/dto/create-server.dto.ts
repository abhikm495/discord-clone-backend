import { Length } from 'class-validator';

export class CreateServerDto {
  @Length(4, 12)
  name: string;
}
