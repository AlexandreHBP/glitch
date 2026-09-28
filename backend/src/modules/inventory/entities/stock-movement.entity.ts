/**
 * Auditoria de toda entrada/saída de estoque. Gravado sempre pelo
 * InventoryService (debit/restore/adjust), nunca diretamente por outro
 * módulo alterando `stock_quantity` sem deixar rastro.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { StockMovementType } from '../enums/stock-movement-type.enum';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_variant_id', type: 'uuid' })
  @Index('idx_stock_movements_variant')
  productVariantId: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ type: 'varchar', length: 20 })
  type: StockMovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
