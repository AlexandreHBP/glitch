/**
 * CRUD administrativo da playlist. Guard + @Roles('admin') na classe
 * inteira.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateTrackDto, UpdateTrackDto } from './dto';
import {
  ListAdminTracksUseCase,
  CreateTrackUseCase,
  UpdateTrackUseCase,
  DeleteTrackUseCase,
} from './use-cases';

@ApiTags('Admin - Playlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/playlist')
export class PlaylistAdminController {
  constructor(
    private readonly listAdminTracksUseCase: ListAdminTracksUseCase,
    private readonly createTrackUseCase: CreateTrackUseCase,
    private readonly updateTrackUseCase: UpdateTrackUseCase,
    private readonly deleteTrackUseCase: DeleteTrackUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as faixas (ativas e inativas)' })
  listTracks() {
    return this.listAdminTracksUseCase.listAdminTracks();
  }

  @Post()
  @ApiOperation({ summary: 'Adiciona uma faixa à playlist' })
  createTrack(@Body() dto: CreateTrackDto) {
    return this.createTrackUseCase.createTrack(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma faixa' })
  updateTrack(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrackDto,
  ) {
    return this.updateTrackUseCase.updateTrack(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma faixa da playlist' })
  deleteTrack(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteTrackUseCase.deleteTrack(id);
  }
}
