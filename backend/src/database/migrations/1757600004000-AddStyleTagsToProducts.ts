/**
 * Adiciona style_tags (TEXT[]) a products: atributos de estilo do mockup
 * (fluido de gênero, unissex, corte adaptável, todos os corpos,
 * lançamento) usados pelo filtro real da coleção no site. Vocabulário
 * controlado em código (ver ProductStyleTag), não em CHECK constraint, pra
 * não exigir migration toda vez que a lista mudar.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStyleTagsToProducts1757600004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN style_tags TEXT[] NOT NULL DEFAULT '{}';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN style_tags;
    `);
  }
}
