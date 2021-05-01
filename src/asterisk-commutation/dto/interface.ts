import { ActionType } from '../../common/enum/ami-action-type';
import { ContextType } from '../../common/enum/context-type';
import Ami from 'asterisk-ami-client';

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