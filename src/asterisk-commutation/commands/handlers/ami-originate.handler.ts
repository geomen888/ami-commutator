import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import WSS from 'ws';

import { AmiOriginateCommand } from '../impl/connect-ami.command'
import { IAwsOptions } from '../../dto/interface';
import { AggregateAmiModel } from '../../models/asterisk.model';
import { Utils } from '../../../utils';

@CommandHandler(AmiOriginateCommand)
export class OriginateCommandHandler implements ICommandHandler<AmiOriginateCommand> {
    private wss: WSS;
    public readonly debug = new Logger(OriginateCommandHandler.name);
    constructor(
        @Inject('aggregate') private rep: AggregateAmiModel,
        @Inject('AWS_OPTIONS') private options: IAwsOptions,
        private readonly publisher: EventPublisher,
        private readonly commandBus: CommandBus,

    ) { }
    async execute(command: AmiOriginateCommand) {
        try {
            const {
                amiClient,
                amiPassword
            } = this.options;
            this.debug.log(command, 'input:');
            await this.connect();
            const amiSaga = this.publisher.mergeObjectContext(this.rep);
            this.wss.on('open', () => {
                console.log('connected');
                this.wss.on('message', (message: string) => {
                    console.log('received:message: %s', message);
                    amiClient
                        .connect('ami-manager', amiPassword, { host: 'localhost', port: 5038 })
                        .then(() => {

                            amiClient
                                .on('connect', () => console.log('connect -- ami'))
                                .on('event', event => console.log(event))
                                .on('data', chunk => console.log(chunk))
                                .on('response', response => console.log("responce-ami:", response))
                                .on('disconnect', () => console.log('disconnect'))
                                .on('reconnection', () => console.log('reconnection'))
                                .on('internalError', error => console.log(error))
                                .action({
                                    Action: 'Ping'
                                });

                                if (Utils.IsJsonString(message)) {
                                    console.log('payload:original:', message);
            
                                    const { originatePayload } = JSON.parse(message);
                                    console.dir('payload:', originatePayload);
            
                                    console.log('payload:', JSON.stringify({ ...originatePayload, priority: 1 }));
            
                                    // client1.action({ ...originatePayload, priority: 1 }, (err, done) => {
                                    //     if (err) {
                                    //         console.error('actions:originate:', err)
                                    //         return;
                                    //     }
                                    // })
            
                                    amiSaga.commit();
                                }

                        }).catch(error => console.log("error:ami-client:", error));
                });
            });
        } catch (e) {
            this.debug.error('execute:e:', e.message);
        }
    }

    private async connect(): Promise<void> {
        const {
            wssUrl,
        } = this.options;
        this.wss = new WSS(wssUrl, 'ami-1.0', {
            headers: {
                "X-Amz-Security-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIsImRhdGEiOiJTZW1lbiIsImlhdCI6MTUxNjIzOTAyMiwiSUQiOiIyNjQ4ZjY3My03MDA4LTQyMWEtYTg5NC04NWJlYjVlYTg4MzMifQ.XE3fFttmpNUbenTcGl4bj66-PLRRlgS7OnNR46CRKmc",
            }
        });

        // return;
    }
}