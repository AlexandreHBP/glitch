/**
 * Detalhe do pedido do próprio cliente, com histórico de status. Filtra
 * por userId do token — o furo de autorização mais comum em loja é
 * confiar só no ID da URL.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { GetOrder } from './interfaces';

@Injectable()
export class GetOrderUseCase implements GetOrder {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'statusHistory'],
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }
}
