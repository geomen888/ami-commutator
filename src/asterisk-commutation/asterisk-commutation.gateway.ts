import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { AsteriskCommutationService } from './asterisk-commutation.service';
import { CreateAsteriskCommutationDto } from './dto/create-asterisk-commutation.dto';
import { UpdateAsteriskCommutationDto } from './dto/update-asterisk-commutation.dto';

@WebSocketGateway()
export class AsteriskCommutationGateway {
  constructor(private readonly asteriskCommutationService: AsteriskCommutationService) {}

  @SubscribeMessage('createAsteriskCommutation')
  create(@MessageBody() createAsteriskCommutationDto: CreateAsteriskCommutationDto) {
    return this.asteriskCommutationService.create(createAsteriskCommutationDto);
  }

  @SubscribeMessage('findAllAsteriskCommutation')
  findAll() {
    return this.asteriskCommutationService.findAll();
  }

  @SubscribeMessage('findOneAsteriskCommutation')
  findOne(@MessageBody() id: number) {
    return this.asteriskCommutationService.findOne(id);
  }

  @SubscribeMessage('updateAsteriskCommutation')
  update(@MessageBody() updateAsteriskCommutationDto: UpdateAsteriskCommutationDto) {
    return this.asteriskCommutationService.update(updateAsteriskCommutationDto.id, updateAsteriskCommutationDto);
  }

  @SubscribeMessage('removeAsteriskCommutation')
  remove(@MessageBody() id: number) {
    return this.asteriskCommutationService.remove(id);
  }
}
