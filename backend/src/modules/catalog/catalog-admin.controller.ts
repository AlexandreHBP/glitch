/**
 * Rotas administrativas do catálogo. Guard + @Roles('admin') aplicados na
 * classe inteira — nunca misturado com rotas públicas.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SetVariantStockDto } from './dto/set-variant-stock.dto';
import {
  ListAdminProductsUseCase,
  GetAdminProductByIdUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
  SetVariantStockUseCase,
} from './use-cases';

@ApiTags('Admin - Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
@ApiResponse({ status: 403, description: 'Usuário autenticado não é admin' })
@Controller('admin')
export class CatalogAdminController {
  constructor(
    private readonly listAdminProductsUseCase: ListAdminProductsUseCase,
    private readonly getAdminProductByIdUseCase: GetAdminProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly setVariantStockUseCase: SetVariantStockUseCase,
  ) {}

  @Get('products')
  @ApiOperation({ summary: 'Lista todos os produtos, inclusive inativos' })
  @ApiResponse({ status: 200, description: 'Lista paginada de produtos' })
  listProducts(@Query() query: ProductQueryDto) {
    return this.listAdminProductsUseCase.listAdminProducts(query);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Busca um produto por id, inclusive inativo' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAdminProductByIdUseCase.getAdminProductById(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Cria um produto com suas variações' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.createProduct(dto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Atualiza um produto e/ou suas variações' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.updateProductUseCase.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Remove (ou inativa, se já vendido) um produto' })
  @ApiResponse({ status: 200, description: 'Produto removido ou inativado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteProductUseCase.deleteProduct(id);
  }

  @Put('variants/:id/stock')
  @ApiOperation({ summary: 'Ajusta o estoque absoluto de uma variação' })
  @ApiResponse({ status: 200, description: 'Estoque ajustado com sucesso' })
  @ApiResponse({ status: 404, description: 'Variação não encontrada' })
  setVariantStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetVariantStockDto,
  ) {
    return this.setVariantStockUseCase.setVariantStock(
      id,
      dto.quantity,
      dto.reason,
    );
  }
}
