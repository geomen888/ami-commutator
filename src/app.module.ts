import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';

import configuration from './config/configuration';
import { EventsModule } from './events/events.module';
import { AsteriskCommutationModule } from './asterisk-commutation/asterisk-commutation.module';

@Module({
  imports: [
   AsteriskCommutationModule,
   ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('redis'),         // or use async method
      inject: [ConfigService]
  }),
    EventsModule,
  ],
})
export class AppModule {}
