import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateVariantDto {
  @ApiPropertyOptional({ description: 'Gerado automaticamente se omitido' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  sku?: string;

  @ApiProperty({ example: 'P' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  size: string;

  @ApiProperty({ example: 'Preto' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  color: string;

  @ApiPropertyOptional({
    description: 'Preço específico desta variação; se omitido usa o preço base',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceOverride?: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
