import { callbackify } from 'util';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { bindNodeCallback, Observable, of, from } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import * as WSS from 'ws';

import { IJwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { catchError, flatMap, map, concatMap } from 'rxjs/operators';
import { UpdateOrderDto } from '../../events/dto/update-order.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtWsGuard implements CanActivate {
  constructor(
    protected readonly authService: AuthService,
    protected readonly jwtService: JwtService
  ) {
  }
// .verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T
  canActivate(
    context: ExecutionContext,
  ): Observable<boolean> {
    const data = context.switchToWs().getData();
    console.log('client:args::', data);
    const authHeader = data.headers.authorization;
    const authToken = authHeader.split(' ')[1];
    // const data = context.switchToWs().getClient<any>();
    // const client = context.switchToWs();
    // const token = (context as any).args[0] //.handshake.headers.authorization.split(' ')[1]
  
    //  const authHeader = context.getArgByIndex(1)?.headers?.authorization || '';
    if (!authHeader) {
      throw new UnauthorizedException('token missing');
    }
    // console.log('client:args::', client1);
   //  console.log('client:token::', client.getClient());
    // const authHeader = data.headers.authorization;
    // const authToken = authHeader.substring(7, authHeader.length);
    const verify: (...args: any[]) => Observable<IJwtPayload> = bindNodeCallback(callbackify(this.jwtService.verifyAsync).bind(this.jwtService)) as any;

    return verify(authToken)
      .pipe(
        flatMap(jwtPayload => this.authService.validateOrder(jwtPayload)),
        catchError(e => {
          console.error('verify::', e);
          return of(null);
        }),
        map((order: UpdateOrderDto | null) => {
          delete context.switchToWs().getData().headers;
          context.switchToWs().getData().order = order;
          const isVerified = Boolean(order);

          if (!isVerified) {
            throw new UnauthorizedException();
          }

          return isVerified;
        }),
      );
  }
}