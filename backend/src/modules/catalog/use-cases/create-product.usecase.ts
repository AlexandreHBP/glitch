/**
 * Cria um produto com suas variações iniciais, em uma única transação.
 * Slug gerado do nome (com sufixo se colidir); SKU gerado se omitido.
 */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductImage } from '../entities/product-image.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { ProductImageDto } from '../dto/product-image.dto';
import { slugify } from '../../../common/utils/slugify';
import { generateSku } from '../../../common/utils/generate-sku';
import { CreateProduct } from './interfaces';

@Injectable()
export class CreateProductUseCase implements CreateProduct {
  constructor(private readonly dataSource: DataSource) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    return this.dataSource.transaction(async (manager) => {
      const slug = await this.generateUniqueSlug(dto.name);

      const product = manager.create(Product, {
        name: dto.name,
        description: dto.description ?? null,
        basePrice: dto.basePrice,
        categoryId: dto.categoryId ?? null,
        active: dto.active ?? true,
        styleTags: dto.styleTags ?? [],
        model3dUrl: dto.model3dUrl ?? null,
        slug,
      });
      await manager.save(Product, product);

      const variants = dto.variants.map((variantDto: CreateVariantDto) =>
        manager.create(ProductVariant, {
          productId: product.id,
          sku:
            variantDto.sku ??
            generateSku(slug, variantDto.size, variantDto.color),
          size: variantDto.size,
          color: variantDto.color,
          priceOverride: variantDto.priceOverride ?? null,
          stockQuantity: variantDto.stockQuantity,
          active: variantDto.active ?? true,
        }),
      );
      await manager.save(ProductVariant, variants);

      const images = (dto.images ?? []).map(
        (imageDto: ProductImageDto, index) =>
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

      product.variants = variants;
      product.images = images;
      return product;
    });
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    let candidate = base;
    let suffix = 1;

    while (
      await this.dataSource
        .getRepository(Product)
        .exists({ where: { slug: candidate } })
    ) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    return candidate;
  }
}
