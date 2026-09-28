/**
 * Rotas do cliente autenticado: criar pedido, ver meus pedidos e detalhe
 * do próprio pedido (com histórico de status).
 */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import {
  CreateOrderUseCase,
  ListMyOrdersUseCase,
  GetOrderUseCase,
} from './use-cases';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller()
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listMyOrdersUseCase: ListMyOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  @Post('orders')
  @ApiOperation({ summary: 'Cria um pedido (debita estoque, exige login)' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({
    status: 409,
    description: 'Um ou mais itens do pedido estão indisponíveis',
  })
  createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.createOrderUseCase.createOrder(user.userId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Lista os pedidos do cliente logado' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada dos próprios pedidos',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  listMyOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrderQueryDto,
  ) {
    return this.listMyOrdersUseCase.listMyOrders(user.userId, query);
  }

  @Get('orders/:id')
  @ApiOperation({
    summary: 'Detalhe do próprio pedido com histórico de status',
  })
  @ApiResponse({ status: 200, description: 'Detalhe do pedido' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado ou não pertence ao usuário logado',
  })
  getOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getOrderUseCase.getOrder(id, user.userId);
  }
}
