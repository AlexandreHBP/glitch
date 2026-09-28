/**
 * Cria o pedido, congela preços e debita estoque — tudo em UMA transação
 * (o use-case mais crítico do sistema, ver "Use-case crítico — criação de
 * pedido" da arquitetura). Se qualquer item faltar, nada é gravado e
 * nenhum estoque é debitado.
 *
 * Regras de ouro:
 * - Uma transação só: estoque e pedido nascem juntos ou não nascem.
 * - Lock pessimista nas variações (pessimistic_write / SELECT FOR UPDATE),
 *   não lock otimista: o conflito é raro, mas vender o que não existe é caro.
 * - Erro 409 com a lista item a item do que faltou.
 * - Preço e total SEMPRE lidos do banco — o DTO não tem campo de preço.
 */
import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';
import { InventoryService } from '../../inventory/inventory.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { DeliveryMethod } from '../enums/delivery-method.enum';
import { CreateOrder } from './interfaces';
import { generateOrderNumber } from './generate-order-number';

interface UnavailableItem {
  productVariantId: string;
  reason: string;
}

@Injectable()
export class CreateOrderUseCase implements CreateOrder {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    const quantitiesByVariant = this.aggregateQuantities(dto.items);
    // Ordenado antes do lock: proteção defensiva extra contra deadlock em
    // pedidos concorrentes que travam as mesmas variações em ordem
    // invertida (o carrinho de cada cliente pode chegar em qualquer
    // ordem). Risco já era baixo na prática, mas ordenar é gratuito.
    const variantIds = Array.from(quantitiesByVariant.keys()).sort();

    return this.dataSource.transaction(async (manager) => {
      // 1. Trava as variações do pedido (evita venda dupla da última peça).
      //    Usa INNER JOIN (não `relations` do find(), que gera LEFT JOIN) —
      //    o Postgres recusa `FOR UPDATE` no lado nullable de um outer join.
      const variants = await manager
        .createQueryBuilder(ProductVariant, 'variant')
        .innerJoinAndSelect('variant.product', 'product')
        .where('variant.id IN (:...ids)', { ids: variantIds })
        .setLock('pessimistic_write')
        .getMany();

      // 2. Valida existência, produto ativo e estoque suficiente
      const unavailable = this.validateAvailability(
        variantIds,
        variants,
        quantitiesByVariant,
      );
      if (unavailable.length > 0) {
        throw new ConflictException({
          message: 'Um ou mais itens do pedido estão indisponíveis',
          items: unavailable,
        });
      }

      // 3. Calcula total com o preço DO BANCO (priceOverride ?? basePrice)
      const orderNumber = await generateOrderNumber(manager);
      const order = manager.create(Order, {
        userId,
        orderNumber,
        status: OrderStatus.AGUARDANDO_CONTATO,
        total: 0,
        deliveryMethod: dto.deliveryMethod,
        deliveryAddress:
          dto.deliveryMethod === DeliveryMethod.SHIPPING
            ? (dto.deliveryAddress ?? null)
            : null,
        customerNotes: dto.customerNotes ?? null,
      });
      await manager.save(Order, order);

      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const variant of variants) {
        const quantity = quantitiesByVariant.get(variant.id) as number;
        const unitPrice = variant.priceOverride ?? variant.product.basePrice;
        const subtotal = unitPrice * quantity;
        total += subtotal;

        const orderItem = manager.create(OrderItem, {
          orderId: order.id,
          productVariantId: variant.id,
          productName: variant.product.name,
          variantLabel: `${variant.size} / ${variant.color}`,
          unitPrice,
          quantity,
          subtotal,
        });
        orderItems.push(orderItem);

        // 4. Debita estoque + grava stock_movements (mesma transação)
        await this.inventoryService.debitStock(
          manager,
          variant,
          quantity,
          order.id,
        );
      }

      await manager.save(OrderItem, orderItems);

      order.total = total;
      await manager.save(Order, order);

      // 5. Grava order_status_history inicial
      const history = manager.create(OrderStatusHistory, {
        orderId: order.id,
        status: OrderStatus.AGUARDANDO_CONTATO,
        note: 'Pedido criado',
      });
      await manager.save(OrderStatusHistory, history);

      order.items = orderItems;
      return order;
    });
  }

  private aggregateQuantities(
    items: CreateOrderDto['items'],
  ): Map<string, number> {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(
        item.productVariantId,
        (map.get(item.productVariantId) ?? 0) + item.quantity,
      );
    }
    return map;
  }

  private validateAvailability(
    requestedIds: string[],
    foundVariants: ProductVariant[],
    quantitiesByVariant: Map<string, number>,
  ): UnavailableItem[] {
    const unavailable: UnavailableItem[] = [];
    const foundById = new Map(foundVariants.map((v) => [v.id, v]));

    for (const id of requestedIds) {
      const variant = foundById.get(id);
      const quantity = quantitiesByVariant.get(id) as number;

      if (!variant) {
        unavailable.push({
          productVariantId: id,
          reason: 'Variação não encontrada',
        });
        continue;
      }
      if (!variant.product.active) {
        unavailable.push({
          productVariantId: id,
          reason: 'Produto não está mais disponível',
        });
        continue;
      }
      if (!variant.active) {
        unavailable.push({
          productVariantId: id,
          reason: 'Variação não está mais disponível',
        });
        continue;
      }
      if (variant.stockQuantity < quantity) {
        unavailable.push({
          productVariantId: id,
          reason: `Estoque insuficiente (disponível: ${variant.stockQuantity}, pedido: ${quantity})`,
        });
      }
    }

    return unavailable;
  }
}
