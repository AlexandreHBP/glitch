/**
 * Máquina de estados do pedido (ver order-status-transitions.ts). Ao
 * cancelar, devolve estoque via RestoreStockUseCase dentro da MESMA
 * transação — protegido pelo status atual, então só acontece uma vez
 * (ENTREGUE e CANCELADO são terminais).
 */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { InventoryService } from '../../inventory/inventory.service';
import { OrderStatus } from '../enums/order-status.enum';
import { isValidTransition } from './order-status-transitions';
import { ChangeOrderStatus } from './interfaces';

@Injectable()
export class ChangeOrderStatusUseCase implements ChangeOrderStatus {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  async changeOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // Trava só a linha do pedido (sem `relations`, que geraria LEFT JOIN —
      // o Postgres recusa `FOR UPDATE` no lado nullable de um outer join).
      // É essa trava que garante que o cancelamento só devolve estoque uma vez.
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Pedido não encontrado');
      }

      if (!isValidTransition(order.status, status)) {
        throw new ConflictException(
          `Não é possível mudar o status de "${order.status}" para "${status}"`,
        );
      }

      if (status === OrderStatus.CANCELADO) {
        const items = await manager.find(OrderItem, {
          where: { orderId: order.id },
        });
        for (const item of items) {
          await this.inventoryService.restoreStock(
            manager,
            item.productVariantId,
            item.quantity,
            order.id,
            'Devolução por cancelamento de pedido',
          );
        }
      }

      order.status = status;
      await manager.save(Order, order);

      const history = manager.create(OrderStatusHistory, {
        orderId: order.id,
        status,
        note: note ?? null,
      });
      await manager.save(OrderStatusHistory, history);

      return order;
    });
  }
}
