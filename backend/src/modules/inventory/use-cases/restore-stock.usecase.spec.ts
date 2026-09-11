import { RestoreStockUseCase } from './restore-stock.usecase';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { StockMovementType } from '../enums/stock-movement-type.enum';

describe('RestoreStockUseCase', () => {
  let useCase: RestoreStockUseCase;
  let mockManager: { increment: jest.Mock; save: jest.Mock; create: jest.Mock };

  beforeEach(() => {
    useCase = new RestoreStockUseCase();
    mockManager = {
      increment: jest.fn().mockResolvedValue(undefined),
      save: jest.fn((_entity: unknown, data: unknown) => Promise.resolve(data)),
      create: jest.fn((_entity: unknown, data: unknown) => data),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve incrementar stockQuantity da variação via manager.increment (evita race condition de leitura-e-gravação)', async () => {
    await useCase.restoreStock(
      mockManager as never,
      'variant-1',
      4,
      'order-1',
      'Cancelamento do pedido',
    );

    expect(mockManager.increment).toHaveBeenCalledWith(
      ProductVariant,
      { id: 'variant-1' },
      'stockQuantity',
      4,
    );
  });

  it('deve gravar um StockMovement do tipo IN com o motivo informado', async () => {
    await useCase.restoreStock(
      mockManager as never,
      'variant-1',
      4,
      'order-1',
      'Cancelamento do pedido',
    );

    expect(mockManager.create).toHaveBeenCalledWith(StockMovement, {
      productVariantId: 'variant-1',
      orderId: 'order-1',
      type: StockMovementType.IN,
      quantity: 4,
      reason: 'Cancelamento do pedido',
    });
    expect(mockManager.save).toHaveBeenCalledWith(
      StockMovement,
      expect.objectContaining({
        type: StockMovementType.IN,
        reason: 'Cancelamento do pedido',
      }),
    );
  });

  it('deve executar increment antes de gravar o movimento (ordem importa para auditoria)', async () => {
    const callOrder: string[] = [];
    mockManager.increment.mockImplementation(() => {
      callOrder.push('increment');
      return Promise.resolve(undefined);
    });
    mockManager.save.mockImplementation((_entity: unknown, data: unknown) => {
      callOrder.push('save');
      return Promise.resolve(data);
    });

    await useCase.restoreStock(
      mockManager as never,
      'variant-1',
      1,
      'order-1',
      'motivo',
    );

    expect(callOrder).toEqual(['increment', 'save']);
  });
});
