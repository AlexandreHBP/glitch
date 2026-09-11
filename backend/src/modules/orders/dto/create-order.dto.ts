import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
import { DeliveryAddressDto } from './delivery-address.dto';
import { DeliveryMethod } from '../enums/delivery-method.enum';

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'O pedido precisa ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ enum: DeliveryMethod })
  @IsEnum(DeliveryMethod, { message: 'Forma de entrega inválida' })
  deliveryMethod: DeliveryMethod;

  @ApiPropertyOptional({ type: DeliveryAddressDto })
  @ValidateIf(
    (o: CreateOrderDto) => o.deliveryMethod === DeliveryMethod.SHIPPING,
  )
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress?: DeliveryAddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerNotes?: string;
}
