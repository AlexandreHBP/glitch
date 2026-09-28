import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ChangeOrderStatusUseCase } from './change-order-status.usecase';
import { InventoryService } from '../../inventory/inventory.service';
import { OrderStatus } from '../enums/order-status.enum';

describe('ChangeOrderStatusUseCase', () => {
  let useCase: ChangeOrderStatusUseCase;
  let mockManager: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockDataSource: { transaction: jest.Mock };
  let mockInventoryService: {
    debitStock: jest.Mock;
    restoreStock: jest.Mock;
    adjustStock: jest.Mock;
  };

  const orderItems = [
    { productVariantId: 'variant-1', quantity: 2 },
    { productVariantId: 'variant-2', quantity: 1 },
  ];

  function buildOrder(overrides: Record<string, unknown> = {}) {
    return {
      id: 'order-1',
      status: OrderStatus.AGUARDANDO_CONTATO,
      ...overrides,
    };
  }

  beforeEach(async () => {
    mockManager = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue(orderItems),
      create: jest.fn((_entity: unknown, data: unknown) => data),
      save: jest.fn((_entity: unknown, data: unknown) => Promise.resolve(data)),
    };

    mockDataSource = {
      transaction: jest.fn(
        (callback: (manager: typeof mockManager) => unknown) =>
          Promise.resolve(callback(mockManager)),
      ),
    };

    mockInventoryService = {
      debitStock: jest.fn(),
      restoreStock: jest.fn().mockResolvedValue(undefined),
      adjustStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeOrderStatusUseCase,
        { provide: DataSource, useValue: mockDataSource },
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    useCase = module.get<ChangeOrderStatusUseCase>(ChangeOrderStatusUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changeOrderStatus', () => {
    it('deve permitir a transição AGUARDANDO_CONTATO -> EM_PREPARO', async () => {
      mockManager.findOne.mockResolvedValue(buildOrder());

      const order = await useCase.changeOrderStatus(
        'order-1',
        OrderStatus.EM_PREPARO,
      );

      expect(order.status).toBe(OrderStatus.EM_PREPARO);
      expect(mockInventoryService.restoreStock).not.toHaveBeenCalled();
    });

    it('deve rejeitar transição inválida (ex.: AGUARDANDO_CONTATO -> ENTREGUE, pulando etapas)', async () => {
      mockManager.findOne.mockResolvedValue(buildOrder());

      await expect(
        useCase.changeOrderStatus('order-1', OrderStatus.ENTREGUE),
      ).rejects.toThrow(ConflictException);
    });

    it('deve rejeitar qualquer transição a partir de um pedido já ENTREGUE (estado terminal)', async () => {
      mockManager.findOne.mockResolvedValue(
        buildOrder({ status: OrderStatus.ENTREGUE }),
      );

      await expect(
        useCase.changeOrderStatus('order-1', OrderStatus.EM_PREPARO),
      ).rejects.toThrow(ConflictException);
    });

    it('deve cancelar e devolver o estoque de cada item exatamente uma vez', async () => {
      const order = buildOrder({ status: OrderStatus.EM_PREPARO });
      mockManager.findOne.mockResolvedValue(order);

      await useCase.changeOrderStatus(
        'order-1',
        OrderStatus.CANCELADO,
        'Cliente desistiu',
      );

      expect(mockInventoryService.restoreStock).toHaveBeenCalledTimes(2);
      expect(mockInventoryService.restoreStock).toHaveBeenCalledWith(
        mockManager,
        'variant-1',
        2,
        'order-1',
        expect.any(String),
      );
      expect(mockInventoryService.restoreStock).toHaveBeenCalledWith(
        mockManager,
        'variant-2',
        1,
        'order-1',
        expect.any(String),
      );
    });

    it('não deve permitir cancelar um pedido que já está CANCELADO (protege contra devolução dupla de estoque)', async () => {
      mockManager.findOne.mockResolvedValue(
        buildOrder({ status: OrderStatus.CANCELADO }),
      );

      await expect(
        useCase.changeOrderStatus('order-1', OrderStatus.CANCELADO),
      ).rejects.toThrow(ConflictException);

      expect(mockInventoryService.restoreStock).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando o pedido não existe', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(
        useCase.changeOrderStatus('order-inexistente', OrderStatus.EM_PREPARO),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve travar o pedido com lock pessimista ao mudar o status', async () => {
      mockManager.findOne.mockResolvedValue(buildOrder());

      await useCase.changeOrderStatus('order-1', OrderStatus.EM_PREPARO);

      expect(mockManager.findOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
    });
  });
});
