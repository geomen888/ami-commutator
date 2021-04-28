import { PartialType } from '@nestjs/mapped-types';
import { CreateAsteriskCommutationDto } from './create-asterisk-commutation.dto';

export class UpdateAsteriskCommutationDto extends PartialType(CreateAsteriskCommutationDto) {
  id: number;
}
