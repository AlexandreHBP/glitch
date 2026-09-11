import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';
import { CreateVariantDto } from './create-variant.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['variants'] as const),
) {
  @ApiPropertyOptional({
    type: [CreateVariantDto],
    description:
      'Se enviado, substitui as variações existentes que não têm pedidos',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
