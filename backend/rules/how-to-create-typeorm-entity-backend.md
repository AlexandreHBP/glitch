# [How to Create TypeORM Entities in NestJS Backend]()

Comprehensive guide for creating TypeORM entities with relationships, soft delete, proper naming conventions, and PostgreSQL column types in NestJS backend applications.

## [TypeORM Entity Fundamentals - Object-Relational Mapping in TypeScript]()

Entities are TypeScript classes providing object-relational mapping between application code and PostgreSQL tables. Each entity class represents a table structure with typed properties mapping to columns, enabling type-safe database operations, automatic query generation, and maintaining strong typing throughout the application stack.

### When to use?

Use TypeORM entities when you need to represent database tables as TypeScript classes with automatic CRUD operations, relationship management, and type safety. Essential for any NestJS backend application using PostgreSQL as the database layer requiring structured data persistence with ORM benefits like query abstraction and migration support.

### When NOT to use?

Avoid creating entities for temporary data structures, API responses that don't map to tables, utility classes without database persistence, or when using raw SQL queries exclusively without ORM benefits. Don't create entities for view models, DTOs, or cached data structures that don't persist.

### Example

Basic entity structure with common column types and SuperEntity inheritance:

```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
```

### Checklist

- [ ] Entity needed for database table persistence
- [ ] Not a temporary data structure or DTO
- [ ] Requires type-safe CRUD operations
- [ ] Will benefit from ORM relationship management
- [ ] Part of domain model requiring migrations

### Troubleshooting

**Issue**: Entity not recognized by TypeORM
**Solution**: Ensure entity is registered in module's TypeOrmModule.forFeature([Entity]) and decorated with @Entity()

**Issue**: Properties not mapping to columns
**Solution**: Add @Column() decorator to all properties that should persist to database

### Best Practices

Always extend SuperEntity, SoftDeletableEntity, or JunctionEntity base classes for consistency. Use explicit column type definitions. Apply decorators correctly (@Entity, @Column). Keep entities focused on data structure, not business logic. Document complex field purposes with comments.

## [Entity File Organization - Modular Architecture Pattern]()

Entity organization follows modular architecture with entities residing within their respective module folders rather than centralized location. Only base entity classes (SuperEntity, SoftDeletableEntity, JunctionEntity) are centralized in database folder, ensuring each module maintains its own domain models for better encapsulation, separation of concerns, and module independence.

### When to use?

Use modular entity organization when building scalable NestJS applications where each business domain (products, users, orders) should maintain its own data models independently from other modules. Appropriate for medium to large applications with multiple bounded contexts requiring clear domain separation.

### When NOT to use?

Avoid this pattern for very small applications with only 1-2 entities where centralized entity folder might be simpler, or when creating shared base entities like SuperEntity that all modules inherit. Don't use for proof-of-concepts or temporary projects without clear domain boundaries.

### Example

Project structure showing modular entity organization:

```
src/
├── database/
│   └── entities/
│       ├── super.entity.ts              # ← Centralized base entity
│       ├── soft-deletable.entity.ts     # ← Centralized base entity
│       └── junction.entity.ts           # ← Centralized base for junction tables
└── modules/
    ├── products/
    │   └── entities/
    │       └── product.entity.ts        # ← Products module entity
    └── categories/
        └── entities/
            └── category.entity.ts       # ← Categories module entity
```

### Checklist

- [ ] SuperEntity exists in database/entities folder
- [ ] SoftDeletableEntity exists in database/entities folder
- [ ] JunctionEntity exists in database/entities folder
- [ ] Each module has its own entities folder
- [ ] Entity files use kebab-case with .entity.ts suffix
- [ ] No business entities in central database/entities folder
- [ ] Module exports entity through barrel file (index.ts)

### Troubleshooting

**Issue**: Import errors when accessing entities across modules
**Solution**: Export entity in module's index.ts and import through module path, not direct file path

**Issue**: Circular dependency between entities
**Solution**: Use string-based relationship references like `() => Product` instead of direct imports

**Issue**: TypeORM can't find entity in different module
**Solution**: Register entity in TypeOrmModule.forFeature in the module where it's needed

### Best Practices

Always keep SuperEntity, SoftDeletableEntity, and JunctionEntity centralized while placing business entities in their respective modules. Use barrel exports (index.ts) to simplify imports. Follow consistent folder structure across all modules. Document cross-module entity dependencies clearly.

## [SuperEntity Base Class - Automatic ID and Timestamps]()

Standard entity implementation pattern using SuperEntity for automatic ID generation and timestamp management. This base class provides consistent behavior across all entities while reducing boilerplate code, ensuring timestamp handling consistency, and maintaining database best practices with timestamptz column types.

### When to use?

Use SuperEntity when creating standard database tables that need automatic ID generation, created_at and updated_at timestamps, without requiring soft delete functionality or complex custom configurations. Ideal for most entities in the application representing persisted business objects.

### When NOT to use?

Don't use SuperEntity when you need soft delete capability (use SoftDeletableEntity instead), when entity requires composite keys for junction tables (use JunctionEntity instead), when entity requires custom primary key strategy like UUID, or when working with legacy databases with non-standard ID patterns requiring manual configuration.

### Example

Entity extending SuperEntity with automatic ID and timestamps:

```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}

// SuperEntity provides:
// - id: number (auto-increment primary key)
// - created_at: Date (timestamptz)
// - updated_at: Date (timestamptz)
```

**SuperEntity Implementation:**
```typescript
export abstract class SuperEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

### Checklist

- [ ] Entity class extends SuperEntity
- [ ] Entity decorator uses snake_case plural table name
- [ ] Class name is PascalCase singular
- [ ] All columns use explicit type definitions
- [ ] Column names follow snake_case convention
- [ ] Proper column constraints (length, precision, default)
- [ ] No manual id, created_at, or updated_at fields

### Troubleshooting

**Issue**: Timestamps not auto-updating
**Solution**: Ensure entity extends SuperEntity and uses @UpdateDateColumn decorator correctly. Verify timestamptz type is used, not timestamp.

**Issue**: Table name mismatch in database
**Solution**: Check @Entity decorator has correct table name in snake_case. Run migrations to sync schema.

**Issue**: ID not auto-incrementing
**Solution**: Verify SuperEntity is extended correctly and no manual @PrimaryColumn overrides base class behavior.

### Best Practices

Always extend SuperEntity for new entities to maintain consistency. Never override id, created_at, or updated_at fields manually. Use explicit column types and constraints for all custom fields. Follow naming conventions strictly: PascalCase for classes, snake_case for tables and columns.

## [SoftDeletableEntity Base Class - Recoverable Deletion Pattern]()

Entity base class for soft delete implementation extending SuperEntity with additional deleted_at timestamp. Provides recoverable deletion capability where records are marked as deleted rather than permanently removed, enabling audit trails, data recovery, and compliance requirements.

### When to use?

Use SoftDeletableEntity when you need to keep history of deleted records, when deletion should be reversible, for auditing and compliance requirements, or when business rules require tracking what was deleted and when. Common for user data, financial records, and important business entities.

### When NOT to use?

Don't use soft delete for truly temporary data that should be purged, for performance-critical tables where deleted records cause overhead, when storage constraints require hard deletes, or for data without business value after deletion like session tokens or cache entries.

### Example

Entity with soft delete capability:

```typescript
import { Entity, Column } from 'typeorm';
import { SoftDeletableEntity } from '@database/entities/soft-deletable.entity';

