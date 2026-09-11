# Migrations

## Convenção de nomenclatura

O nome do arquivo deve seguir o padrão:

```
{timestamp}-{NomeDaMigration}.ts
```

O timestamp deve ser gerado usando `Date.now()`:

```bash
node -e "console.log(Date.now())"
# Exemplo de saída: 1734364800000
```

## Estrutura do arquivo

Todas as migrations devem ser escritas em **SQL puro** usando `queryRunner.query()`:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class NomeDaMigration1734364800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- SQL para aplicar a migration
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- SQL para reverter a migration
    `);
  }
}
```

## Exemplo: Criar tabela

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1734364800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_users_email ON users(email);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
```

## Exemplo: Adicionar coluna

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToUsers1734364900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN phone;
    `);
  }
}
```

## Exemplo: Criar relacionamento

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1734365000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ,
        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_orders_user_id ON orders(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_user_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders;`);
  }
}
```

## Comandos úteis

```bash
# Executar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert

# Ver status das migrations
npm run migration:show
```

## Boas práticas

1. **Sempre escreva o `down()`**: Permita reverter a migration
2. **Uma responsabilidade por migration**: Não misture criação de tabelas diferentes
3. **Use transações implícitas**: O TypeORM já executa cada migration em uma transação
4. **Teste localmente antes de commitar**: Execute `migration:run` e `migration:revert`
5. **Nunca edite migrations já executadas em produção**: Crie uma nova migration para correções
