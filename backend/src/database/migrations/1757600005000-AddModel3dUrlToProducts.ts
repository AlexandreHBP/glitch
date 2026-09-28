/**
 * Adiciona model_3d_url (nullable) a products: caminho do modelo 3D
 * giratório (.glb) do produto, enviado via POST /admin/uploads/model3d e
 * servido como os demais uploads (fora do prefixo /api). Nulo = produto
 * sem modelo 3D, cai de volta para a galeria de fotos no site.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModel3dUrlToProducts1757600005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN model_3d_url VARCHAR(255) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN model_3d_url;
    `);
  }
}
