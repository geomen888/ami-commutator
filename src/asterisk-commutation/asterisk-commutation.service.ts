import { Injectable } from '@nestjs/common';
import { CreateAsteriskCommutationDto } from './dto/create-asterisk-commutation.dto';
import { UpdateAsteriskCommutationDto } from './dto/update-asterisk-commutation.dto';

@Injectable()
export class AsteriskCommutationService {
  create(createAsteriskCommutationDto: CreateAsteriskCommutationDto) {
    return 'This action adds a new asteriskCommutation';
  }

  findAll() {
    return `This action returns all asteriskCommutation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asteriskCommutation`;
  }

  update(id: number, updateAsteriskCommutationDto: UpdateAsteriskCommutationDto) {
    return `This action updates a #${id} asteriskCommutation`;
  }

  remove(id: number) {
    return `This action removes a #${id} asteriskCommutation`;
  }
}
