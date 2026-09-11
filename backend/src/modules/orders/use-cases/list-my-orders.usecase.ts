/**
 * Lista os pedidos do próprio cliente logado (filtra por userId do token
 * — nunca confiar em ID vindo da URL sozinho).
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { ListMyOrders } from './interfaces';

@Injectable()
export class ListMyOrdersUseCase implements ListMyOrders {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async listMyOrders(
    userId: string,
    query: OrderQueryDto,
  ): Promise<PaginatedResponseDto<Order>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.orderRepository.findAndCount({
      where: { userId, ...(query.status ? { status: query.status } : {}) },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }
}
