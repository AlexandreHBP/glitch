/**
 * Tipo de movimentação de estoque, gravada em stock_movements para
 * auditoria de toda entrada/saída.
 */
export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}
