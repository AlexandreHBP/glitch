# Super Entities

Esta pasta contém as classes base que todas as entidades do sistema devem estender.

## Entidades disponíveis

### SuperEntity

```typescript
import { SuperEntity } from 'src/database/entities/super.entity';

@Entity('example')
export class ExampleEntity extends SuperEntity {
  // seus campos aqui
}
```

**Campos herdados:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `number` | Chave primária auto-incrementada |
| `createdAt` | `Date` | Data de criação (automático) |
| `updatedAt` | `Date` | Data de atualização (automático) |

**Quando usar:**
- Entidades que podem ser **deletadas permanentemente** (hard delete)
- Logs e registros de auditoria
- Dados temporários ou de cache
- Tabelas de relacionamento many-to-many
- Dados que não precisam de histórico após exclusão

**Exemplos:**
- `SessionEntity` - Sessões de usuário
- `LogEntity` - Logs do sistema
- `NotificationEntity` - Notificações lidas
- `TokenEntity` - Tokens de autenticação

---

### SuperWithSoftDeleteEntity

```typescript
import { SuperWithSoftDeleteEntity } from 'src/database/entities/super-with-soft-delete.entity';

@Entity('example')
export class ExampleEntity extends SuperWithSoftDeleteEntity {
  // seus campos aqui
}
```

**Campos herdados:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `number` | Chave primária auto-incrementada |
| `createdAt` | `Date` | Data de criação (automático) |
| `updatedAt` | `Date` | Data de atualização (automático) |
| `deletedAt` | `Date` | Data de exclusão lógica (soft delete) |

**Quando usar:**
- Entidades que precisam de **exclusão lógica** (soft delete)
- Dados que podem precisar ser restaurados
- Entidades com relacionamentos importantes
- Dados sujeitos a auditoria ou compliance
- Entidades de domínio principal do negócio

**Exemplos:**
- `UserEntity` - Usuários do sistema
- `ProductEntity` - Produtos
- `OrderEntity` - Pedidos
- `CustomerEntity` - Clientes
- `InvoiceEntity` - Faturas

---

## Uso do Soft Delete

Ao usar `SuperWithSoftDeleteEntity`, utilize os métodos do repositório:

```typescript
// Soft delete (marca deleted_at)
await repository.softRemove(entity);

// Hard delete (remove permanentemente)
await repository.remove(entity);

// Buscar incluindo deletados
await repository.find({ withDeleted: true });

// Buscar apenas deletados
await repository.find({
  where: { deletedAt: Not(IsNull()) },
  withDeleted: true,
});

// Restaurar entidade deletada
await repository.restore(id);
```

---

## Resumo

| Cenário | Entidade |
|---------|----------|
| Precisa manter histórico | `SuperWithSoftDeleteEntity` |
| Pode deletar permanentemente | `SuperEntity` |
| Dados de domínio/negócio | `SuperWithSoftDeleteEntity` |
| Dados temporários/auxiliares | `SuperEntity` |
| Relacionamentos críticos | `SuperWithSoftDeleteEntity` |
| Logs e auditoria | `SuperEntity` |
