/**
 * Fase 2/3 — orders, order_items, stock_movements, order_status_history.
 * FK order_items -> product_variants é RESTRICT (não pode apagar histórico
 * de vendas apagando o produto). Índices: orders(user_id, created_at),
 * orders(status).
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTables1757600001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        order_number VARCHAR(20) NOT NULL UNIQUE,
        status VARCHAR(24) NOT NULL DEFAULT 'AGUARDANDO_CONTATO',
        total NUMERIC(10,2) NOT NULL,
        delivery_method VARCHAR(20) NOT NULL,
        delivery_address JSONB,
        customer_notes VARCHAR(500),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_orders_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_orders_status ON orders(status);`,
    );

    await queryRunner.query(`
      CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        product_variant_id UUID NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        variant_label VARCHAR(100) NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_order_items_order
          FOREIGN KEY (order_id) REFERENCES orders(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_order_items_variant
          FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_order_items_order_id ON order_items(order_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_order_items_variant_id ON order_items(product_variant_id);`,
    );

    await queryRunner.query(`
      CREATE TABLE stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_variant_id UUID NOT NULL,
        order_id UUID,
        type VARCHAR(20) NOT NULL,
        quantity INT NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_stock_movements_variant
          FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_stock_movements_order
          FOREIGN KEY (order_id) REFERENCES orders(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_stock_movements_variant ON stock_movements(product_variant_id);`,
    );

    await queryRunner.query(`
      CREATE TABLE order_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        status VARCHAR(24) NOT NULL,
        note VARCHAR(500),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_order_status_history_order
          FOREIGN KEY (order_id) REFERENCES orders(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS order_status_history;`);
    await queryRunner.query(`DROP TABLE IF EXISTS stock_movements;`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items;`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders;`);
  }
}
