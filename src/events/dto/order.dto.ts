import { Expose, plainToClass, Transform, Type } from 'class-transformer';
import { OrderStatusType } from '../../common/enum/order-status-type';

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

    @IsEnum({ entity: OrderStatusType })
    status: OrderStatusType;

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
