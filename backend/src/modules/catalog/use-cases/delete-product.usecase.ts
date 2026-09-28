/**
 * Remove um produto. Se já teve pedidos (existe order_item apontando para
 * alguma de suas variações), apenas inativa — nunca apaga histórico de
 * vendas. Se nunca foi vendido, apaga de verdade.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { DeleteProduct } from './interfaces';

@Injectable()
export class DeleteProductUseCase implements DeleteProduct {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async deleteProduct(id: string): Promise<{ hardDeleted: boolean }> {
    const product = await this.dataSource
      .getRepository(Product)
      .findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const hasOrderHistory = await this.hasBeenSold(id);

    if (hasOrderHistory) {
      product.active = false;
      await this.dataSource.getRepository(Product).save(product);
      return { hardDeleted: false };
    }

    await this.dataSource.getRepository(Product).remove(product);
    return { hardDeleted: true };
  }

  private async hasBeenSold(productId: string): Promise<boolean> {
    const result: Array<{ count: string }> = await this.dataSource.query(
      `SELECT COUNT(*)::int as count
       FROM order_items oi
       JOIN product_variants pv ON pv.id = oi.product_variant_id
       WHERE pv.product_id = $1`,
      [productId],
    );
    return Number(result[0]?.count ?? 0) > 0;
  }
}