@Entity('products')
export class Product extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}

// SoftDeletableEntity provides:
// - All SuperEntity fields (id, created_at, updated_at)
// - deleted_at: Date (timestamptz, nullable)
```

**Service implementation with soft delete:**
```typescript
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  async softDelete(id: number) {
    return await this.repository.softDelete(id);
  }

  async restore(id: number) {
    return await this.repository.restore(id);
  }

  async findAll() {
    // Automatically excludes deleted records
    return await this.repository.find();
  }

  async findAllWithDeleted() {
    return await this.repository.find({ withDeleted: true });
  }
}
```

### Checklist

- [ ] Entity extends SoftDeletableEntity instead of SuperEntity
- [ ] No manual deleted_at field added
- [ ] Service uses softDelete() instead of delete()
- [ ] Service uses restore() for recovery operations
- [ ] Queries consider withDeleted: true when needed
- [ ] Frontend handles soft-deleted state appropriately

### Troubleshooting

**Issue**: Deleted records still appearing in queries
**Solution**: Ensure entity extends SoftDeletableEntity and using TypeORM repository methods, not raw queries that bypass soft delete.

**Issue**: Can't find deleted records
**Solution**: Add `withDeleted: true` option to find queries or use query builder with `.withDeleted()` method.

**Issue**: Hard delete happening instead of soft delete
**Solution**: Use `softDelete()` or `softRemove()` methods, not `delete()` or `remove()`.

### Best Practices

Always use TypeORM's native softDelete() and restore() methods. Never manually set deleted_at timestamps. Document which entities use soft delete and why. Implement cleanup jobs for truly removing old soft-deleted records if needed. Consider index on deleted_at for query performance.

## [JunctionEntity Base Class - Composite Key Junction Tables with Timestamps]()

Base class for explicit junction entities requiring composite primary keys with automatic timestamp management. Unlike SuperEntity which provides auto-generated ID, JunctionEntity provides only created_at and updated_at fields, allowing composite primary keys to be defined by the implementing entity.

### When to use?

Use JunctionEntity as base class for many-to-many junction tables that need timestamp tracking but use composite primary keys from foreign key pairs. Ideal when you need to track when associations were created or modified, while maintaining the standard pattern of composite keys in junction tables.

### When NOT to use?

Don't use JunctionEntity when using TypeORM's automatic @ManyToMany with @JoinTable (no explicit entity needed). Avoid when junction table doesn't need timestamps - use plain entity with @PrimaryColumn only. Skip if you need soft delete on relationships (rare case - consider architecture if deleting relationships needs audit).

### Example

**JunctionEntity Implementation:**
```typescript
// File: src/database/entities/junction.entity.ts
import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class JunctionEntity extends BaseEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

**Usage in Junction Entity:**
```typescript
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { JunctionEntity } from '@database/entities/junction.entity';
import { Product } from '@/modules/products/entities/product.entity';
import { Category } from '@/modules/categories/entities/category.entity';

@Entity('product_categories')
export class ProductCategory extends JunctionEntity {
  // Composite Primary Key - Part 1
  @PrimaryColumn({ type: 'int' })
  product_id: number;

  // Composite Primary Key - Part 2
  @PrimaryColumn({ type: 'int' })
  category_id: number;

  // Relationships
  @ManyToOne(() => Product, product => product.productCategories)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Category, category => category.productCategories)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // Additional business fields
  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'boolean', default: true })
  is_primary: boolean;

  // JunctionEntity provides:
  // - created_at: Date (timestamptz)
  // - updated_at: Date (timestamptz)
}
```

### Checklist

- [ ] JunctionEntity.ts created in database/entities folder
- [ ] JunctionEntity extends BaseEntity (not SuperEntity)
- [ ] Only @CreateDateColumn and @UpdateDateColumn defined
- [ ] Abstract class to prevent direct instantiation
- [ ] Exported for use by junction entities
- [ ] No @PrimaryGeneratedColumn (left for implementing classes)

### Troubleshooting

**Issue**: TypeORM error "Entity must have primary key"
**Solution**: JunctionEntity intentionally has no PK. Implementing entity must define @PrimaryColumn fields for composite key.

**Issue**: Timestamps not auto-updating
**Solution**: Ensure entity extends JunctionEntity and columns are timestamptz type. Verify TypeORM entity is registered in module.

**Issue**: Should JunctionEntity have id field?
**Solution**: No. JunctionEntity is specifically for composite key tables. Use SuperEntity if you need generated ID.

### Best Practices

Always extend JunctionEntity for many-to-many junction tables needing timestamps. Never add id field to junction entities - defeats purpose of composite key pattern. Use JunctionEntity for consistency even if updated_at seems unnecessary (disk space is cheap, consistency is valuable). Keep JunctionEntity in database/entities folder alongside SuperEntity and SoftDeletableEntity for discoverability.

## [PostgreSQL Column Types - Text Fields for String Data]()

Text column types for storing string data including varchar for short strings with length limits and text for long content without constraints. Proper type selection ensures data validation at database level, optimizes storage and performance, and maintains consistency between application and database.

### When to use?

Use varchar with explicit length for fields requiring validation like names, codes, emails, and identifiers where maximum length is known. Use text for long content like descriptions, notes, comments, or any string data without predictable length limit.

### When NOT to use?

Avoid varchar without length specification as it defaults to unlimited. Don't use text for short strings where varchar with limit provides better validation. Never use char(n) in modern applications as varchar is more flexible and efficient.

### Example

```typescript
// Short string with validation
@Column({ type: 'varchar', length: 255 })
name: string;

// Email with appropriate length
@Column({ type: 'varchar', length: 100 })
email: string;

// Long text without limit
@Column({ type: 'text', nullable: true })
description: string;

// Product code with strict length
@Column({ type: 'varchar', length: 50 })
code: string;
```

### Checklist

- [ ] varchar used with explicit length parameter
- [ ] text used for long content fields
- [ ] Length limits match business requirements
- [ ] nullable: true set for optional text fields
- [ ] No char(n) types used
- [ ] Consistent string type usage across entities

### Troubleshooting

**Issue**: String truncation errors
**Solution**: Increase varchar length or change to text type if no limit needed. Ensure DTO validation matches column length.

**Issue**: Performance issues with text columns
**Solution**: Consider varchar with reasonable limit for frequently queried fields. Add indexes carefully on text columns.

### Best Practices

Always specify explicit length for varchar columns matching business rules. Use text for truly variable-length content like descriptions. Ensure DTO validation length matches database column length. Prefer varchar for indexed fields to improve performance.

## [PostgreSQL Column Types - Numeric Fields for Numbers]()

