/**
 * Fase 1 — Catálogo + painel de produtos: users, categories, products,
 * product_variants, product_images. Índices: products(slug),
 * products(active, category_id), product_variants(product_id).
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalogTables1757600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'customer',
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(120) NOT NULL UNIQUE,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(220) NOT NULL UNIQUE,
        description TEXT,
        base_price NUMERIC(10,2) NOT NULL,
        category_id UUID,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_products_category
          FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_products_slug ON products(slug);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_products_active_category ON products(active, category_id);`,
    );

    await queryRunner.query(`
      CREATE TABLE product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL,
        sku VARCHAR(60) NOT NULL UNIQUE,
        size VARCHAR(20) NOT NULL,
        color VARCHAR(40) NOT NULL,
        price_override NUMERIC(10,2),
        stock_quantity INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_product_variants_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT uq_variant_product_size_color UNIQUE (product_id, size, color),
        CONSTRAINT ck_variant_stock_non_negative CHECK (stock_quantity >= 0)
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);`,
    );

    await queryRunner.query(`
      CREATE TABLE product_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL,
        url VARCHAR(500) NOT NULL,
        is_cover BOOLEAN NOT NULL DEFAULT false,
        position INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_product_images_product
          FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_product_images_product_id ON product_images(product_id);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_images;`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_variants;`);
    await queryRunner.query(`DROP TABLE IF EXISTS products;`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
