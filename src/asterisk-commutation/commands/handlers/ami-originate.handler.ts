import { Inject, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { JsonObject } from 'type-fest';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import Wss from 'ws';
import Ami from 'asterisk-ami-client';

import { AmiOriginateCommand } from '../impl/connect-ami.command';
import { IAwsOptions, IMessage, IPubSubMessage } from '../../dto/interface';
import { AggregateAmiModel } from '../../models/asterisk.model';
import { Utils } from '../../../utils';
import { OrderStatusType } from '../../../common/enum/order-status-type';
import { ActionType } from '../../../common/enum/ami-action-type';

@CommandHandler(AmiOriginateCommand)
export class OriginateCommandHandler implements ICommandHandler<AmiOriginateCommand> {
    private wss: Wss | null;
    private terminate: boolean = false; 
    private events: string[] = [];
    private triggerAnswer: string[] = [];
    public readonly debug = new Logger(OriginateCommandHandler.name);
    ping!: NodeJS.Timeout;

    constructor(
        @Inject('aggregate') private rep: AggregateAmiModel,
        @Inject('AWS_OPTIONS') private options: IAwsOptions,
        protected readonly jwtService: JwtService,
        private readonly publisher: EventPublisher,

    ) { }
    async execute(command: AmiOriginateCommand) {
        try {
            const {
                amiPassword,
                amiPort,
                amiHostIp
            } = this.options;
            const amiClient = new Ami();
            this.debug.log(JSON.stringify(command, null, 2), 'input::');
            await this.connect(command.id);
            const amiSaga = this.publisher.mergeObjectContext(this.rep);

            this.debug.log(this.wss.readyState, 'amiSaga... wss.state::');
                this.debug.log('wss connected ...');
                amiClient
                    .connect('ami-manager', amiPassword, { host: amiHostIp, port: amiPort })
                    .then(() => {
                        amiClient
                            .on('connect', () => console.log('connect -- ami'))
                            .on('event', event => { 
                                console.log('event::', event);
                                this.events.push(event.Event);
                                if (event && event.State && event.State === 'NOT_INUSE') {
                                    this.triggerAnswer.push(event.State)
                               }
                               const events: Set<string> = new Set<string>(this.events.slice(-2));
                                // ANSWER
                                 if (this.triggerAnswer.length && events.size === 2 &&
                                     Utils.compareArrays(Array.from(events), ['Hangup', 'BridgeDestroy']) ) {
                                     this.sendData('HANGUP', { id:  command.id });
                                 }       

                            })
                            .on('data', chunk => console.log('data::',chunk))
                            .on('response', response => console.log("responce-ami:", response))
                            .on('disconnect', () => console.log('disconnect'))
                            .on('reconnection', () => console.log('reconnection'))
                            .on('internalError', error => console.log(error))
                            .action({
                                Action: 'Ping'
                            })
                            .action({
                                 ...command, priority: 1 
                            })

                        
                    }).catch(error => console.log("error:ami-client:", error));

        
                this.wss.on('message', (msg: string) => {
                    const { data, action }: IPubSubMessage<IMessage> = JSON.parse(msg);
                    switch (action) {
                        case 'PONG':
                            this.debug.log('Received PONG from PubSub');
                            break;

                        case 'MESSAGE':
                            if (data && data.type) {
                                this.debug.log(data.message, 'received:message:parsed: %s');
                                this.debug.log(JSON.stringify(data, null, 2), 'received:message:input::');

                                switch (data.type) {
                                  case ActionType.DISCONNECT:
                                    this.debug.log(ActionType.DISCONNECT, 'case::');
                                    this.terminate = true;
                                    this.wss?.close();
                                    this.wss?.terminate();
                                    clearInterval(this.ping);
                                    this.wss = null;
                                    amiClient.disconnect();
                                    amiSaga.commit();
                                    break;
                                }
                            }
                            break;

                        case 'RECONNECT':
                            this.debug.warn('PubSub server sent a reconnect message. Restarting the socket.');
                            this.wss!.close();
                            break;
                    }
                })

                this.ping = setInterval(() => this.sendData('PING'), 15000);
                this.wss.on('close', (e: any) => {
                    this.debug.log(e, 'Socket is closed.');
                    clearInterval(this.ping);
                    this.wss = null;
                     if (!this.terminate) {
                        this.debug.log(e.reason, 'Socket is closed. Reconnect will be attempted in 7.5 second.');
                        setTimeout(() => {
                            this.connect(command.id);
                        }, 7500);
                     } else {
                        this.debug.log(e.reason, 'Socket is terminate');
                     }
                   
                });

                this.wss.on('error', (err) => {
                    console.log('Socket encountered error: ', err);
                    this.wss.close();
                });
            
        } catch (e) {
            console.log('error:e::', e)
            this.debug.error(e.message, 'execute:AmiOriginateCommand:e::');
        }
    }

    private async connect(id: string): Promise<void> {
        const {
            wssUrl,
        } = this.options;
        try {
            const token = await this.jwtService.signAsync({
                sub: 'asterisk',
                ID: id,
                data: OrderStatusType.INITIALIZE
            });
            // this.debug.log(token, 'token::');
            // this.debug.log(wssUrl, 'url::')

            this.wss = new Wss(wssUrl, "ami-1.0", {
                headers: {
                    "X-Amz-Security-Token": token,
                }
            });

            const open = await Utils.connection(this.wss);
            if (!open) {
                throw new UnauthorizedException('wss aws failed');
            }

            return;
        } catch (e) {
            this.debug.error(e, 'execute:connect:e::')
        }
        // return;
    }

    private sendData(action: string, message?: JsonObject): void {
        if (!this.wss || this.wss && this.wss?.readyState !== Wss.OPEN) {

            return;
        }
        this.wss.send(JSON.stringify({
            action,
            message,
            nonce: randomBytes(16).toString('hex'),
        }));
    }


}