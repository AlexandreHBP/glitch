import { DebitStockUseCase } from './debit-stock.usecase';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { StockMovementType } from '../enums/stock-movement-type.enum';

describe('DebitStockUseCase', () => {
  let useCase: DebitStockUseCase;
  let mockManager: { save: jest.Mock; create: jest.Mock };

  beforeEach(() => {
    useCase = new DebitStockUseCase();
    mockManager = {
      save: jest.fn((_entity: unknown, data: unknown) => Promise.resolve(data)),
      create: jest.fn((_entity: unknown, data: unknown) => data),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve decrementar stockQuantity da variação na quantidade informada', async () => {
    const variant = { id: 'variant-1', stockQuantity: 10 } as ProductVariant;

    await useCase.debitStock(mockManager as never, variant, 3, 'order-1');

    expect(variant.stockQuantity).toBe(7);
    expect(mockManager.save).toHaveBeenCalledWith(ProductVariant, variant);
  });

  it('deve gravar um StockMovement do tipo OUT vinculado ao pedido', async () => {
    const variant = { id: 'variant-1', stockQuantity: 10 } as ProductVariant;

    await useCase.debitStock(mockManager as never, variant, 2, 'order-42');

    expect(mockManager.create).toHaveBeenCalledWith(StockMovement, {
      productVariantId: 'variant-1',
      orderId: 'order-42',
      type: StockMovementType.OUT,
      quantity: 2,
      reason: 'Débito por criação de pedido',
    });
    expect(mockManager.save).toHaveBeenCalledWith(
      StockMovement,
      expect.objectContaining({ type: StockMovementType.OUT, quantity: 2 }),
    );
  });

  it('deve permitir estoque chegar a zero (não valida saldo — quem valida é o use-case chamador)', async () => {
    const variant = { id: 'variant-1', stockQuantity: 5 } as ProductVariant;

    await useCase.debitStock(mockManager as never, variant, 5, 'order-1');

    expect(variant.stockQuantity).toBe(0);
  });
});
