/**
 * Vínculo de uma foto (já hospedada via POST /admin/uploads/image) a um
 * produto. Enviado dentro de CreateProductDto/UpdateProductDto — o
 * use-case persiste em ProductImage.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class ProductImageDto {
  @ApiProperty({
    example: '/uploads/images/9c1e2f-....webp',
    description: 'URL retornada por POST /admin/uploads/image',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCover?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
