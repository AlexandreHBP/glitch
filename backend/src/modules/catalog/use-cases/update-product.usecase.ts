/**
 * Atualiza dados do produto e, opcionalmente, faz upsert das variações
 * enviadas (por tamanho/cor). Variações nunca são apagadas aqui — apenas
 * criadas ou atualizadas — para não violar o histórico de vendas
 * (order_items -> product_variants é RESTRICT).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductImage } from '../entities/product-image.entity';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductImageDto } from '../dto/product-image.dto';
import { generateSku } from '../../../common/utils/generate-sku';
import { UpdateProduct } from './interfaces';

@Injectable()
export class UpdateProductUseCase implements UpdateProduct {
  constructor(private readonly dataSource: DataSource) {}

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id },
        relations: ['variants'],
      });
      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      if (dto.name !== undefined) {
        product.name = dto.name;
      }
      if (dto.description !== undefined) {
        product.description = dto.description;
      }
      if (dto.basePrice !== undefined) {
        product.basePrice = dto.basePrice;
      }
      if (dto.categoryId !== undefined) {
        product.categoryId = dto.categoryId;
      }
      if (dto.active !== undefined) {
        product.active = dto.active;
      }
      await manager.save(Product, product);

      if (dto.variants) {
        for (const variantDto of dto.variants) {
          const existing = product.variants.find(
            (v) => v.size === variantDto.size && v.color === variantDto.color,
          );

          if (existing) {
            existing.priceOverride =
              variantDto.priceOverride ?? existing.priceOverride;
            existing.stockQuantity = variantDto.stockQuantity;
            existing.active = variantDto.active ?? existing.active;
            await manager.save(ProductVariant, existing);
          } else {
            const newVariant = manager.create(ProductVariant, {
              productId: product.id,
              sku:
                variantDto.sku ??
                generateSku(product.slug, variantDto.size, variantDto.color),
              size: variantDto.size,
              color: variantDto.color,
              priceOverride: variantDto.priceOverride ?? null,
              stockQuantity: variantDto.stockQuantity,
              active: variantDto.active ?? true,
            });
            await manager.save(ProductVariant, newVariant);
          }
        }
      }

      // Fotos não têm histórico de vendas amarrado (diferente de
      // variações), então a estratégia é "substituir tudo": se `images`
      // veio no payload, o conjunto enviado passa a ser a verdade —
      // apaga o que existia e grava de novo. Se `images` não veio, as
      // fotos atuais são preservadas (undefined != [] aqui importa).
      if (dto.images !== undefined) {
        await manager.delete(ProductImage, { productId: product.id });
        const images = dto.images.map((imageDto: ProductImageDto, index) =>
          manager.create(ProductImage, {
            productId: product.id,
            url: imageDto.url,
            isCover: imageDto.isCover ?? index === 0,
            position: imageDto.position ?? index,
          }),
        );
        if (images.length > 0) {
          await manager.save(ProductImage, images);
        }
      }

      const refreshed = await manager.findOne(Product, {
        where: { id },
        relations: ['variants', 'images', 'category'],
      });
      if (!refreshed) {
        throw new NotFoundException('Produto não encontrado');
      }
      return refreshed;
    });
  }
}