Numeric column types including int for whole numbers, decimal for precise monetary values with fixed precision and scale, and float for scientific calculations. Each type serves specific use cases balancing precision, storage, and performance requirements.

### When to use?

Use int for whole numbers like quantities, counts, IDs. Use decimal for monetary values, percentages, or any calculation requiring exact precision without floating-point errors. Use float for scientific measurements, calculations where approximation is acceptable, or when storage efficiency is critical.

### When NOT to use?

Never use float or double for monetary values due to floating-point precision issues. Don't use decimal for simple counters where int suffices. Avoid int for values that may exceed 2,147,483,647 (use bigint instead).

### Example

```typescript
// Integer for quantities
@Column({ type: 'int' })
quantity: number;

// Decimal for monetary values (10 total digits, 2 after decimal)
@Column({ type: 'decimal', precision: 10, scale: 2 })
price: number;

// Float for percentage calculations
@Column({ type: 'float' })
percentage: number;

// Default value for counters
@Column({ type: 'int', default: 0 })
viewCount: number;

// Large integers
@Column({ type: 'bigint' })
largeNumber: string; // Note: bigint maps to string in TypeScript
```

### Checklist

- [ ] int used for whole numbers and counters
- [ ] decimal with precision and scale for monetary values
- [ ] Never float/double for money calculations
- [ ] Default values set where appropriate
- [ ] bigint used for numbers exceeding int range
- [ ] TypeScript type matches column type (bigint → string)

### Troubleshooting

**Issue**: Precision loss with decimal calculations
**Solution**: Ensure precision and scale are sufficient. Use libraries like decimal.js for complex calculations before storing.

**Issue**: Float precision errors in monetary calculations
**Solution**: Change to decimal type immediately. Migrate existing data carefully with rounding strategy.

**Issue**: Integer overflow errors
**Solution**: Change to bigint type. Note that TypeScript type must be string for bigint columns.

### Best Practices

Always use decimal for monetary values with explicit precision and scale. Use int for counters, quantities, and foreign keys. Reserve float for scientific or approximate calculations only. Set appropriate default values for numeric fields. Document precision requirements in comments.

## [PostgreSQL Column Types - Boolean, Date/Time, and JSON Fields]()

Additional column types including boolean for true/false flags, timestamptz for timezone-aware dates, date for calendar dates, and jsonb for flexible structured data. These types handle specific data patterns beyond text and numbers.

### When to use?

Use boolean for flags and toggles like active/inactive, published/draft states. Use timestamptz for all datetime fields requiring timezone awareness (timestamps, login times, expiration dates). Use date for calendar dates without time component (birthdays, deadlines). Use jsonb for semi-structured metadata, configurations, or flexible attributes.

### When NOT to use?

Don't use boolean when you need more than two states (use enum instead). Never use timestamp without timezone - always use timestamptz. Don't use date when time of day matters. Avoid jsonb for data that should be properly structured in relational columns or when frequent querying of JSON properties is needed.

### Example

```typescript
// Boolean flags
@Column({ type: 'boolean', default: true })
active: boolean;

@Column({ type: 'boolean', default: false })
isPublished: boolean;

// Timestamp with timezone
@Column({ type: 'timestamptz', nullable: true })
lastLoginAt: Date;

@Column({ type: 'timestamptz', nullable: true })
expiresAt: Date;

// Date only (no time component)
@Column({ type: 'date', nullable: true })
birthDate: Date;

// JSON for flexible data
@Column({ type: 'jsonb', nullable: true })
metadata: Record<string, any>;

@Column({ type: 'jsonb', nullable: true })
settings: {
  theme: string;
  notifications: boolean;
  language: string;
};
```

### Checklist

- [ ] boolean used for two-state flags with defaults
- [ ] timestamptz used for all datetime fields
- [ ] Never timestamp without timezone
- [ ] date used only for calendar dates without time
- [ ] jsonb preferred over json for performance
- [ ] JSON fields properly typed in TypeScript
- [ ] nullable: true set for optional fields

### Troubleshooting

**Issue**: Timezone conversion problems
**Solution**: Always use timestamptz. Ensure application and database timezones are configured correctly.

**Issue**: Can't query JSON field properties efficiently
**Solution**: Consider extracting frequently queried JSON properties to dedicated columns with indexes.

**Issue**: Boolean null vs false confusion
**Solution**: Set explicit default value and avoid nullable unless truly needed for tri-state logic.

### Best Practices

Always use timestamptz instead of timestamp for timezone support. Set meaningful defaults for boolean fields. Use jsonb over json for better indexing and performance. Type JSON columns properly in TypeScript for IDE support. Document JSON schema in comments when structure is important.

## [Entity Relationships - Many-to-One Foreign Key Pattern]()

Many-to-one relationship implementation where multiple child records belong to one parent record. Uses @ManyToOne decorator with explicit foreign key column and separate ID field for efficient querying. Common pattern for hierarchical data like products belonging to users or orders belonging to customers.

### When to use?

Use many-to-one when multiple records of entity A reference single record of entity B (many products → one user, many orders → one customer). Required when foreign key relationship exists in database schema and you need object navigation from child to parent with type safety.

### When NOT to use?

Don't create many-to-one for temporary associations without database foreign keys. Avoid when relationship is truly one-to-one or many-to-many. Skip if you only need ID reference without object navigation (though separate ID field is still recommended).

### Example

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Relationship - object navigation
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Separate FK column - efficient queries
  @Column({ type: 'int', name: 'user_id' })
  userId: number;
}

// Query with join
const products = await repository.find({
  relations: ['user']
});

// Query without join (using userId)
const products = await repository.find({
  where: { userId: 123 }
});
```

### Checklist

- [ ] @ManyToOne decorator on child entity
- [ ] @JoinColumn with explicit name in snake_case
- [ ] Separate ID field added (userId alongside user)
- [ ] Lazy loading strategy (default) or eager specified
- [ ] Foreign key column name ends with _id suffix
- [ ] Relationship type parameter uses arrow function
- [ ] Optional vs required relationship specified correctly

### Troubleshooting

**Issue**: Circular dependency errors between entities
**Solution**: Use lazy imports with arrow functions `() => Product` in relationship decorators.

**Issue**: Foreign key not created in database
**Solution**: Ensure @JoinColumn is on ManyToOne side and migrations are run. Check TypeORM synchronize settings.

**Issue**: Related data not loading
**Solution**: Add `relations: ['user']` in find options or use query builder with leftJoinAndSelect.

**Issue**: N+1 query problem
**Solution**: Use eager loading or join in query for bulk operations instead of lazy loading.

### Best Practices

Always add explicit column name in @JoinColumn using snake_case. Include separate ID field (userId) for queries without joins. Use lazy loading by default, eager only when always needed. Document relationship purpose with comments. Consider nullable: true for optional relationships.

## [Entity Relationships - One-to-Many Collection Pattern]()

One-to-many relationship implementation on parent entity defining collection of child records. Inverse side of many-to-one relationship enabling bidirectional navigation. Uses @OneToMany decorator with reference to child entity and its relationship property.

### When to use?

Use one-to-many on parent entity when you need to access collection of children from parent (user accessing their products, customer accessing their orders). Required for bidirectional navigation when both parent and child need to reference each other in application code.

### When NOT to use?

Don't create one-to-many if you never need to navigate from parent to children (unidirectional many-to-one is sufficient). Avoid when collection will be very large causing performance issues. Skip if children are queried independently without parent context.

### Example

```typescript
import { Entity, Column, OneToMany } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { Product } from '@/modules/products/entities/product.entity';

