/**
 * Gera um order_number legível e único (GLT-2026-0001), usado pelo admin
 * e pelo cliente para conversar sobre o pedido sem ler UUID.
 *
 * O ano usado no prefixo é sempre calculado em UTC (nunca `new Date()`,
 * que depende do fuso horário local do processo Node) — consistente com
 * `created_at` (timestamptz) e com o restante do sistema.
 *
 * A sequência vem de um `UPDATE ... RETURNING` atômico em
 * `order_number_sequences` (uma linha por ano), dentro da MESMA transação
 * que cria o pedido. Isso evita a condição de corrida do antigo
 * `COUNT(*) + 1`: sob concorrência, duas transações que fariam o mesmo
 * COUNT sem lock podiam gerar o mesmo número e colidir na constraint
 * UNIQUE de `orders.order_number`, derrubando uma delas com erro 500 cru.
 * Com o contador dedicado, a segunda transação concorrente bloqueia na
 * mesma linha até a primeira commitar, garantindo números sequenciais
 * sem colisão — mesmo princípio do lock pessimista já usado nas variações.
 */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { EntityManager } from 'typeorm';

dayjs.extend(utc);

export async function generateOrderNumber(
  manager: EntityManager,
): Promise<string> {
  const year = dayjs.utc().year();
  const prefix = `GLT-${year}-`;

  const rows: Array<{ last_number: number }> = await manager.query(
    `
      INSERT INTO order_number_sequences (year, last_number)
      VALUES ($1, 1)
      ON CONFLICT (year)
      DO UPDATE SET last_number = order_number_sequences.last_number + 1
      RETURNING last_number;
    `,
    [year],
  );

  const sequence = String(rows[0].last_number).padStart(4, '0');
  return `${prefix}${sequence}`;
}
