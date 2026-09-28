import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaylistTrack } from '../entities/playlist-track.entity';
import { UpdateTrackDto } from '../dto/update-track.dto';
import { UpdateTrack } from './interfaces';

@Injectable()
export class UpdateTrackUseCase implements UpdateTrack {
  constructor(
    @InjectRepository(PlaylistTrack)
    private readonly trackRepository: Repository<PlaylistTrack>,
  ) {}

  async updateTrack(id: string, dto: UpdateTrackDto): Promise<PlaylistTrack> {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) {
      throw new NotFoundException('Faixa não encontrada');
    }

    Object.assign(track, dto);
    return this.trackRepository.save(track);
  }
}
