import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaylistTrack } from '../entities/playlist-track.entity';
import { DeleteTrack } from './interfaces';

@Injectable()
export class DeleteTrackUseCase implements DeleteTrack {
  constructor(
    @InjectRepository(PlaylistTrack)
    private readonly trackRepository: Repository<PlaylistTrack>,
  ) {}

  async deleteTrack(id: string): Promise<void> {
    const result = await this.trackRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Faixa não encontrada');
    }
  }
}
