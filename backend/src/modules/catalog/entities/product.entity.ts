/**
 * Produto "pai": nome, descrição, preço base, ativo. O estoque NUNCA mora
 * aqui — vive em ProductVariant (RN01). Se products ganhar uma coluna de
 * estoque, os dois números vão divergir.
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
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { ProductStyleTag } from '../enums/product-style-tag.enum';

@Entity('products')
@Index('idx_products_active_category', ['active', 'categoryId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Index('idx_products_slug')
  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'base_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  basePrice: number;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Atributos de estilo do mockup (fluido de gênero, unissex, corte
  // adaptável, todos os corpos, lançamento) usados pelas pílulas de filtro
  // da home. Array vazio = produto sem nenhuma tag de estilo marcada.
  @Column({ name: 'style_tags', type: 'text', array: true, default: '{}' })
  styleTags: ProductStyleTag[];

  // Modelo 3D giratório do produto (.glb), enviado via
  // POST /admin/uploads/model3d. Nulo = site mostra só as fotos.
  @Column({
    name: 'model_3d_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  model3dUrl: string | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
