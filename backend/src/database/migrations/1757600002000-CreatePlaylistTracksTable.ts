/**
 * Fase 4 — playlist_tracks: faixas do player de música ambiente (RF10).
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlaylistTracksTable1757600002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE playlist_tracks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(150) NOT NULL,
        artist VARCHAR(150),
        url VARCHAR(500) NOT NULL,
        position INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_playlist_tracks_active_position ON playlist_tracks(active, position);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS playlist_tracks;`);
  }
}
