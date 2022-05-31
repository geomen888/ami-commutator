import { AggregateRoot } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';

import { CloseAmiConnectEvent } from '../events/impl/ami-close.event'   
import { IConnectAmiCommand } from '../dto/interface';

@Injectable()
export class AggregateAmiModel extends AggregateRoot {
  public readonly debug = new Logger(AggregateAmiModel.name);
  constructor() {
    super();
  }

  public async applyConnect(data: IConnectAmiCommand): Promise<void> {
    // logic
    this.apply(new CloseAmiConnectEvent(data));
  }
}