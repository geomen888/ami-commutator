import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';

import { CloseAmiConnectEvent } from '../impl/ami-close.event';


@Injectable()
@EventsHandler(CloseAmiConnectEvent)
export class CloseAmiConnectEventHandler implements 
    IEventHandler<CloseAmiConnectEvent> {
       

    handle(event: CloseAmiConnectEvent) {
        console.log('CloseAmiConnectEvent...'
            + event);
    }
}