@Entity('users')
export class User extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  // Collection of child records
  @OneToMany(() => Product, product => product.user)
  products: Product[];
}

// Query with products loaded
const user = await repository.findOne({
  where: { id: 1 },
  relations: ['products']
});

console.log(user.products); // Array of Product entities
```

### Checklist

- [ ] @OneToMany decorator on parent entity
- [ ] First parameter: child entity type with arrow function
- [ ] Second parameter: inverse side reference
- [ ] Property type is array (Product[])
- [ ] Corresponding @ManyToOne exists on child entity
- [ ] Cascade options configured if needed
- [ ] Lazy loading strategy considered

### Troubleshooting

**Issue**: Products array is undefined
**Solution**: Add `relations: ['products']` to find options or configure eager loading with `eager: true`.

**Issue**: Circular reference in JSON serialization
**Solution**: Use class-transformer @Exclude on one side or configure serialization groups.

**Issue**: Memory issues loading large collections
**Solution**: Use pagination with query builder or avoid loading relationship, query children separately.

### Best Practices

Only create bidirectional relationships when both navigation directions are needed. Use lazy loading by default for collections. Implement pagination for large collections. Consider cascade options carefully (usually avoid cascade delete). Document expected collection size in comments.

## [Entity Relationships - Many-to-Many Junction Table Pattern]()

Many-to-many relationship implementation using junction table where entities A and B can have multiple associations with each other. Uses @ManyToMany decorator with @JoinTable defining intermediate table structure. Common for products-categories, users-roles, posts-tags patterns.

### When to use?

Use many-to-many when entities have bidirectional multiple associations (products can have multiple categories, categories can have multiple products). Required when junction table exists or needs to be created for M:N relationship in database schema.

### When NOT to use?

Don't use when relationship needs additional attributes (use explicit junction entity instead). Avoid when relationship is actually one-to-many from both sides. Skip if junction table requires custom logic or constraints beyond simple association.

### Example

```typescript
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { Category } from '@/modules/categories/entities/category.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'product_categories',           // Junction table name
    joinColumn: { name: 'product_id' },   // This entity's FK
    inverseJoinColumn: { name: 'category_id' } // Other entity's FK
  })
  categories: Category[];
}

// Inverse side (no @JoinTable)
@Entity('categories')
export class Category extends SuperEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToMany(() => Product, product => product.categories)
  products: Product[];
}

// Query with categories
const product = await repository.findOne({
  where: { id: 1 },
  relations: ['categories']
});
```

### Checklist

- [ ] @ManyToMany on both entities
- [ ] @JoinTable only on owner side (one entity)
- [ ] Junction table name in snake_case
- [ ] Both FK columns explicitly named
- [ ] Array type for relationship property
- [ ] Inverse side references owner's relationship
- [ ] Cascade options considered

### Troubleshooting

**Issue**: Junction table not created
**Solution**: Ensure @JoinTable is present on owner side and migrations are generated/run.

**Issue**: Duplicate entries in junction table
**Solution**: Add unique composite index on junction table (product_id, category_id).

**Issue**: Can't add attributes to relationship
**Solution**: Convert to explicit junction entity inheriting from JunctionEntity with its own fields.

### Best Practices

Always define explicit junction table name and column names in @JoinTable. Choose owner side logically (usually entity more frequently accessed first). Consider creating explicit junction entity if you'll need additional fields later. Use cascade insert/update carefully, avoid cascade remove. Index foreign keys in junction table.

## [Entity Relationships - Explicit Junction Entity Pattern with JunctionEntity]()

Explicit junction entity implementation for many-to-many relationships requiring additional fields, business logic, or timestamp tracking. Extends JunctionEntity base class for automatic timestamp management while using composite primary keys from foreign key pairs instead of generated ID.

### When to use?

Use explicit junction entity when relationship needs additional attributes (priority, status, metadata), when you need created_at/updated_at for the association, when business logic requires operating on the relationship as first-class entity, when you need custom queries or indexes on the junction table, or when relationship data has business meaning beyond simple linking.

### When NOT to use?

Don't use when simple @ManyToMany with @JoinTable suffices without extra fields. Avoid when junction table will never need additional attributes or queries - adds unnecessary complexity. Skip when performance is critical and you want minimal junction table overhead. Don't use for pure linking tables without business meaning or audit requirements.

### Example

```typescript
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { JunctionEntity } from '@database/entities/junction.entity';
import { Product } from '@/modules/products/entities/product.entity';
import { Category } from '@/modules/categories/entities/category.entity';

@Entity('product_categories')
@Index(['category_id', 'display_order']) // For sorting products within category
export class ProductCategory extends JunctionEntity {
  @PrimaryColumn({ type: 'int' })
  product_id: number;

  @PrimaryColumn({ type: 'int' })
  category_id: number;

  @ManyToOne(() => Product, product => product.productCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Category, category => category.productCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // Business fields specific to the relationship
  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  // Inherited from JunctionEntity:
  // - created_at: Date
  // - updated_at: Date
}

// Parent entities with inverse relationships
@Entity('products')
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => ProductCategory, pc => pc.product)
  productCategories: ProductCategory[];
}

@Entity('categories')
export class Category extends SuperEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => ProductCategory, pc => pc.category)
  productCategories: ProductCategory[];
}

