import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({ example: 'Noite Sem Luz' })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'Banda Glitch' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  artist?: string;

  @ApiProperty({ description: 'URL do arquivo de áudio (gerada pelo upload)' })
  @IsString()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
