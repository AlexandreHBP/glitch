/**
 * Lista o catálogo público, paginado, com filtro por categoria e busca por
 * nome. Nunca carrega todos os produtos de uma vez (ver notas de
 * performance da arquitetura).
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { ListPublicProducts } from './interfaces';

@Injectable()
export class ListPublicProductsUseCase implements ListPublicProducts {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async listPublicProducts(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.active = true');

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.search) {
      qb.andWhere('product.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }
}
