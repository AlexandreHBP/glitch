/**
 * Lista todos os pedidos para o painel admin, com filtro por status.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { ListAllOrders } from './interfaces';

@Injectable()
export class ListAllOrdersUseCase implements ListAllOrders {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async listAllOrders(
    query: OrderQueryDto,
  ): Promise<PaginatedResponseDto<Order>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.orderRepository.findAndCount({
      where: query.status ? { status: query.status } : {},
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }
}
