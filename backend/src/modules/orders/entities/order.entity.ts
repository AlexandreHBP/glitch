/**
 * Pedido, status, total e dados de entrega. `orderNumber` é o identificador
 * legível (GLT-2026-0001) que admin e cliente usam para conversar sobre o
 * pedido sem ler UUID. `total` é sempre recalculado do banco pelo
 * CreateOrderUseCase — nunca aceito vindo do cliente.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../common/transformers/column-numeric.transformer';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { DeliveryMethod } from '../enums/delivery-method.enum';
import { DeliveryAddress } from './delivery-address.interface';

@Entity('orders')
@Index('idx_orders_user_created', ['userId', 'createdAt'])
@Index('idx_orders_status', ['status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_number', type: 'varchar', length: 20, unique: true })
  orderNumber: string;

  @Column({
    type: 'varchar',
    length: 24,
    default: OrderStatus.AGUARDANDO_CONTATO,
  })
  status: OrderStatus;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  total: number;

  @Column({ name: 'delivery_method', type: 'varchar', length: 20 })
  deliveryMethod: DeliveryMethod;

  @Column({ name: 'delivery_address', type: 'jsonb', nullable: true })
  deliveryAddress: DeliveryAddress | null;

  @Column({
    name: 'customer_notes',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  customerNotes: string | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory: OrderStatusHistory[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
