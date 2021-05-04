import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'ws';

import { EnvironmentConfigUtils as env } from '../utils/environment-config.utils';
import { JwtWsGuard } from '../auth/guards/ws-common.guard';

const port = env.number('PORT', 5000);
const stagePath =`/${env.string('NODE_ENV', 'dev')}`;

@WebSocketGateway(port, { path: stagePath })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @UseGuards(JwtWsGuard)
  @SubscribeMessage('events')
  onEvent(client: any, data: any): Observable<WsResponse<number>> {
    console.log('events:data::', data);
    return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  }
}
