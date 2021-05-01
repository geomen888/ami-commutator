import { GenericCommand } from '../../factory/generic.command';
import { IConnectAmiCommand } from '../../dto/interface';

export class AmiOriginateCommand extends GenericCommand {
    constructor(options: IConnectAmiCommand) {
      super(options)
    }
  }