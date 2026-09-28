/**
 * TypeORM sempre devolve colunas `numeric`/`decimal` como string em JavaScript,
 * porque o driver `pg` não arrisca perder precisão convertendo para float.
 * Sem este transformer, somar dois preços concatena strings ("10.00" + "5.00")
 * em vez de somar números — é o bug número um deste modelo de dados
 * (ver "Notes for Developer" em architecture-glitch-loja.md).
 *
 * Toda coluna `numeric` (preços, totais) deve usar este transformer.
 */
import { ValueTransformer } from 'typeorm';

export class ColumnNumericTransformer implements ValueTransformer {
  to(data: number | null | undefined): number | null | undefined {
    return data;
  }

  from(data: string | null): number | null {
    if (data === null || data === undefined) {
      return null;
    }
    return parseFloat(data);
  }
}
