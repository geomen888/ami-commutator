import { JsonObject } from 'type-fest';
import Ami from 'asterisk-ami-client';

import { ActionType } from '../../common/enum/ami-action-type';
import { ContextType } from '../../common/enum/context-type';

export interface IConnectAmiCommand {
    socketId: string;
    action: ActionType;
    channel: string;
    context: ContextType;
    exten: string;
    priority: number;
    id: string;
}

export interface IAwsOptions {
    wssUrl: string;
    amiClient: Ami;
    amiPassword: string;
}


export interface IPubSubMessage<T = JsonObject> {
    action: string;
    data: T;
  }
  
  // FeelsGoodMan
export interface IMessage {
    type?: string;
    message?: string;
  } 

// export interface IIncapulatedMessage {
//    type: ActionType;
//     message?: string;
//   }