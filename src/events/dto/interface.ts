
import { IConnectAmiCommand } from '../../asterisk-commutation/dto/interface';


export interface IInputAmi {
    payload: Omit<IConnectAmiCommand, 'id'>;
    order: Record<'id', string>;
}
