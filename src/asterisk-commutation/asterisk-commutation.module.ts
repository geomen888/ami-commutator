import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

import { AggregateAmiModel } from './models/asterisk.model';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events/handlers';
import { AmiSagas } from './sagas/ami.saga';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (opt: ConfigService) => ({
        secret: opt.get<string>('jwtSecret'),
        signOptions: { expiresIn: '31d' },
      }),
      inject: [ConfigService],
    })
  ],
  providers: [
    {
      provide: 'AWS_OPTIONS',
      useFactory: (opt: ConfigService) => {

        return {
          wssUrl: opt.get<string>('awsWssUrl'),
          amiPort: opt.get<number>('amiPort'),
          amiHostIp: opt.get<string>('amiHostIp'),
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
  ]
})
export class AsteriskCommutationModule { }
