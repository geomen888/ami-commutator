import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { JsonObject } from 'type-fest';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import WSS from 'ws';

import { AmiOriginateCommand } from '../impl/connect-ami.command'
import { IAwsOptions, IMessage, IPubSubMessage } from '../../dto/interface';
import { AggregateAmiModel } from '../../models/asterisk.model';
import { Utils } from '../../../utils';
import { OrderStatusType } from '../../../common/enum/order-status-type';

@CommandHandler(AmiOriginateCommand)
export class OriginateCommandHandler implements ICommandHandler<AmiOriginateCommand> {
    private wss!: WSS | null;
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
                amiClient,
                amiPassword
            } = this.options;
            this.debug.log(JSON.stringify(command, null, 2), 'input::');
            await this.connect(command.id);
            await Utils.delay(1000);
            const amiSaga = this.publisher.mergeObjectContext(this.rep);
            this.wss.on('open', () => {
                this.debug.log('wss connected ...');
                amiClient
                .connect('ami-manager', amiPassword, { host: 'localhost', port: 5038 })
                .then(() => {
                    amiClient
                        .on('connect', () => console.log('connect -- ami'))
                        .on('event', event => console.log(event))
                        .on('data', chunk => console.log(chunk))
                        .on('hangup', chunk => { 
                            console.log("hangup:");
                            
                            console.log(chunk); })
                        .on('response', response => console.log("responce-ami:", response))
                        .on('disconnect', () => console.log('disconnect'))
                        .on('reconnection', () => console.log('reconnection'))
                        .on('internalError', error => console.log(error))
                        .action({
                            Action: 'Ping'
                        });
                    }).catch(error => console.log("error:ami-client:", error));

                    // amiSaga.commit();
                this.wss.on('message', (msg: string) => {
                    const { data, action }: IPubSubMessage<IMessage> = JSON.parse(msg);
                    switch (action) {
                        case 'PONG':
                          this.debug.log('Received PONG from PubSub');
                          break;
                
                        case 'MESSAGE':
                          if (data && data.message && Utils.IsJsonString(data.message)) {
                           this.debug.log(data.message, 'received:message: %s');
                           amiClient.disconnect();
                           
                           amiSaga.commit();
                            // const message: MessageMessage = JSON.parse(data.message);
                            // const { topic } = data;
                            // const channel = (await ChannelManager.get(
                            //   topic.replace(/^(video-playback|community-points-channel-v1)\./, ''),
                            //   Platform.get(Platform.Names.TWITCH),
                            // ))!;
                
                            // switch (message.type) {
                            //   case 'viewcount':
                            //     if (channel.live) {
                            //       channel.viewcount = message.viewers!;
                
                            //       await this.manager.save(channel);
                            //     }
                            //     break;
                
                            //   case 'stream-up':
                            //     channel.live = true;
                
                            //     await this.manager.save(channel);
                            //     break;
                
                            //   case 'stream-down':
                            //     channel.live = false;
                            //     channel.viewcount = 0;
                
                            //     await this.manager.save(channel);
                            //     break;
                
                            //   case 'reward-redeemed':
                            //   case 'commercial':
                            //     console.debug(message);
                
                            //     await Platform.get(Platform.Names.TWITCH).message(channel, 'asd');
                            //     break;
                            // }
                          }
                          break;
                
                        case 'RECONNECT':
                          this.debug.warn('PubSub server sent a reconnect message. Restarting the socket.');
                          this.wss!.close();
                          break;
                      }
                    })
                    

                    // if (IsJsonString(message)) {
                    //     console.log('payload:original:', message);

                    //     const { originatePayload } = JSON.parse(message);
                    //     console.dir('payload:', originatePayload);

                    //     console.log('payload:', JSON.stringify({ ...originatePayload, priority: 1 }));

                    //     // client1.action({ ...originatePayload, priority: 1 }, (err, done) => {
                    //     //     if (err) {
                    //     //         console.error('actions:originate:', err)
                    //     //         return;
                    //     //     }
                    //     // })

                       
                    // }


                   
                            // if (Utils.IsJsonString(message)) {
                            //     console.log('payload:original:', message);

                            //     const { originatePayload } = JSON.parse(message);
                            //     console.dir('payload:', originatePayload);

                            //     console.log('payload:', JSON.stringify({ ...originatePayload, priority: 1 }));

                                // client1.action({ ...originatePayload, priority: 1 }, (err, done) => {
                                //     if (err) {
                                //         console.error('actions:originate:', err)
                                //         return;
                                //     }
                                // })

                               
                          //   }

                   
            

                this.ping = setInterval(() => this.sendData('PING'), 15000);

                this.wss.on('close', (e: any) => {
                    clearInterval(this.ping);
                    this.wss = null;
                    this.debug.log(e.reason, 'Socket is closed. Reconnect will be attempted in 7.5 second.');
                    setTimeout(() => {
                        this.connect(command.id);
                    }, 7500);
                });

                this.wss.on('error', (err) => {
                    console.log('Socket encountered error: ', err);
                    this.wss.close();
                });
            });
        } catch (e) {
            this.debug.error(e.message, 'execute:AmiOriginateCommand:e:');
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
            data: {
                status: OrderStatusType.INITIALIZE
            }
        });
        this.debug.log(token, 'token::');
        this.debug.log(wssUrl, 'url::')

        this.wss = new WSS(wssUrl, 'ami-1.0', {
            headers: {
                "X-Amz-Security-Token": token,
            }
        });
    } catch (e) {
        this.debug.error(e, 'execute:connect:e::')
    }
        // return;
    }

    private sendData(action: string, message?: JsonObject): void {

        this.wss!.send(JSON.stringify({
            action,
            message,
            nonce: randomBytes(16).toString('hex'),
        }));
    }


}