// Service with junction entity operations
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private junctionRepo: Repository<ProductCategory>,
  ) {}

  async addProductToCategory(
    productId: number,
    categoryId: number,
    options: { displayOrder?: number; isFeatured?: boolean } = {},
  ) {
    const junction = this.junctionRepo.create({
      product_id: productId,
      category_id: categoryId,
      display_order: options.displayOrder ?? 0,
      is_featured: options.isFeatured ?? false,
    });

    return await this.junctionRepo.save(junction);
  }

  async updateCategoryOrder(
    productId: number,
    categoryId: number,
    newOrder: number,
  ) {
    await this.junctionRepo.update(
      { product_id: productId, category_id: categoryId },
      { display_order: newOrder },
    );
  }

  async getProductWithCategories(productId: number) {
    return await this.productRepo.findOne({
      where: { id: productId },
      relations: ['productCategories', 'productCategories.category'],
      order: {
        productCategories: { display_order: 'ASC' },
      },
    });
  }

  async getFeaturedProductsInCategory(categoryId: number) {
    return await this.junctionRepo.find({
      where: { category_id: categoryId, is_featured: true },
      relations: ['product'],
      order: { display_order: 'ASC' },
    });
  }
}
```

### Checklist

- [ ] Junction entity extends JunctionEntity (not SuperEntity)
- [ ] Both foreign keys marked with @PrimaryColumn
- [ ] Both @ManyToOne relationships with @JoinColumn
- [ ] Cascade options defined (usually CASCADE on delete)
- [ ] @OneToMany inverse relationships on parent entities
- [ ] Entity name combines both table names in snake_case
- [ ] Additional fields represent relationship properties
- [ ] Indexes added for common query patterns
- [ ] No manual created_at/updated_at (inherited from JunctionEntity)

### Troubleshooting

**Issue**: Error "Entity must have at least one primary key"
**Solution**: Ensure both FK columns have @PrimaryColumn decorator, not @Column.

**Issue**: Duplicate key violations on insert
**Solution**: Composite PK prevents duplicates automatically. Check if attempting to insert same pair twice without checking existence.

**Issue**: updated_at not changing when updating display_order
**Solution**: Ensure using repository.update() or repository.save() methods, not raw queries. TypeORM only updates timestamp on ORM operations.

**Issue**: Can't find junction records efficiently
**Solution**: Add index on foreign keys individually for single-parent queries. Add composite index on reverse order (category_id, product_id) if querying both directions.

**Issue**: Should I add separate id field?
**Solution**: No. Only add id if other tables need to reference the junction record itself (very rare). Composite PK is the standard pattern.

### Best Practices

Always extend JunctionEntity for timestamp-aware junction tables - maintains consistency with SuperEntity pattern. Define both @PrimaryColumn fields explicitly for composite key. Use cascade DELETE on both relationships so removing parent entity cleans up associations. Add indexes on foreign keys for query performance in tables with >1000 records. Keep additional fields focused on relationship properties, never parent entity data. Use meaningful column names for business fields (display_order, not just "order"). Consider unique constraints beyond composite PK if business rules require (e.g., only one "primary" category per product).

### Migration Example

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductCategoriesTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE product_categories (
        product_id INT NOT NULL,
        category_id INT NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        PRIMARY KEY (product_id, category_id),

        CONSTRAINT fk_product_categories_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        CONSTRAINT fk_product_categories_category
          FOREIGN KEY (category_id)
          REFERENCES categories(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
    `);

    // Index for reverse queries (finding products by category)
    await queryRunner.query(`
      CREATE INDEX idx_product_categories_category_id
      ON product_categories(category_id);
    `);

    // Composite index for ordered queries within category
    await queryRunner.query(`
      CREATE INDEX idx_product_categories_category_display
      ON product_categories(category_id, display_order);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE product_categories;`);
  }
}
```

**Important**: The `updated_at` column is automatically managed by TypeORM through the `@UpdateDateColumn` decorator. No database triggers or functions are needed - TypeORM handles timestamp updates in the application layer when using `repository.save()` or `repository.update()` methods.

## [Advanced Entity Features - Database Indexes for Performance]()

Index creation on entity columns using @Index decorator to optimize query performance for frequently searched, joined, or ordered columns. Supports simple single-column indexes and composite multi-column indexes for complex query patterns.

### When to use?

Create indexes on columns used in WHERE clauses, JOIN conditions, ORDER BY statements, or foreign keys for better query performance. Essential for large tables (>1000 rows) with frequent queries. Use composite indexes when queries filter on multiple columns together.

### When NOT to use?

Avoid indexing small tables (< 1000 rows) where full scan is fast. Don't over-index - each index costs storage and slows INSERT/UPDATE. Skip indexing columns with low cardinality (mostly same values like boolean). Don't index large text fields unless using specific text search indexes.

### Example

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('products')
@Index(['userId', 'active']) // Composite index for common query
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index() // Single-column index on name
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @Index() // Index on frequently searched code
  code: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  @Index() // Index on foreign key
  userId: number;
}
```

### Checklist

- [ ] Indexes on foreign key columns
- [ ] Indexes on frequently searched columns
- [ ] Composite indexes for multi-column queries
- [ ] Index naming follows convention (auto or explicit)
- [ ] No redundant indexes (subset of composite)
- [ ] Index cardinality considered
- [ ] Unique indexes used where appropriate

### Troubleshooting

**Issue**: Slow queries despite indexes
**Solution**: Verify index is actually being used with EXPLAIN ANALYZE. Check index selectivity and query patterns.

**Issue**: Slow INSERT/UPDATE performance
**Solution**: Too many indexes. Remove unused indexes identified through query analysis.

**Issue**: Index not created in database
**Solution**: Run migrations to sync schema. Check TypeORM synchronize configuration.

### Best Practices

Always index foreign keys for join performance. Create composite indexes matching common query patterns. Monitor index usage and remove unused indexes. Use unique indexes for data integrity constraints. Consider partial indexes for conditional queries. Document index purpose in comments.

## [Advanced Entity Features - Unique Constraints for Data Integrity]()

Unique constraint implementation using unique option in @Column or @Index decorator to enforce data integrity at database level. Prevents duplicate values in single columns or combinations of columns ensuring business rule compliance and data quality.

### When to use?

Use unique constraints for fields that must be unique across all records like email addresses, usernames, product codes, or SKUs. Apply composite unique constraints for combinations that must be unique together like (user_id, product_code) preventing duplicate products per user.

### When NOT to use?

Don't use unique when duplicates are valid in business logic. Avoid on columns with frequent updates if uniqueness isn't critical (use validation instead). Skip when soft delete is used without excluding deleted records from uniqueness check.

### Example

```typescript
import { Entity, Column, Index } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';

@Entity('products')
@Index(['code', 'userId'], { unique: true }) // Composite unique constraint
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  code: string; // Must be unique per user

  @Column({ type: 'int', name: 'user_id' })
  userId: number;
}

@Entity('users')
export class User extends SuperEntity {
  @Column({ type: 'varchar', length: 100, unique: true }) // Simple unique
  email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;
}
```

### Checklist

- [ ] Unique constraint on email addresses
- [ ] Unique constraint on usernames
- [ ] Unique constraint on business identifiers (codes, SKUs)
- [ ] Composite unique for multi-column uniqueness
- [ ] Error handling for unique violations in service
- [ ] User-friendly error messages for duplicates
- [ ] Soft delete compatibility considered

### Troubleshooting

**Issue**: Unique constraint violation errors
**Solution**: Handle in service with try-catch, provide clear user feedback about which field has duplicate.

**Issue**: Soft deleted records causing unique violations
**Solution**: Use partial unique index excluding deleted records or include deleted_at in composite unique.

**Issue**: Case sensitivity issues with unique constraint
**Solution**: Use LOWER() in partial index or validate case-insensitively before insert.

### Best Practices

Always enforce uniqueness at database level, not just application level. Provide clear error handling and user feedback for violations. Consider case-sensitivity requirements. Handle soft delete scenarios appropriately. Use composite unique constraints for complex business rules. Document uniqueness requirements in comments.

## [Advanced Entity Features - Default Values and Nullable Fields]()

