/**
 * Lista o catálogo público, paginado, com filtro por categoria e busca por
 * nome. Nunca carrega todos os produtos de uma vez (ver notas de
 * performance da arquitetura).
 *
 * `variants` é buscado numa segunda query, por productId (In), em vez de
 * um leftJoinAndSelect na query paginada principal: um join de
 * one-to-many junto com skip/take faria o LIMIT/OFFSET do SQL cortar no
 * meio das linhas de uma junção produto×variação, corrompendo a
 * paginação. Só os campos necessários para as tags de tamanho no card do
 * catálogo (RF01) são carregados; o estoque por variação completo
 * continua exclusivo da página de detalhe (GetProductBySlugUseCase).
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { ListPublicProducts } from './interfaces';

@Injectable()
export class ListPublicProductsUseCase implements ListPublicProducts {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
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

    if (data.length > 0) {
      const variants = await this.variantRepository.find({
        where: {
          productId: In(data.map((product) => product.id)),
          active: true,
        },
      });
      const variantsByProduct = new Map<string, ProductVariant[]>();
      for (const variant of variants) {
        const bucket = variantsByProduct.get(variant.productId) ?? [];
        bucket.push(variant);
        variantsByProduct.set(variant.productId, bucket);
      }
      for (const product of data) {
        product.variants = variantsByProduct.get(product.id) ?? [];
      }
    }

    return new PaginatedResponseDto(data, total, page, limit);
  }
}
