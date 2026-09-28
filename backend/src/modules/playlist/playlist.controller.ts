/**
 * Rota pública da playlist: faixas ativas, ordenadas por posição.
 */
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ListPublicTracksUseCase } from './use-cases';

@ApiTags('Playlist')
@Public()
@Controller('playlist')
export class PlaylistController {
  constructor(
    private readonly listPublicTracksUseCase: ListPublicTracksUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista as faixas ativas da playlist' })
  listTracks() {
    return this.listPublicTracksUseCase.listPublicTracks();
  }
}
