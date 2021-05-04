import { Expose, plainToClass, Transform, Type } from 'class-transformer';
import { OrderType } from '../../common/enum/order-type';

import {
    IsNumber,
    IsEnum,
    IsArray,
    IsBoolean,
    IsString,
    MinLength,
    IsOptional,
} from 'class-validator';

export class OrderDto {
    @Expose({groups: ['res']})
    @IsString()
    id: string;

    @IsEnum({ entity: OrderType })
    status: OrderType;

    @Expose({groups: ['res']})
    @IsString()
    driverPhone: string;

    @Expose({groups: ['res']})
    @IsString()
    clientPhone: string;

    @Expose({groups: ['res']})
    @IsOptional()
    approved: boolean;
}
