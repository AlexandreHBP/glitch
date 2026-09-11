/**
 * ATENÇÃO: nunca adicionar campo de preço aqui. O preço e o total do
 * pedido são sempre lidos do banco dentro do CreateOrderUseCase — aceitar
 * preço vindo do cliente é como aceitar que ele diga quanto vai pagar.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsUUID()
  productVariantId: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}
