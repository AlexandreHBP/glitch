/**
 * Detalhe do produto por slug, com variações e estoque disponível
 * (RF01). Produtos inativos não aparecem para o público.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { GetProductBySlug } from './interfaces';

@Injectable()
export class GetProductBySlugUseCase implements GetProductBySlug {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug, active: true },
      relations: ['variants', 'images', 'category'],
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }
}
