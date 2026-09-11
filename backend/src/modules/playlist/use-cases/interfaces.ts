import { PlaylistTrack } from '../entities/playlist-track.entity';
import { CreateTrackDto } from '../dto/create-track.dto';
import { UpdateTrackDto } from '../dto/update-track.dto';

export interface ListPublicTracks {
  listPublicTracks(): Promise<PlaylistTrack[]>;
}

export interface ListAdminTracks {
  listAdminTracks(): Promise<PlaylistTrack[]>;
}

export interface CreateTrack {
  createTrack(dto: CreateTrackDto): Promise<PlaylistTrack>;
}

export interface UpdateTrack {
  updateTrack(id: string, dto: UpdateTrackDto): Promise<PlaylistTrack>;
}

export interface DeleteTrack {
  deleteTrack(id: string): Promise<void>;
}
