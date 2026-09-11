import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrdersController } from './orders.controller';
import { OrdersAdminController } from './orders-admin.controller';
import { InventoryModule } from '../inventory/inventory.module';
import {
  CreateOrderUseCase,
  ListMyOrdersUseCase,
  GetOrderUseCase,
  ListAllOrdersUseCase,
  GetOrderAdminUseCase,
  ChangeOrderStatusUseCase,
} from './use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory]),
    InventoryModule,
  ],
  controllers: [OrdersController, OrdersAdminController],
  providers: [
    CreateOrderUseCase,
    ListMyOrdersUseCase,
    GetOrderUseCase,
    ListAllOrdersUseCase,
    GetOrderAdminUseCase,
    ChangeOrderStatusUseCase,
  ],
})
export class OrdersModule {}
