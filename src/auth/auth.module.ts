import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';


import { PassportModule } from '@nestjs/passport';
// import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtWsGuard } from './guards/ws-common.guard'; 
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (opt: ConfigService) => ({
        secret: opt.get<string>('jwtSecret'),
        signOptions: { expiresIn: '31d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'JWT_OPTIONS',
      useFactory: (opt: ConfigService) => {

        return {
          jwtSecret: opt.get<string>('jwtSecret'),
        };
      },
      inject: [ConfigService]
    },
    AuthService,
    LocalStrategy,
    JwtWsGuard,
    JwtStrategy,
  ],
  exports: [AuthService, JwtWsGuard],
})
export class AuthModule {}
