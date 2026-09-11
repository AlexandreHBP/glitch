import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min, MaxLength } from 'class-validator';

export class SetVariantStockDto {
  @ApiProperty({
    example: 25,
    description: 'Nova quantidade absoluta em estoque',
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 'Contagem manual de inventário' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}
