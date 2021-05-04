import { IConnectAmiCommand } from '../dto/interface';
import { ActionType } from '../../common/enum/ami-action-type';
import { ContextType } from '../../common/enum/context-type';


export abstract class GenericCommand implements IConnectAmiCommand {
   public readonly socketId: string;
   public readonly action: ActionType;
   public readonly channel: string;
   public readonly context: ContextType;
   public readonly exten: string;
   public readonly priority: number;
   public readonly id: string;

  constructor(options: IConnectAmiCommand) {
        Object.assign(this, options);
      }
  }