Column configuration for default values using default option and optional fields using nullable option. Default values initialize columns on INSERT when not provided while nullable allows NULL values for truly optional data.

### When to use?

Use default values for flags (active: true), counters (viewCount: 0), status fields (status: 'pending'), or any field with sensible initial value. Use nullable: true for truly optional fields where absence of value is meaningful different from empty or zero.

### When NOT to use?

Don't use defaults when initial value should be explicitly provided. Avoid nullable when empty string or zero can represent absence. Skip default for fields that must be user-provided. Don't use nullable: false and default together unless intention is clear.

### Example

```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';

@Entity('products')
export class Product extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Default boolean
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  // Default numeric
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  // Default string
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  // Nullable fields
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date;
}
```

### Checklist

- [ ] Defaults set for boolean flags
- [ ] Defaults set for counters at zero
- [ ] Defaults set for status fields
- [ ] nullable: true only for truly optional fields
- [ ] TypeScript optional (?) matches nullable columns
- [ ] Defaults don't conflict with required validation
- [ ] Meaningful defaults chosen, not arbitrary values

### Troubleshooting

**Issue**: Default value not applied on insert
**Solution**: Ensure database migration includes default. Don't explicitly pass undefined, let TypeORM handle it.

**Issue**: Nullable field causing null pointer errors
**Solution**: Add null checks in code or provide default in TypeScript with ?? operator.

**Issue**: Required field showing as nullable in database
**Solution**: Remove nullable: true and ensure migration updates column to NOT NULL.

### Best Practices

Set meaningful defaults at database level for consistency across all insert methods. Use nullable sparingly only when NULL has semantic meaning. Match TypeScript optional properties (?) with nullable columns. Document why fields are nullable with comments. Consider enum defaults for status fields.

## [Advanced Entity Features - Enum Types for Controlled Values]()

Enum column type implementation using TypeScript enums mapped to PostgreSQL enum types or varchar columns. Provides type safety and controlled vocabulary for fields with fixed set of valid values like status, role, or priority.

### When to use?

Use enums for fields with fixed set of values that rarely change like user roles (admin, user, guest), order status (pending, processing, completed), priority levels (low, medium, high). Essential when type safety and validation are important and value set is stable.

### When NOT to use?

Avoid enums for frequently changing value sets (use lookup table instead). Don't use when values are user-configurable or dynamic. Skip when only 2 values exist (use boolean). Avoid for values requiring localization without additional mapping.

### Example

```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';

// Define enum
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('users')
export class User extends SuperEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;
}

@Entity('orders')
export class Order extends SuperEntity {
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;
}

// Usage with type safety
const user = new User();
user.role = UserRole.ADMIN; // TypeScript validates
```

### Checklist

- [ ] Enum defined with explicit string values
- [ ] Enum exported for use in DTOs and services
- [ ] Column type set to 'enum' with enum parameter
- [ ] Default value set using enum value
- [ ] Enum values in snake_case or kebab-case
- [ ] DTO validation uses enum values
- [ ] Documentation explains each enum value

### Troubleshooting

**Issue**: Enum values not validated in database
**Solution**: Ensure PostgreSQL enum type is created via migration or use varchar with check constraint.

**Issue**: Can't add new enum values without migration
**Solution**: Consider using varchar with validation if values change frequently, or plan for enum migrations.

**Issue**: Enum serialization issues in API
**Solution**: Ensure class-transformer handles enums correctly, use @IsEnum() in DTOs for validation.

### Best Practices

Always use string enums with explicit values for database compatibility. Export enums for reuse in DTOs, services, and frontend. Set appropriate defaults for enum columns. Document enum value meanings. Consider varchar with validation for frequently changing value sets. Plan migration strategy for adding enum values.

## [Advanced Entity Features - Sensitive Data Exclusion Pattern]()

Implementation of @Exclude decorator from class-transformer to prevent sensitive fields from being serialized in API responses. Protects passwords, tokens, secrets, and other sensitive data from accidental exposure while maintaining database storage.

### When to use?

Always use @Exclude on password fields, authentication tokens, API keys, secrets, internal metadata, or any field that should never be exposed in API responses. Critical for security compliance and protecting user data from accidental leakage.

### When NOT to use?

Don't use on fields that should be visible in responses. Avoid when you need conditional exclusion (use groups instead). Skip if field isn't stored in database at all (DTO-only fields). Don't rely solely on this for security - also implement proper authorization.

### Example

```typescript
import { Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SuperEntity } from '@database/entities/super.entity';

@Entity('users')
export class User extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  @Exclude() // Never return in API responses
  passwordHash: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'refresh_token' })
  @Exclude() // Never expose tokens
  refreshToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'reset_token' })
  @Exclude()
  resetToken: string;

  @Column({ type: 'jsonb', nullable: true })
  @Exclude() // Internal metadata not for clients
  internalMetadata: Record<string, any>;
}

// In controller, use ClassSerializerInterceptor
@UseInterceptors(ClassSerializerInterceptor)
@Get()
async findAll() {
  return await this.service.findAll(); // passwordHash excluded automatically
}
```

### Checklist

- [ ] @Exclude on password fields
- [ ] @Exclude on token fields (refresh, reset, API)
- [ ] @Exclude on internal metadata
- [ ] ClassSerializerInterceptor enabled globally or per route
- [ ] Import Exclude from class-transformer
- [ ] Sensitive fields never logged
- [ ] Password hashing before storage

### Troubleshooting

**Issue**: Sensitive data still appearing in responses
**Solution**: Ensure ClassSerializerInterceptor is applied and class-transformer is configured correctly in NestJS.

**Issue**: Need conditional exclusion based on user role
**Solution**: Use @Exclude with groups and specify groups in SerializeOptions.

**Issue**: Excluded fields needed in certain contexts
**Solution**: Use transformation groups or create separate DTO for different serialization contexts.

### Best Practices

Always exclude passwords, tokens, and secrets from serialization. Apply ClassSerializerInterceptor globally for consistent behavior. Never log excluded fields. Use proper password hashing before storage. Consider groups for conditional exclusion. Audit code regularly for sensitive data exposure. Document security-critical fields.

## [Advanced Entity Features - Soft Delete Implementation]()

Soft delete functionality using SoftDeletableEntity base class with TypeORM's native soft delete methods. Marks records as deleted with timestamp rather than permanent removal enabling recovery, audit trails, and compliance with data retention policies.

### When to use?

Use soft delete for user data requiring recovery option, financial records needing audit trails, entities with legal retention requirements, or any data where accidental deletion should be reversible. Common for critical business entities and user-generated content.

### When NOT to use?

Don't use for truly temporary data that should be purged, performance-critical tables where deleted records cause overhead, when storage constraints require hard deletes, or data without business value after deletion like sessions or cache.

### Example

