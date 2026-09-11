/**
 * Lista faixas ativas da playlist, ordenadas por posição (RF10).
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaylistTrack } from '../entities/playlist-track.entity';
import { ListPublicTracks } from './interfaces';

@Injectable()
export class ListPublicTracksUseCase implements ListPublicTracks {
  constructor(
    @InjectRepository(PlaylistTrack)
    private readonly trackRepository: Repository<PlaylistTrack>,
  ) {}

  async listPublicTracks(): Promise<PlaylistTrack[]> {
    return this.trackRepository.find({
      where: { active: true },
      order: { position: 'ASC' },
    });
  }
}
