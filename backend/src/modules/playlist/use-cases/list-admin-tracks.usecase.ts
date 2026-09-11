import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaylistTrack } from '../entities/playlist-track.entity';
import { ListAdminTracks } from './interfaces';

@Injectable()
export class ListAdminTracksUseCase implements ListAdminTracks {
  constructor(
    @InjectRepository(PlaylistTrack)
    private readonly trackRepository: Repository<PlaylistTrack>,
  ) {}

  async listAdminTracks(): Promise<PlaylistTrack[]> {
    return this.trackRepository.find({ order: { position: 'ASC' } });
  }
}
