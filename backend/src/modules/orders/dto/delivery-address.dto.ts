import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeliveryAddressDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  @MaxLength(200)
  street: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @MaxLength(20)
  number: string;

  @ApiPropertyOptional({ example: 'Apto 45' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @MaxLength(2)
  state: string;

  @ApiProperty({ example: '01310-100' })
  @IsString()
  @MaxLength(12)
  zipCode: string;

  @ApiPropertyOptional({ example: 'Portão azul' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  referencePoint?: string;
}
