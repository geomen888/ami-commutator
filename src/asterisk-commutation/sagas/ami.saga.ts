import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { CloseAmiConnectEvent } from '../events/impl/ami-close.event';
import { AmiCloseCommand } from '../commands/impl/close-ami.command';

@Injectable()
export class AmiSagas {
 private readonly debug = new Logger(AmiSagas.name);
   
  @Saga()
  amiSaga = (events$: Observable<any>): Observable<ICommand> => {

    return events$
      .pipe(
        ofType(CloseAmiConnectEvent),
        delay(1000),
        map(event => {
            this.debug.log(event, 'Inside [Ami - Sagas] Saga');
            return new AmiCloseCommand(event)
        }),
      );
  }

  

}

