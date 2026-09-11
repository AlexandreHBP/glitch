/**
 * Variação vendável de um produto (tamanho + cor). É AQUI que o estoque
 * vive — nunca em Product (RN01). CHECK stock_quantity >= 0 é a última
 * linha de defesa contra venda de estoque negativo.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
  Index,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../common/transformers/column-numeric.transformer';
import { Product } from './product.entity';

@Entity('product_variants')
@Unique('uq_variant_product_size_color', ['productId', 'size', 'color'])
@Check('ck_variant_stock_non_negative', '"stock_quantity" >= 0')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  @Index('idx_product_variants_product_id')
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 60, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 20 })
  size: string;

  @Column({ type: 'varchar', length: 40 })
  color: string;

  /** Preço só desta variação; nulo = usa products.base_price */
  @Column({
    name: 'price_override',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  priceOverride: number | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