```typescript
import { Entity, Column } from 'typeorm';
import { SoftDeletableEntity } from '@database/entities/soft-deletable.entity';

@Entity('products')
export class Product extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}

// Service implementation
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  async softDelete(id: number) {
    return await this.repository.softDelete(id);
  }

  async restore(id: number) {
    return await this.repository.restore(id);
  }

  async findAll() {
    return await this.repository.find(); // Excludes deleted
  }

  async findAllWithDeleted() {
    return await this.repository.find({ withDeleted: true });
  }

  async findOnlyDeleted() {
    return await this.repository
      .createQueryBuilder('product')
      .withDeleted()
      .where('product.deleted_at IS NOT NULL')
      .getMany();
  }
}
```

### Checklist

- [ ] Entity extends SoftDeletableEntity
- [ ] Service uses softDelete() not delete()
- [ ] Service has restore() method
- [ ] Queries consider deleted state appropriately
- [ ] withDeleted: true used when needed
- [ ] No manual deleted_at manipulation
- [ ] Cleanup job planned for old deleted records

### Troubleshooting

**Issue**: Deleted records still appearing
**Solution**: Verify entity extends SoftDeletableEntity and using repository methods not raw queries.

**Issue**: Can't find deleted records to restore
**Solution**: Use `withDeleted: true` in find options or query builder's `.withDeleted()` method.

**Issue**: Unique constraints violated by soft-deleted records
**Solution**: Include deleted_at in composite unique constraints or use partial indexes.

### Best Practices

Use TypeORM's native softDelete() and restore() methods exclusively. Never manually set deleted_at. Plan cleanup strategy for old deleted records. Include deleted_at in unique constraints when needed. Document recovery process. Monitor deleted records growth. Consider archiving very old soft-deleted data.

## [Entity Naming Conventions - Project-Wide Standards]()

Standardized naming conventions ensuring consistency across codebase with PascalCase for entity classes, snake_case for database tables and columns, English naming for international compatibility, and proper singular/plural usage following TypeScript and PostgreSQL best practices.

### When to use?

Always follow these naming conventions for every entity, table, column, and file in the project to maintain consistency, improve readability, enable international collaboration, and align with TypeScript/PostgreSQL community standards. Apply from project inception through all development phases.

### When NOT to use?

Never deviate from these conventions. These are mandatory project standards. Do not use Portuguese names, camelCase for tables/columns, or inconsistent casing patterns. Only exception: legacy database integration where mapping is required via @Column({ name }).

### Example

Naming convention reference table and complete example:

| Element | Convention | Rules | Example |
|---------|-----------|-------|---------|
| Entity Class | PascalCase | Singular | `Product`, `UserProfile` |
| Database Table | snake_case | Lowercase + Plural + English | `products`, `user_profiles` |
| Column | snake_case | Lowercase + English | `user_id`, `created_at` |
| File | kebab-case | Singular + `.entity.ts` | `product.entity.ts`, `user-profile.entity.ts` |

**Complete example demonstrating all conventions:**

```typescript
// File: product.entity.ts (kebab-case, singular, .entity.ts suffix)
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('products') // Table: snake_case, lowercase, plural, English
export class Product extends SuperEntity { // Class: PascalCase, singular
  @Column({ type: 'varchar', length: 255 })
  name: string; // Column: snake_case, English

  @Column({ type: 'varchar', length: 100, name: 'product_code' })
  productCode: string; // TS: camelCase, DB: snake_case

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' }) // FK: snake_case with _id suffix
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number; // FK field: camelCase in TS, snake_case in DB
}
```

### Checklist

- [ ] Entity class is PascalCase singular (Product, UserProfile)
- [ ] Table name is snake_case lowercase plural English (products, user_profiles)
- [ ] Column names are snake_case lowercase English (user_id, created_at)
- [ ] File name is kebab-case singular with .entity.ts (product.entity.ts)
- [ ] No Portuguese names anywhere
- [ ] Foreign keys end with _id suffix
- [ ] Timestamp columns use standard names (created_at, updated_at, deleted_at)
- [ ] @Column({ name }) used when TS property differs from DB column

### Troubleshooting

**Issue**: Query builder errors with column names
**Solution**: Ensure all column names use snake_case in @Column({ name }). Check migrations match entity definitions.

**Issue**: Inconsistent naming across team
**Solution**: Enforce conventions through code review checklist, linting rules, and reference this guide in onboarding.

**Issue**: Legacy database uses different conventions
**Solution**: Use @Column({ name: 'legacy_name' }) to map between code standards and database reality.

### Best Practices

Use descriptive English names that clearly indicate purpose. Maintain consistency between TypeScript property names (camelCase) and database column names (snake_case). Always use @Column({ name: 'snake_case' }) when property differs. Follow PostgreSQL naming conventions for better tool support. Automate convention checking with linters.

## [Entity Registration - TypeORM Module Integration]()

Entity registration process using TypeOrmModule.forFeature to make entities available for dependency injection within NestJS modules. Proper registration enables repository access in services, ensures TypeORM tracks entity for migrations, and maintains proper module encapsulation.

### When to use?

Register every entity immediately after creation in the module where it belongs using TypeOrmModule.forFeature([Entity]). Required for dependency injection, repository access, proper TypeORM functionality including migrations, and maintaining clear ownership of entities within modular architecture.

### When NOT to use?

Don't register entities in modules that don't use them directly. Avoid registering same entity in multiple modules - instead export the service/repository from owning module and import that module elsewhere to prevent coupling and circular dependencies.

### Example

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Register entity here
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Export service for other modules
})
export class ProductModule {}

// Other modules import ProductModule, not entity
@Module({
  imports: [ProductModule], // Import module, not TypeOrmModule.forFeature
  ...
})
export class OrderModule {}
```

### Checklist

- [ ] Entity imported in module file
- [ ] Entity added to TypeOrmModule.forFeature array
- [ ] Module exports service if other modules need access
- [ ] Controller registered in controllers array
- [ ] Service registered in providers array
- [ ] Other modules import this module, not re-register entity
- [ ] No circular module dependencies

### Troubleshooting

**Issue**: "Repository not found" error
**Solution**: Ensure entity is registered in TypeOrmModule.forFeature in the module where repository is injected.

**Issue**: Circular dependency between modules
**Solution**: Use forwardRef or restructure to have one module own entity and others import it through service.

**Issue**: Entity not appearing in migrations
**Solution**: Verify entity is registered and TypeORM configuration includes entity path or explicit entity array.

### Best Practices

Register entities only in their owning module. Export service rather than registering entity in multiple modules. Keep module lean by importing only required entities. Document why shared entities are exported. Avoid circular dependencies through careful module design. Use barrel exports (index.ts) for clean imports.

## [Repository Pattern - Database Operations in Services]()

Repository pattern implementation for database operations using dependency injection to access TypeORM repositories. Repositories provide type-safe methods for querying, inserting, updating, and deleting records with support for relations, ordering, complex queries, and transactions.

### When to use?

Use repository pattern in services when performing any database operations like create, read, update, delete. Inject repositories via @InjectRepository for type-safe data access, leverage TypeORM's query builder for complex queries, and maintain separation between business logic and data access.

### When NOT to use?

Don't inject repositories directly in controllers - always use services as intermediary layer. Avoid repository pattern for simple data transformations or business logic without database interaction. Don't use when raw SQL with connection pooling provides better performance for bulk operations.

### Example

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  async findAll() {
    return await this.repository.find({
      relations: ['user', 'category'],
      where: { active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const product = await this.repository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const product = this.repository.create(dto);
    return await this.repository.save(product);
  }

  async update(id: number, dto: Partial<CreateProductDto>) {
    await this.findOne(id); // Verify exists
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.repository.remove(product);
  }
}
```

