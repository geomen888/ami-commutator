import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { CommandBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Server } from 'ws';

import { IInputAmi } from './dto/interface';
import { AmiOriginateCommand } from '../asterisk-commutation/commands/impl/connect-ami.command';
import { EnvironmentConfigUtils as env } from '../utils/environment-config.utils';
import { JwtWsGuard } from '../auth/guards/ws-common.guard';

const port = env.number('PORT', 5000);
const stagePath =`/${env.string('NODE_ENV', 'dev')}`;

@WebSocketGateway(port, { path: stagePath })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly commandBus: CommandBus){

  }

  @UseGuards(JwtWsGuard)
  @SubscribeMessage('events')
  async onEvent(client: any, data: IInputAmi): Promise<void> {
    try {
    
    await this.commandBus.execute(new AmiOriginateCommand({
     ...data.payload,
     ...data.order
    }));

    return;

  } catch (e) {
    console.error('onEvent:e:', e);
  }
  }
}
