# [How to Create Migrations in the Backend]()

Complete guide to creating and managing database migrations with TypeORM using pure SQL ensuring version control, schema evolution, data integrity, and rollback capabilities.

## [TypeORM Migration System Overview]()

Migrations are version-controlled database schema change scripts enabling structured evolution of database structure across environments with rollback capabilities, change history tracking, team synchronization, and automated deployment support for consistent schema management.

### When to use?

Use TypeORM migrations for all database schema changes including table creation, column modifications, index additions, constraint updates, and data transformations. Migrations ensure changes are version-controlled, reversible, documented, and can be deployed consistently across development, staging, and production environments.

### When NOT to use?

Avoid migrations for temporary development experiments, environment-specific seed data that varies by instance, or exploratory schema changes during early prototyping. Don't use migrations for data-only updates that should be handled through application logic or separate data scripts.

### Example

**What Migrations Provide**:
- Version control for database schema changes
- Rollback capability via down methods
- Change history tracking with timestamps
- Team synchronization of schema modifications
- Automated deployment support for CI/CD
- Reproducible database states across environments

**Migration Lifecycle**:
1. Create migration file with timestamped name
2. Implement up method (schema changes)
3. Implement down method (rollback logic)
4. Test in development environment
5. Commit to version control
6. Deploy to staging/production via migration:run

### Checklist

- [ ] Understand migration purpose and workflow
- [ ] Development database available for testing
- [ ] TypeORM CLI configured in package.json
- [ ] Migration directory path configured correctly
- [ ] Database connection settings verified
- [ ] Version control system ready for commits

### Troubleshooting

**TypeORM CLI not found**: Verify typeorm script in package.json points to correct CLI path with ts-node.

**Database connection fails**: Check database config file has correct credentials and database exists.

**Permission errors**: Ensure database user has CREATE, ALTER, DROP permissions for schema modifications.

### Best Practices

- Create migrations for all schema changes, never modify database manually
- Test migrations in development before committing to version control
- Write descriptive migration names indicating what changes are made
- Always implement both up and down methods for reversibility
- Keep migrations focused on single logical change
- Never edit migrations after they've been committed and deployed

## [TypeORM CLI Migration Commands]()

Comprehensive CLI command reference for migration lifecycle management including creation, automatic generation, execution, rollback, and status checking. These commands form the foundation of database schema version control workflow enabling systematic schema evolution.

### When to use?

Use migration CLI commands throughout development lifecycle: creation for new schema changes, generation for auto-detecting entity differences, run for applying pending migrations, revert for undoing last migration, and show for viewing migration status across environments.

### When NOT to use?

Don't bypass CLI commands to modify database directly in production. Avoid using generate without reviewing output SQL. Don't run migrations without first checking status and pending changes with show command.

### Example

**Create Empty Migration**:
```bash
npm run typeorm -- migration:create src/database/migrations/MigrationName
```
Generates blank migration file with empty up and down methods for manual SQL implementation.

**Generate Automatic Migration**:
```bash
npm run typeorm -- migration:generate src/database/migrations/MigrationName
```
Automatically generates migration based on differences between entities and database schema.

**Run Pending Migrations**:
```bash
npm run typeorm -- migration:run
```
Executes all pending migrations in chronological order based on timestamp.

**Revert Last Migration**:
```bash
npm run typeorm -- migration:revert
```
Reverts the last executed migration by calling its down method.

**Show Migration Status**:
```bash
npm run typeorm -- migration:show
```
Lists which migrations have been executed and which are pending.

### Checklist

- [ ] TypeORM CLI commands available via npm run
- [ ] Migration path specified correctly in commands
- [ ] Timestamp naming convention understood
- [ ] Run migrations in correct environment
- [ ] Status checked before and after operations
- [ ] Revert tested in development first

### Troubleshooting

**Command not recognized**: Check package.json scripts section includes typeorm command definition.

**Migration path errors**: Verify migration directory exists and path in command matches project structure.

**No pending migrations**: Use migration:show to verify which migrations are already executed.

### Best Practices

