/**
 * Query params padrão de paginação, reutilizada em toda listagem da API
 * (catálogo, produtos admin, pedidos). Nunca carregar N itens de uma vez
 * (ver "Performance" nas notas de arquitetura).
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Busca por texto' })
  @IsOptional()
  @IsString()
  search?: string;
}
