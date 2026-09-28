/**
 * Faixa do player de música ambiente, definida pelo administrador (RF10).
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('playlist_tracks')
export class PlaylistTrack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  artist: string | null;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
