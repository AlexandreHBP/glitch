/**
 * Interfaces segregadas do módulo de pedidos.
 */
import { Order } from '../entities/order.entity';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { OrderStatus } from '../enums/order-status.enum';

export interface CreateOrder {
  createOrder(userId: string, dto: CreateOrderDto): Promise<Order>;
}

export interface ListMyOrders {
  listMyOrders(
    userId: string,
    query: OrderQueryDto,
  ): Promise<PaginatedResponseDto<Order>>;
}

export interface GetOrder {
  getOrder(orderId: string, userId: string): Promise<Order>;
}

export interface ListAllOrders {
  listAllOrders(query: OrderQueryDto): Promise<PaginatedResponseDto<Order>>;
}

export interface GetOrderAdmin {
  getOrderAdmin(orderId: string): Promise<Order>;
}

export interface ChangeOrderStatus {
  changeOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
  ): Promise<Order>;
}
