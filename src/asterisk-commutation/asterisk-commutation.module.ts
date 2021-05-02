import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import Ami from 'asterisk-ami-client';

import { AsteriskCommutationService } from './asterisk-commutation.service';
import { AsteriskCommutationGateway } from './asterisk-commutation.gateway';
import { AggregateAmiModel } from './models/asterisk.model';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events/handlers';
import { AmiSagas } from './sagas/ami.saga';


@Module({
  imports: [
    ConfigModule,
    CqrsModule,
  ],
  providers: [
    {
      provide: 'AWS_OPTIONS',
      useFactory: (opt: ConfigService) => {

        return {
          wssUrl: opt.get<string>('awsWssUrl'),
          amiClient: new Ami(),
          amiPassword: opt.get<string>('amiPassword'),
        };
      },
      inject: [ConfigService]
    },
    {
      provide: 'aggregate',
      useClass: AggregateAmiModel,
      inject: []
    },
    ...CommandHandlers,
    ...EventHandlers,
    AmiSagas,
    AsteriskCommutationGateway,
    AsteriskCommutationService
  ]
})
export class AsteriskCommutationModule { }