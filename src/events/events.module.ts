import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigService, ConfigModule } from '@nestjs/config';

import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
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
  providers: [EventsGateway],
})
export class EventsModule {}
