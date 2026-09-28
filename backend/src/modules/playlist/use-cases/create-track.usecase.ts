import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaylistTrack } from '../entities/playlist-track.entity';
import { CreateTrackDto } from '../dto/create-track.dto';
import { CreateTrack } from './interfaces';

@Injectable()
export class CreateTrackUseCase implements CreateTrack {
  constructor(
    @InjectRepository(PlaylistTrack)
    private readonly trackRepository: Repository<PlaylistTrack>,
  ) {}

  async createTrack(dto: CreateTrackDto): Promise<PlaylistTrack> {
    const track = this.trackRepository.create({
      title: dto.title,
      artist: dto.artist ?? null,
      url: dto.url,
      position: dto.position ?? 0,
      active: dto.active ?? true,
    });
    return this.trackRepository.save(track);
  }
}
