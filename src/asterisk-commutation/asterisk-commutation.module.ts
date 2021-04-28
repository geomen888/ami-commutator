import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AsteriskCommutationService } from './asterisk-commutation.service';
import { AsteriskCommutationGateway } from './asterisk-commutation.gateway';

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
        };
      }, 
      inject: [ConfigService]
  },
    AsteriskCommutationGateway,
    AsteriskCommutationService
  ]
})
export class AsteriskCommutationModule {}
