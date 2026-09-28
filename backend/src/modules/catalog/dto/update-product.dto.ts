import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';
import { CreateVariantDto } from './create-variant.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['variants', 'model3dUrl'] as const),
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

  // Redeclarado (em vez de herdado de CreateProductDto) para aceitar
  // explicitamente `null`: é assim que o painel remove um modelo 3D já
  // vinculado. @IsOptional() do class-validator já ignora as demais
  // validações quando o valor é null ou undefined.
  @ApiPropertyOptional({
    description:
      'URL do modelo 3D (.glb) já hospedado via POST /admin/uploads/model3d. Envie null para remover.',
    example: '/uploads/models3d/1f2e3d4c.glb',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  model3dUrl?: string | null;
}
