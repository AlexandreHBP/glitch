import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistTrack } from './entities/playlist-track.entity';
import { PlaylistController } from './playlist.controller';
import { PlaylistAdminController } from './playlist-admin.controller';
import {
  ListPublicTracksUseCase,
  ListAdminTracksUseCase,
  CreateTrackUseCase,
  UpdateTrackUseCase,
  DeleteTrackUseCase,
} from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([PlaylistTrack])],
  controllers: [PlaylistController, PlaylistAdminController],
  providers: [
    ListPublicTracksUseCase,
    ListAdminTracksUseCase,
    CreateTrackUseCase,
    UpdateTrackUseCase,
    DeleteTrackUseCase,
  ],
})
export class PlaylistModule {}
