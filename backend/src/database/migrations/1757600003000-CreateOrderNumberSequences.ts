/**
 * Contador dedicado (uma linha por ano) para gerar `order_number` de forma
 * atômica. Substitui o antigo `COUNT(*) + 1` sem lock, que sob concorrência
 * real (dois checkouts no mesmo instante) podia gerar o MESMO número para
 * duas transações e derrubar uma delas com violação da constraint UNIQUE
 * de `orders.order_number` (erro 500 cru).
 *
 * `UPDATE ... RETURNING` numa única linha é atômico no Postgres: a segunda
 * transação concorrente bloqueia na mesma linha até a primeira commitar,
 * garantindo sequência sem colisão — mesmo princípio do lock pessimista já
 * usado em `product_variants` na criação do pedido.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderNumberSequences1757600003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE order_number_sequences (
        year INT PRIMARY KEY,
        last_number INT NOT NULL DEFAULT 0
      );
    `);

    // Backfill a partir de pedidos que já existirem nesta tabela (gerados
    // pelo antigo COUNT(*) sem lock) — sem isso, o contador nasceria do
    // zero e o primeiro pedido novo colidiria com GLT-<ano>-0001 já
    // existente, violando a constraint UNIQUE de order_number.
    await queryRunner.query(`
      INSERT INTO order_number_sequences (year, last_number)
      SELECT
        split_part(order_number, '-', 2)::int AS year,
        MAX(split_part(order_number, '-', 3)::int) AS last_number
      FROM orders
      WHERE order_number LIKE 'GLT-%'
      GROUP BY split_part(order_number, '-', 2)::int
      ON CONFLICT (year) DO UPDATE
        SET last_number = GREATEST(order_number_sequences.last_number, EXCLUDED.last_number);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS order_number_sequences;`);
  }
}
