import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateVariantDto } from './create-variant.dto';
import { ProductImageDto } from './product-image.dto';
import { ProductStyleTag } from '../enums/product-style-tag.enum';

export class CreateProductDto {
  @ApiProperty({ example: 'Camiseta Glitch Oversized' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 89.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ description: 'ID da categoria' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description:
      'Atributos de estilo (mockup): fluido de gênero, unissex, corte adaptável, todos os corpos, lançamento',
    enum: ProductStyleTag,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ProductStyleTag, { each: true })
  styleTags?: ProductStyleTag[];

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Cadastre ao menos uma variação (tamanho/cor)' })
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];

  @ApiPropertyOptional({
    type: [ProductImageDto],
    description:
      'Fotos já hospedadas (via POST /admin/uploads/image) a vincular ao produto',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}
