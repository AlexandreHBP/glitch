/**
 * Detalhe de um pedido para o admin (sem filtro de dono — admin vê tudo).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { GetOrderAdmin } from './interfaces';

@Injectable()
export class GetOrderAdminUseCase implements GetOrderAdmin {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getOrderAdmin(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'statusHistory', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }
}
