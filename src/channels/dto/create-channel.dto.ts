import { IsString, IsNotEmpty, IsEnum, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export enum ChannelType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

@ValidatorConstraint({ name: 'isNotGeneral', async: false })
class IsNotGeneralConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    return text.toLowerCase() !== 'general';
  }

  defaultMessage() {
    return 'Channel name cannot be "general"';
  }
}

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsNotGeneralConstraint)
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;
}
