/**
 * Rotas públicas do catálogo: listagem de produtos, detalhe por slug e
 * categorias. Nunca misturar com rotas /admin neste mesmo controller.
 */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ListPublicProductsUseCase,
  GetProductBySlugUseCase,
  ListCategoriesUseCase,
} from './use-cases';

@ApiTags('Catalog')
@Public()
@Controller()
export class CatalogController {
  constructor(
    private readonly listPublicProductsUseCase: ListPublicProductsUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
  ) {}

  @Get('products')
  @ApiOperation({ summary: 'Lista o catálogo público (paginado)' })
  listProducts(@Query() query: ProductQueryDto) {
    return this.listPublicProductsUseCase.listPublicProducts(query);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Detalhe do produto com variações e estoque' })
  getProduct(@Param('slug') slug: string) {
    return this.getProductBySlugUseCase.getProductBySlug(slug);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lista categorias ativas' })
  listCategories() {
    return this.listCategoriesUseCase.listCategories();
  }
}
