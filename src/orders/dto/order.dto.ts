import {
    IsNotEmpty,
    IsMongoId,
    IsArray,
    ValidateNested,
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderItemStatus } from '../schemas/order.schema';

class ItemModifierDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    option!: string;

    @IsNumber()
    @Min(0)
    price!: number;
}

export class OrderItemDto {
    @IsMongoId()
    menuItemId!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsNumber()
    @Min(1)
    quantity!: number;

    @IsNumber()
    @Min(0)
    unitPrice!: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemModifierDto)
    @IsOptional()
    modifiers?: ItemModifierDto[];

    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateOrderDto {
    @IsMongoId()
    tableId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];
}

export class UpdateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];
}

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status!: OrderStatus;
}

export class UpdateOrderItemStatusDto {
    @IsMongoId()
    itemId!: string;

    @IsEnum(OrderItemStatus)
    status!: OrderItemStatus;
}

export class AddOrderItemsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];
}