- Always use migration:show before running migrations to verify pending changes
- Test migration:run and migration:revert in development first
- Use descriptive migration names following pattern: VerbNounTable (e.g., CreateUsersTable)
- Commit migrations to version control immediately after creation
- Never delete or modify migrations after they've been deployed
- Use migration:create for precise control, generate for entity synchronization

## [Manual Migration Creation Workflow]()

Complete workflow for creating manual migrations including file generation with timestamped naming, implementing up method for schema changes, down method for rollback, and executing migrations. This approach provides precise control over database modifications with pure SQL.

### When to use?

Create manual migrations when you need precise control over SQL execution, complex data transformations, multi-step schema changes, or when implementing operations that TypeORM's automatic generation cannot handle such as custom functions, triggers, or complex constraints.

### When NOT to use?

Avoid manual migration creation for simple entity changes where automatic generation would suffice. Don't use when entity definitions already exist and match desired schema—use migration:generate instead to save time and reduce errors.

### Example

**Step 1: Create Migration File**:
```bash
npm run typeorm -- migration:create src/database/migrations/CreateProductsTable
```
Generates: `src/database/migrations/1234567890000-CreateProductsTable.ts`

**Step 2: Implement Up Method**:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table
    await queryRunner.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        user_id INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index
    await queryRunner.query(`
      CREATE INDEX idx_products_user_id ON products(user_id);
    `);

    // Add foreign key
    await queryRunner.query(`
      ALTER TABLE products
        ADD CONSTRAINT fk_products_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE products;`);
  }
}
```

**Step 3: Execute Migration**:
```bash
npm run typeorm -- migration:run
```

### Checklist

- [ ] Migration file created with descriptive name
- [ ] Up method implements all schema changes
- [ ] Down method reverts changes completely
- [ ] Pure SQL used via queryRunner.query
- [ ] Foreign keys and indexes defined
- [ ] Column types match entity definitions
- [ ] Migration tested in development
- [ ] Migration committed to version control

### Troubleshooting

**Timestamp conflicts**: Wait one second before creating another migration if timestamp collision occurs.

**SQL syntax errors**: Test SQL statements in database client before adding to migration.

**Down method incomplete**: Ensure down method fully reverses all changes made in up method.

### Best Practices

- Use queryRunner.query for all SQL operations
- Separate logical operations into distinct query calls
- Add indexes for foreign keys and frequently queried columns
- Use descriptive constraint names for easier debugging
- Test up method followed by down method in development
- Document complex migrations with inline comments

## [Common SQL Operations in Migrations - DDL and DML Patterns]()

Comprehensive catalog of DDL and DML operations for migrations including table creation, column modifications, index management, foreign key constraints, and data seeding. These patterns cover all common schema evolution scenarios with PostgreSQL-specific syntax and best practices.

### When to use?

Use these SQL operation patterns as templates when implementing specific schema changes. Reference appropriate pattern based on operation type needed: DDL for structure changes (CREATE, ALTER, DROP) and DML for data modifications (INSERT, UPDATE, DELETE).

### When NOT to use?

Avoid combining too many disparate operations in single migration. Don't use database-specific syntax that would prevent migration portability without documenting database dependency clearly.

### Example

**Create Table**:
```typescript
await queryRunner.query(`
  CREATE TABLE table_name (
    id SERIAL PRIMARY KEY,
    field VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
`);
```

**Add Column**:
```typescript
await queryRunner.query(`
  ALTER TABLE table_name
    ADD COLUMN new_column VARCHAR(255);
`);
```

**Remove Column**:
```typescript
await queryRunner.query(`
  ALTER TABLE table_name
    DROP COLUMN column_name;
`);
```

**Modify Column Type**:
```typescript
await queryRunner.query(`
  ALTER TABLE table_name
    ALTER COLUMN column_name TYPE VARCHAR(500);
`);
```

**Rename Column**:
```typescript
await queryRunner.query(`
  ALTER TABLE table_name
    RENAME COLUMN old_name TO new_name;
`);
```

**Create Index**:
```typescript
await queryRunner.query(`
  CREATE INDEX idx_name_field ON table_name(field);
`);
```

**Create Composite Index**:
```typescript
await queryRunner.query(`
  CREATE INDEX idx_field1_field2 ON table_name(field1, field2);
`);
```

**Add Foreign Key**:
```typescript
await queryRunner.query(`
  ALTER TABLE child_table
    ADD CONSTRAINT fk_child_table_parent
    FOREIGN KEY (fk_column)
    REFERENCES parent_table(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
`);
```

**Insert Seed Data**:
```typescript
await queryRunner.query(`
  INSERT INTO sectors (name, description)
  VALUES
    ('Technology', 'Technology sector'),
    ('Financial', 'Financial sector'),
    ('Health', 'Health sector');
`);
```

**Update Data**:
```typescript
await queryRunner.query(`
  UPDATE users
  SET active = true
  WHERE created_at > '2024-01-01';
`);
```

### Checklist

- [ ] SQL operation matches intended schema change
- [ ] Column types appropriate for data being stored
- [ ] NOT NULL constraints only on required fields
- [ ] Default values specified where appropriate
- [ ] Indexes created for foreign keys and query columns
- [ ] Foreign key cascade rules defined correctly
- [ ] Data modifications preserve referential integrity

### Troubleshooting

**Type mismatch errors**: Verify column types match data being stored and entity definitions.

**Constraint violations**: Check existing data satisfies new constraints before applying.

**Index creation fails**: Ensure indexed columns exist and contain valid data for indexing.

### Best Practices

- Use TIMESTAMPTZ for all timestamp columns to store timezone information
- Create indexes for all foreign key columns to improve query performance
- Specify ON DELETE and ON UPDATE cascade rules explicitly for foreign keys
- Use VARCHAR with appropriate length limits rather than unbounded TEXT where possible
- Add indexes for columns used frequently in WHERE, ORDER BY, or JOIN clauses
- Use descriptive constraint and index names following naming conventions

## [Adding Column to Existing Table - Single Column Modification]()

End-to-end example demonstrating column addition to existing table with proper default value, data type specification, and complete rollback implementation. This pattern applies to any single-column modification scenario requiring backward compatibility.

### When to use?

Use this pattern when adding new columns to existing tables whether optional or required fields. This approach handles both nullable columns for optional data and non-nullable columns requiring default values for existing records.

### When NOT to use?

Don't use this simple pattern when adding columns that require complex data population from multiple sources or when new column depends on data transformations requiring multiple steps.

### Example

**Migration: Add active field to products table**:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveToProducts1234567890001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN active;
    `);
  }
}
```

### Checklist

- [ ] Column name follows snake_case convention
- [ ] Data type matches entity property type
- [ ] Default value provided for existing rows
- [ ] NULL/NOT NULL constraint specified
- [ ] Down method removes column completely
- [ ] Migration tested with existing data

### Troubleshooting

**Cannot add NOT NULL column**: Provide DEFAULT value for existing rows or make column nullable initially.

**Default value type mismatch**: Ensure default value matches column data type exactly.

**Down method fails**: Verify column name in DROP COLUMN matches ADD COLUMN exactly.

### Best Practices

- Always provide DEFAULT value when adding NOT NULL column to table with data
- Use meaningful default values that make sense for business logic
- Consider making column nullable initially if appropriate default doesn't exist
- Test migration with production-like data volumes
- Document reason for default value choice in migration comments

## [Adding Foreign Key Relationship - Table Relationship Establishment]()

Comprehensive foreign key addition example including column creation, constraint definition with cascade rules, index creation for query performance, and complete rollback logic. Demonstrates proper relationship establishment between tables with referential integrity.

### When to use?

Use this pattern when establishing relationships between tables requiring foreign key constraints. Apply when adding new relationships to existing tables or when creating related tables requiring referential integrity enforcement.

### When NOT to use?

Avoid foreign keys when implementing soft references that shouldn't enforce database-level constraints, when working with legacy systems with inconsistent data, or when relationship is purely logical without referential integrity requirements.

### Example

**Migration: Add category_id relationship in products**:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToProducts1234567890002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add column
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN category_id INT;
    `);

    // Step 2: Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE products
        ADD CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    `);

    // Step 3: Create index for performance
    await queryRunner.query(`
      CREATE INDEX idx_products_category_id ON products(category_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order: Remove index, then constraint, then column
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_products_category_id;
    `);

    await queryRunner.query(`
      ALTER TABLE products
        DROP CONSTRAINT IF EXISTS fk_products_category;
    `);

    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN category_id;
    `);
  }
}
```

### Checklist

- [ ] Referenced table and column exist
- [ ] Column data type matches referenced column type
- [ ] Foreign key constraint named descriptively
- [ ] ON DELETE action specified appropriately
- [ ] ON UPDATE action specified appropriately
- [ ] Index created on foreign key column
- [ ] Down method removes in reverse order

### Troubleshooting

**Referenced table doesn't exist**: Create referenced table in earlier migration or same up method.

**Data type mismatch**: Ensure foreign key column type exactly matches referenced column type.

**Constraint violation on existing data**: Clean up orphaned records or make column nullable before adding constraint.

### Best Practices

- Create index on foreign key column for query performance
- Use descriptive constraint names: fk_childtable_parenttable
- Specify ON DELETE action based on business logic (CASCADE, SET NULL, RESTRICT)
- Always use ON UPDATE CASCADE for automatic referential integrity
- Make foreign key columns nullable when relationship is optional
- Remove components in reverse order in down method

## [Automatic Migration Generation from Entities - Entity-Driven Schema Sync]()

Automated migration generation comparing entity definitions with current database schema to produce synchronization migrations. This approach accelerates development by automatically detecting and scripting schema differences while requiring careful review before execution.

### When to use?

Use automatic generation when entity definitions have been modified and you want TypeORM to detect schema differences and generate synchronization SQL. Ideal for catching column additions, modifications, or removals across multiple entities simultaneously.

### When NOT to use?

Avoid automatic generation for production migrations without thorough review. Don't use when migrations require complex data transformations, multi-step operations, or specific SQL that TypeORM cannot generate automatically.

### Example

**Step 1: Modify Entity**:
```typescript
@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;

  // New column added
  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;
}
```

**Step 2: Generate Migration**:
```bash
npm run typeorm -- migration:generate src/database/migrations/AddBrandToProducts
```

**Step 3: TypeORM Auto-Generated Output**:
```typescript
export class AddBrandToProducts1234567890003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD "brand" character varying(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "brand"
    `);
  }
}
```

**Step 4: Execute Migration**:
```bash
npm run typeorm -- migration:run
```

### Checklist

- [ ] Entity modifications completed and saved
- [ ] Database connection active for comparison
- [ ] Generated migration reviewed for correctness
- [ ] SQL syntax appropriate for target database
- [ ] No unexpected schema changes included
- [ ] Down method properly reverses changes
- [ ] Migration tested before committing

### Troubleshooting

**No changes detected**: Ensure entities are properly decorated and TypeORM can load them from configured paths.

**Too many changes detected**: Review entity history and database state to identify cause of drift.

**SQL syntax incorrect**: Edit generated migration to use correct syntax for target database.

### Best Practices

- Always review generated migrations before executing
- Test generated migrations in development environment first
- Edit generated SQL if TypeORM produces suboptimal queries
- Use generate for detecting multiple entity changes simultaneously
- Prefer manual migrations for complex operations or data transformations
- Commit generated migrations with descriptive commit messages

## [Migration Best Practices and Safety Guidelines - Production-Safe Migration Standards]()

Critical guidelines ensuring safe, reversible, and maintainable migrations including down method implementation, transaction usage, development testing, descriptive naming, single responsibility, data preservation, documentation, and avoiding database logic ensuring production-safe migrations.

### When to use?

Apply these best practices to all migrations regardless of complexity or type. These guidelines ensure migrations are safe for production deployment, reversible in case of issues, maintainable by team members, and follow established conventions.

### When NOT to use?

These are universal practices applicable to all migrations. There are no scenarios where these guidelines should be ignored except when explicitly documented exceptions exist for specific edge cases.

### Example

**1. Always Implement Down Method**:
```typescript
public async down(queryRunner: QueryRunner): Promise<void> {
  // Revert exactly what was done in up()
  await queryRunner.query(`DROP TABLE table_name;`);
}
```

**2. Migrations Run in Transactions by Default**:
```typescript
// No manual transaction needed - automatic rollback on failure
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`CREATE TABLE...`);
  await queryRunner.query(`CREATE INDEX...`);
  // If any query fails, entire migration rolls back
}
```

**3. Test in Development First**:
```bash
# Execute
npm run typeorm -- migration:run

# Revert if problem found
npm run typeorm -- migration:revert

# Fix the migration file
# Execute again
npm run typeorm -- migration:run
```

**4. Use Descriptive Names**:
- ✅ Good: `CreateProductsTable`, `AddActiveToUsers`, `CreateIndexOnQuotesDate`
- ❌ Bad: `Migration1`, `UpdateTable`, `Changes`

**5. One Responsibility Per Migration**:
```typescript
// ❌ Bad - Multiple unrelated changes
export class CreateProductsAndCategoriesAndOrders

// ✅ Good - Focused migrations
export class CreateProductsTable
export class CreateCategoriesTable
export class CreateOrdersTable
```

**6. Handle Existing Data Carefully**:
```typescript
// When adding NOT NULL column to table with existing data:

// Step 1: Add as nullable
await queryRunner.query(`
  ALTER TABLE products ADD COLUMN category_id INT;
`);

// Step 2: Populate data
await queryRunner.query(`
  UPDATE products SET category_id = 1 WHERE category_id IS NULL;
`);

// Step 3: Make NOT NULL
await queryRunner.query(`
  ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;
`);
```

**7. Document Complex Migrations**:
```typescript
/**
 * This migration performs the following operations:
 * 1. Adds status column to products table
 * 2. Migrates data from active boolean field to status enum
 * 3. Removes deprecated active column
 */
export class MigrateProductStatusField implements MigrationInterface {
  // Implementation...
}
```

**8. Use English Naming for Database Objects**:
```sql
-- ❌ DON'T DO
CREATE TABLE produtos (
  id_produto INT PRIMARY KEY,
  nome_produto VARCHAR(255)
);

-- ✅ DO
CREATE TABLE products (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(255)
);
```

**9. NEVER Create Database Functions or Triggers**:
```typescript
// ❌ WRONG - Don't create triggers
await queryRunner.query(`
  CREATE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';
`);

// ✅ CORRECT - Use application logic (TypeORM handles automatically)
@UpdateDateColumn({ type: 'timestamptz' })
updated_at: Date;
```

**Reasons to Avoid Database Logic**:
- Difficult maintenance: Logic scattered between application and database
- Difficult testing: Cannot test in isolation
- Difficult debugging: "Magic" behaviors hard to track
- Tight coupling: Code dependent on specific database
- Poor versioning: Business logic version control difficult
- No portability: Migration to another database difficult

**Allowed Exceptions** (only if absolutely necessary):
- CHECK CONSTRAINT for data validation
- Partial or functional indexes for performance

### Checklist

- [ ] Down method fully reverts up method changes
- [ ] Migration tested in development environment
- [ ] Migration name is descriptive and follows convention
- [ ] Single logical change per migration
- [ ] Existing data handled appropriately
- [ ] Complex operations documented with comments
- [ ] English naming used for all database objects
- [ ] No triggers or functions created in database
- [ ] Transaction handling understood (automatic)
- [ ] Migration committed to version control

### Troubleshooting

**Migration fails midway**: Review error message, fix SQL, and revert before re-running.

**Data loss on down method**: Ensure down method doesn't delete data without backup or confirmation.

**Cannot revert migration**: Check down method is properly implemented and reverses all up changes.

### Best Practices

- Implement comprehensive down methods for all migrations
- Test both up and down methods in development
- Use descriptive migration names indicating changes
- Keep migrations focused on single responsibility
- Preserve existing data when modifying schema
- Document complex multi-step migrations
- Use English for all database object names
- Keep business logic in application, not database
- Commit migrations to version control immediately
- Never edit migrations after deployment to other environments

## [Troubleshooting Common Migration Issues - Error Recovery Procedures]()

Common error scenarios and solutions including migration detection issues, duplicate execution errors, forced re-execution procedures, and database recovery from failed migrations. These patterns help diagnose and resolve migration failures systematically.

### When to use?

Reference these troubleshooting patterns when encountering migration errors during development or deployment. Use appropriate solution based on specific error message or symptom experienced.

### When NOT to use?

Don't apply troubleshooting solutions without understanding root cause. Avoid forced solutions like dropping database in production. Never bypass migration system by modifying database schema directly.

### Example

**Migration Not Being Detected**:
```typescript
// Check database.config.ts
{
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Ensure path matches actual migration file location
}
```

**Error: "Migration has already been executed"**:
```bash
# Check migration status
npm run typeorm -- migration:show

# If necessary, revert specific migration
npm run typeorm -- migration:revert
```

**Force Re-execution (DEVELOPMENT ONLY)**:
```bash
# WARNING: Destroys all data
npm run db:drop
npm run typeorm -- migration:run
```

**Migration Broke Database**:
```bash
# Step 1: Revert failed migration
npm run typeorm -- migration:revert

# Step 2: Fix the migration file SQL
# (edit migration file)

# Step 3: Execute corrected migration
npm run typeorm -- migration:run
```

**Multiple Migrations Failed**:
```bash
# Revert migrations one at a time in reverse order
npm run typeorm -- migration:revert  # Reverts most recent
npm run typeorm -- migration:revert  # Reverts next most recent
# Continue until reaching stable state
```

### Checklist

- [ ] Error message read and understood
- [ ] Migration status checked with show command
- [ ] Root cause identified before applying fix
- [ ] Development environment used for testing fixes
- [ ] Database backup created before destructive operations
- [ ] Migration file reviewed for SQL correctness

### Troubleshooting

**Cannot connect to database**: Verify database is running and connection credentials are correct.

**Permission denied**: Ensure database user has required permissions for schema modifications.

**Syntax errors in SQL**: Test SQL statements in database client before adding to migrations.

### Best Practices

- Always check migration:show before troubleshooting to understand current state
- Test migration fixes in development environment first
- Keep database backups before attempting recovery procedures
- Review migration file SQL syntax before execution
- Use migration:revert rather than manual database modifications
- Document resolution of complex migration issues for team reference

## [Package.json Scripts for Migration Workflow - NPM Command Shortcuts]()

Essential NPM scripts simplifying migration workflow by providing short commands for creation, generation, execution, rollback, and status checking. Verify these scripts exist in package.json for streamlined migration management and consistent team workflow.

### When to use?

Use these NPM scripts for all migration operations throughout development lifecycle. These shortcuts ensure consistent command execution across team members and simplify complex TypeORM CLI invocations.

### When NOT to use?

These scripts should always be used instead of direct TypeORM CLI invocation. There's no scenario where bypassing these scripts is recommended as they ensure correct configuration and paths.

### Example

**Required package.json Scripts**:
```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show"
  }
}
```

**Usage Examples**:
```bash
# Create new migration
npm run migration:create -- src/database/migrations/CreateUsersTable

# Generate from entities
npm run migration:generate -- src/database/migrations/UpdateProductsTable

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Checklist

- [ ] All migration scripts defined in package.json
- [ ] TypeORM base script configured with ts-node
- [ ] tsconfig-paths/register included for path aliases
- [ ] Scripts tested and working in development
- [ ] Team members aware of available scripts
- [ ] CI/CD configured to use same scripts

### Troubleshooting

**Script not found**: Verify package.json includes all required migration scripts in scripts section.

**ts-node not installed**: Install as dev dependency with `npm install -D ts-node tsconfig-paths`.

**Path resolution errors**: Ensure tsconfig-paths/register is included in typeorm base script.

### Best Practices

- Use npm scripts consistently instead of direct CLI invocation
- Include migration scripts in project documentation
- Configure CI/CD to use same npm scripts for consistency
- Test scripts in clean environment during onboarding
- Version control package.json with migration scripts
- Document any custom migration scripts added to package.json

## [Real Project Migration Examples Reference - Production Migration Patterns]()

Reference to actual project migrations demonstrating real-world implementation patterns including genesis schema, performance indexes, calculated fields, and feature tables. Review these examples for practical migration patterns and conventions followed in production codebase.

### When to use?

Reference existing project migrations when implementing similar schema changes, learning migration patterns, understanding project conventions, or troubleshooting issues. These examples show production-tested approaches to common scenarios.

### When NOT to use?

Don't blindly copy existing migrations without understanding context and requirements of your specific change. Avoid using outdated migration patterns if better approaches have been established since.

### Example

**Existing Project Migrations**:

1. **1728000000000-genesis.ts**: Initial schema creation
   - All base tables created
   - Primary keys and indexes established
   - Foreign key relationships defined

2. **1735466400000-add-quote-optimized-index.ts**: Performance optimization
   - Composite index on frequently queried columns
   - Query performance improvement for reports

3. **1738275600000-add-wallet-totals.ts**: Calculated fields
   - Adding denormalized totals columns
   - Updating existing records with calculated values

4. **1738500000000-create-alerts-table.ts**: New feature table
   - Creating alerts functionality
   - Establishing relationships with existing tables

**Pattern Learning from Examples**:
- Table naming conventions (snake_case, plural)
- Index naming patterns (idx_table_columns)
- Foreign key naming (fk_childtable_parenttable)
- Migration file naming and organization
- SQL formatting and structure
- Down method implementation approaches

### Checklist

- [ ] Project migrations directory located
- [ ] Existing migration patterns reviewed
- [ ] Naming conventions understood
- [ ] SQL formatting style noted
- [ ] Down method patterns observed
- [ ] Project-specific conventions identified

### Troubleshooting

**Cannot find migrations**: Check configured migrations directory in database config file.

**Migrations seem outdated**: Verify branch is current and migrations are from active codebase.

**Patterns conflict with documentation**: Follow project-specific patterns over general guidelines for consistency.

### Best Practices

- Review existing migrations before creating new ones
- Follow established project patterns for consistency
- Learn from well-implemented migration examples
- Consult team when uncertain about project conventions
- Document new patterns that deviate from existing examples
- Keep migration examples updated as best practices evolve

## [Official TypeORM Migration Documentation - External Resources]()

Official TypeORM documentation links covering migration concepts, API reference, and advanced patterns. These resources provide comprehensive framework-specific details beyond this guide for in-depth understanding and advanced scenarios.

### When to use?

Reference official documentation when seeking in-depth framework details, exploring advanced migration features not covered here, troubleshooting TypeORM-specific issues, or understanding underlying migration API mechanics.

### When NOT to use?

Don't rely solely on official documentation without understanding project-specific conventions and patterns. Avoid implementing advanced patterns without team discussion and approval.

### Example

**Official Documentation Resources**:

- [TypeORM Migrations](https://typeorm.io/migrations) - Core migration concepts and workflows
- [TypeORM Migration API](https://typeorm.io/migrations#migration-api) - Detailed API reference
- [TypeORM CLI Documentation](https://typeorm.io/using-cli) - Command-line interface guide
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html) - PostgreSQL DDL reference
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html) - Index creation syntax

### Checklist

- [ ] Official documentation links accessible
- [ ] TypeORM version matches documentation version
- [ ] PostgreSQL version compatible with examples
- [ ] Project conventions checked before applying patterns
- [ ] Team consulted for advanced implementations

### Troubleshooting

**Documentation version mismatch**: Verify TypeORM version installed matches documentation being referenced.

**PostgreSQL syntax differences**: Check PostgreSQL version for syntax compatibility with examples.

**Pattern conflicts with project**: Prioritize project-specific conventions over generic documentation patterns.

### Best Practices

- Bookmark official documentation for quick reference
- Verify TypeORM and PostgreSQL versions before following examples
- Cross-reference official docs with project patterns
- Share useful documentation sections with team
- Keep documentation links updated as versions change
- Consult team before implementing advanced patterns from docs