### Checklist

- [ ] Repository injected via @InjectRepository decorator
- [ ] Repository type matches entity (Repository<Product>)
- [ ] Service marked with @Injectable decorator
- [ ] Relations specified when needed in find options
- [ ] Proper error handling for database operations
- [ ] Transactions used for multi-step operations
- [ ] repository.create() used before repository.save()
- [ ] Validation in DTOs, business logic in services

### Troubleshooting

**Issue**: Repository is undefined in service
**Solution**: Ensure entity is registered in module's TypeOrmModule.forFeature and service is in providers array.

**Issue**: Relations not loading
**Solution**: Add `relations: ['relationName']` to find options or use query builder with leftJoinAndSelect.

**Issue**: Save not persisting changes
**Solution**: Use repository.save() not just modify entity. For updates, fetch entity first or use repository.update().

### Best Practices

Always inject repositories through constructor for testability. Use repository.create() before repository.save() for proper entity instantiation. Leverage query builder for complex queries. Handle errors appropriately with try-catch. Use transactions for operations that must succeed or fail together. Never expose repositories in controllers.

## [Entity Development Checklist - Critical Best Practices]()

Critical best practices for entity development including proper base class selection, timestamptz usage for dates, snake_case for columns, explicit foreign key naming, separate ID fields for relations, sensitive data exclusion, index creation, and proper soft delete implementation.

### When to use?

Review this checklist before creating any new entity, during code reviews, when troubleshooting entity-related issues, or when optimizing existing entity definitions for better performance, maintainability, and consistency with project standards.

### When NOT to use?

These are general guidelines that apply to 95% of cases. Some may not apply to legacy database integrations, specific edge cases with documented exceptions, or prototypes where standards enforcement is deferred.

### Example

Critical checklist items for every entity:

1. **Choose the correct base class**:
   - `SuperEntity`: For normal entities with auto-generated ID
   - `SoftDeletableEntity`: For entities needing soft delete
   - `JunctionEntity`: For many-to-many junction tables with composite keys

2. **Always use `timestamptz` for dates**: NEVER use `timestamp with time zone` in TypeORM entities

3. **Use snake_case for column names**: PostgreSQL convention, use @Column({ name: 'snake_case' })

4. **Specify `name` in @JoinColumn**: Explicit FK control with snake_case and _id suffix

5. **Add separate ID field from relation**: Facilitates queries (userId alongside user relationship)

6. **Use @Exclude for sensitive data**: Passwords, tokens, secrets must be excluded

7. **Create indexes on frequently queried columns**: Performance optimization for large tables

8. **Use `nullable: true` when appropriate**: Avoid unnecessary NOT NULL constraints

9. **Don't add deleted_at manually**: If you need soft delete, use SoftDeletableEntity base class

### Checklist

- [ ] Correct base class chosen (SuperEntity vs SoftDeletableEntity vs JunctionEntity)
- [ ] All timestamps use timestamptz type
- [ ] Column names in snake_case with @Column({ name })
- [ ] Explicit name in @JoinColumn for foreign keys
- [ ] Separate ID fields added for relationships (userId + user)
- [ ] Sensitive data marked with @Exclude
- [ ] Indexes on foreign keys and frequently queried columns
- [ ] Nullable set appropriately for optional fields
- [ ] No manual deleted_at (use SoftDeletableEntity)
- [ ] Entity registered in module's TypeOrmModule.forFeature
- [ ] English names used throughout (no Portuguese)
- [ ] Proper default values for applicable fields

### Troubleshooting

**Issue**: Team members ignoring best practices
**Solution**: Implement automated linting rules, code review checklist template, and reference this guide in PR templates and onboarding.

**Issue**: Legacy database doesn't follow conventions
**Solution**: Use @Column({ name: 'legacy_name' }) to map between code conventions and database reality without contaminating codebase.

**Issue**: Uncertainty about which practice applies
**Solution**: Consult this guide, ask in team discussion, document decision in code comments if deviating.

### Best Practices

Treat this checklist as mandatory project standards, not suggestions. Automate enforcement where possible through ESLint rules and pre-commit hooks. Document any intentional deviations with clear reasoning in code comments. Review checklist during code reviews. Update guide when new patterns emerge.

## [Official TypeORM Documentation - Reference Resources]()

Official TypeORM documentation links covering entities, relationships, decorators, and advanced features. These resources provide comprehensive framework documentation with additional patterns and advanced usage scenarios beyond this project-specific guide.

### When to use?

Reference official documentation when encountering advanced scenarios not covered in this guide, learning about new TypeORM features, debugging complex framework-level issues, seeking authoritative explanations of decorator behavior and options, or validating understanding of TypeORM concepts.

### When NOT to use?

Avoid diving into documentation for basic patterns already covered in this guide. Don't blindly copy advanced patterns without understanding how they fit project conventions. Skip external docs if this guide provides clear project-specific guidance.

### Example

Official TypeORM documentation resources:

- **[TypeORM Entities Documentation](https://typeorm.io/entities)** - Comprehensive guide to entity creation, decorators, and configuration
- **[TypeORM Relations Documentation](https://typeorm.io/relations)** - Detailed explanation of relationship types and patterns
- **[TypeORM Decorator Reference](https://typeorm.io/decorator-reference)** - Complete list of available decorators and their options
- **[TypeORM Active Record vs Data Mapper](https://typeorm.io/active-record-data-mapper)** - Pattern comparison and usage
- **[TypeORM Migrations](https://typeorm.io/migrations)** - Schema migration and versioning

### Checklist

- [ ] Check this guide first before consulting external docs
- [ ] Validate external patterns against project conventions
- [ ] Ensure any new patterns align with existing codebase
- [ ] Document any advanced patterns adopted from official docs
- [ ] Share new learnings with team
- [ ] Consider updating this guide with new patterns

### Troubleshooting

**Issue**: Official documentation examples don't match project patterns
**Solution**: Adapt examples to follow project conventions (naming, base classes, module structure). When in doubt, follow this guide.

**Issue**: Feature exists in TypeORM but not documented here
**Solution**: Consult official docs but ensure implementation follows project standards. Consider contributing pattern back to this guide.

**Issue**: Conflicting advice between guide and official docs
**Solution**: Prefer project guide for consistency. Raise question with team if official approach seems better.

### Best Practices

Use official docs for authoritative TypeORM behavior reference. Always adapt examples to project conventions before implementing. Prefer project-specific patterns in this guide over generic documentation examples. Keep this guide updated as TypeORM evolves. Share useful official doc findings with team. Document deviations from official patterns when necessary.
