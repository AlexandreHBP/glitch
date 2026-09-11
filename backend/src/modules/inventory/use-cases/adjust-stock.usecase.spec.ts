import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdjustStockUseCase } from './adjust-stock.usecase';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { StockMovementType } from '../enums/stock-movement-type.enum';

describe('AdjustStockUseCase', () => {
  let useCase: AdjustStockUseCase;
  let mockManager: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let mockDataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    mockManager = {
      findOne: jest.fn(),
      save: jest.fn((_entity: unknown, data: unknown) => Promise.resolve(data)),
      create: jest.fn((_entity: unknown, data: unknown) => data),
    };

    mockDataSource = {
      transaction: jest.fn(
        (callback: (manager: typeof mockManager) => unknown) =>
          Promise.resolve(callback(mockManager)),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustStockUseCase,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    useCase = module.get<AdjustStockUseCase>(AdjustStockUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve lançar NotFoundException quando a variação não existe', async () => {
    mockManager.findOne.mockResolvedValue(null);

    await expect(
      useCase.adjustStock('variant-inexistente', 10, 'Contagem manual'),
    ).rejects.toThrow(NotFoundException);

    expect(mockManager.save).not.toHaveBeenCalled();
  });

  it('deve definir a quantidade absoluta e gravar o delta positivo como ADJUSTMENT', async () => {
    const variant = { id: 'variant-1', stockQuantity: 5 } as ProductVariant;
    mockManager.findOne.mockResolvedValue(variant);

    const result = await useCase.adjustStock(
      'variant-1',
      20,
      'Contagem manual',
    );

    expect(result.stockQuantity).toBe(20);
    expect(mockManager.create).toHaveBeenCalledWith(StockMovement, {
      productVariantId: 'variant-1',
      orderId: null,
      type: StockMovementType.ADJUSTMENT,
      quantity: 15, // delta = 20 - 5
      reason: 'Contagem manual',
    });
  });

  it('deve gravar o delta negativo quando a nova quantidade é menor que a atual', async () => {
    const variant = { id: 'variant-1', stockQuantity: 20 } as ProductVariant;
    mockManager.findOne.mockResolvedValue(variant);

    await useCase.adjustStock('variant-1', 12, 'Avaria');

    expect(mockManager.create).toHaveBeenCalledWith(
      StockMovement,
      expect.objectContaining({ quantity: -8, reason: 'Avaria' }),
    );
  });

  it('não deve gravar nenhum StockMovement quando o delta é zero', async () => {
    const variant = { id: 'variant-1', stockQuantity: 10 } as ProductVariant;
    mockManager.findOne.mockResolvedValue(variant);

    await useCase.adjustStock('variant-1', 10, 'Recontagem sem alteração');

    expect(mockManager.create).not.toHaveBeenCalled();
    // ProductVariant ainda é salvo (idempotente), StockMovement não.
    expect(mockManager.save).toHaveBeenCalledTimes(1);
    expect(mockManager.save).toHaveBeenCalledWith(ProductVariant, variant);
  });
});
