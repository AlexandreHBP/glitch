import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderUseCase } from './create-order.usecase';
import { InventoryService } from '../../inventory/inventory.service';
import { DeliveryMethod } from '../enums/delivery-method.enum';
import { OrderStatus } from '../enums/order-status.enum';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockManager: {
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
    query: jest.Mock;
  };
  let mockDataSource: { transaction: jest.Mock };
  let mockInventoryService: {
    debitStock: jest.Mock;
    restoreStock: jest.Mock;
    adjustStock: jest.Mock;
  };
  let variantsQueryResult: unknown[];
  let orderCountResult: number;
  let variantQueryBuilder: {
    innerJoinAndSelect: jest.Mock;
    where: jest.Mock;
    setLock: jest.Mock;
    getMany: jest.Mock;
  };

  const activeProduct = {
    id: 'product-1',
    name: 'Camiseta Glitch',
    active: true,
    basePrice: 89.9,
  };

  function buildVariant(overrides: Record<string, unknown> = {}) {
    return {
      id: 'variant-1',
      productId: 'product-1',
      product: activeProduct,
      sku: 'SKU-1',
      size: 'P',
      color: 'Preto',
      priceOverride: null,
      stockQuantity: 10,
      active: true,
      ...overrides,
    };
  }

  beforeEach(async () => {
    variantsQueryResult = [];
    orderCountResult = 0;

    variantQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getMany: jest.fn(() => Promise.resolve(variantsQueryResult)),
    };

    mockManager = {
      create: jest.fn((_entity: unknown, data: unknown) => data),
      save: jest.fn((_entity: unknown, data: unknown) => Promise.resolve(data)),
      createQueryBuilder: jest
        .fn()
        .mockImplementation(() => variantQueryBuilder),
      // generateOrderNumber usa um UPDATE...RETURNING atômico via
      // manager.query (contador dedicado em order_number_sequences),
      // não mais um createQueryBuilder/getCount.
      query: jest.fn(() =>
        Promise.resolve([{ last_number: ++orderCountResult }]),
      ),
    };

    mockDataSource = {
      transaction: jest.fn(
        (callback: (manager: typeof mockManager) => unknown) =>
          Promise.resolve(callback(mockManager)),
      ),
    };

    mockInventoryService = {
      debitStock: jest.fn().mockResolvedValue(undefined),
      restoreStock: jest.fn().mockResolvedValue(undefined),
      adjustStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        { provide: DataSource, useValue: mockDataSource },
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    useCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('deve criar o pedido, debitar estoque e calcular o total corretamente (numeric)', async () => {
      // Arrange
      const variant = buildVariant({ stockQuantity: 10, priceOverride: null });
      variantsQueryResult = [variant];

      // Act
      const order = await useCase.createOrder('user-1', {
        items: [{ productVariantId: 'variant-1', quantity: 2 }],
        deliveryMethod: DeliveryMethod.PICKUP,
      });

      // Assert
      expect(order.total).toBe(179.8); // 89.9 * 2 — nunca "89.989.9"
      expect(order.status).toBe(OrderStatus.AGUARDANDO_CONTATO);
      expect(mockInventoryService.debitStock).toHaveBeenCalledWith(
        mockManager,
        variant,
        2,
        order.id,
      );
      expect(variantQueryBuilder.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );
      expect(variantQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'variant.product',
        'product',
      );
    });

    it('deve usar priceOverride da variação quando definido, em vez do basePrice do produto', async () => {
      // Arrange
      const variant = buildVariant({ priceOverride: 59.9, stockQuantity: 5 });
      variantsQueryResult = [variant];

      // Act
      const order = await useCase.createOrder('user-1', {
        items: [{ productVariantId: 'variant-1', quantity: 3 }],
        deliveryMethod: DeliveryMethod.PICKUP,
      });

      // Assert
      expect(order.total).toBe(179.7); // 59.9 * 3
    });

    it('deve lançar 409 com a lista de itens quando o estoque é insuficiente e não deve gravar nada', async () => {
      // Arrange
      const variant = buildVariant({ stockQuantity: 1 });
      variantsQueryResult = [variant];

      // Act & Assert
      await expect(
        useCase.createOrder('user-1', {
          items: [{ productVariantId: 'variant-1', quantity: 5 }],
          deliveryMethod: DeliveryMethod.PICKUP,
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockInventoryService.debitStock).not.toHaveBeenCalled();
      // Nenhum "order" (com orderNumber) deve ter sido persistido
      const orderSaveCalls = (
        mockManager.save.mock.calls as unknown[][]
      ).filter((call) => {
        const savedData = call[1];
        return (
          savedData &&
          typeof savedData === 'object' &&
          'orderNumber' in savedData
        );
      });
      expect(orderSaveCalls).toHaveLength(0);
    });

    it('deve lançar 409 quando o produto está inativo', async () => {
      // Arrange
      const variant = buildVariant({
        product: { ...activeProduct, active: false },
      });
      variantsQueryResult = [variant];

      // Act & Assert
      await expect(
        useCase.createOrder('user-1', {
          items: [{ productVariantId: 'variant-1', quantity: 1 }],
          deliveryMethod: DeliveryMethod.PICKUP,
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockInventoryService.debitStock).not.toHaveBeenCalled();
    });

    it('deve lançar 409 quando a variação não é encontrada (ex.: apagada entre carrinho e checkout)', async () => {
      // Arrange
      variantsQueryResult = [];

      // Act & Assert
      await expect(
        useCase.createOrder('user-1', {
          items: [{ productVariantId: 'variant-inexistente', quantity: 1 }],
          deliveryMethod: DeliveryMethod.PICKUP,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve travar as variações com lock pessimista para evitar venda dupla em pedidos concorrentes', async () => {
      // Arrange — simula duas "transações" concorrentes disputando a última peça
      const sharedVariant = buildVariant({ stockQuantity: 1 });
      variantsQueryResult = [sharedVariant];

      // Act — primeira compra consome o estoque
      await useCase.createOrder('user-1', {
        items: [{ productVariantId: 'variant-1', quantity: 1 }],
        deliveryMethod: DeliveryMethod.PICKUP,
      });
      sharedVariant.stockQuantity -= 1; // efeito do débito já aplicado no objeto ("mesma linha" travada)

      // Assert — segunda tentativa sobre a mesma variação sem estoque deve falhar
      await expect(
        useCase.createOrder('user-2', {
          items: [{ productVariantId: 'variant-1', quantity: 1 }],
          deliveryMethod: DeliveryMethod.PICKUP,
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockDataSource.transaction).toHaveBeenCalledTimes(2);
    });
  });
});
