import { GenericCommand } from '../../factory/generic.command';
import { IConnectAmiCommand } from '../../dto/interface';

export class CloseAmiConnectEvent extends GenericCommand {
    constructor(options: IConnectAmiCommand) {
      super(options)
    }
  }