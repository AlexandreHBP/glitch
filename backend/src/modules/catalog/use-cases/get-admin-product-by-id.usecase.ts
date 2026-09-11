/**
 * Detalhe do produto por id para o painel admin (inclusive inativos).
 * Existe para o formulário de edição buscar o produto diretamente por
 * URL/refresh, sem depender de um fallback que lista até 100 produtos e
 * filtra no cliente (quebra silenciosamente acima desse limite/página).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { GetAdminProductById } from './interfaces';

@Injectable()
export class GetAdminProductByIdUseCase implements GetAdminProductById {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getAdminProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants', 'images', 'category'],
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }
}
