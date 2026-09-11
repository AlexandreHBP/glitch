/**
 * Rotas administrativas de pedidos. Guard + @Roles('admin') na classe
 * inteira — nunca misturado com rotas do cliente.
 */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  ListAllOrdersUseCase,
  GetOrderAdminUseCase,
  ChangeOrderStatusUseCase,
} from './use-cases';

@ApiTags('Admin - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
@ApiResponse({ status: 403, description: 'Usuário autenticado não é admin' })
@Controller('admin/orders')
export class OrdersAdminController {
  constructor(
    private readonly listAllOrdersUseCase: ListAllOrdersUseCase,
    private readonly getOrderAdminUseCase: GetOrderAdminUseCase,
    private readonly changeOrderStatusUseCase: ChangeOrderStatusUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos (filtro por status)' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de todos os pedidos',
  })
  listAllOrders(@Query() query: OrderQueryDto) {
    return this.listAllOrdersUseCase.listAllOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um pedido' })
  @ApiResponse({ status: 200, description: 'Detalhe do pedido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.getOrderAdminUseCase.getOrderAdmin(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Muda o status de um pedido' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @ApiResponse({ status: 409, description: 'Transição de status inválida' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.changeOrderStatusUseCase.changeOrderStatus(
      id,
      dto.status,
      dto.note,
    );
  }
}
