# [Backend Module Folder Structure]()

Standardized pattern for organizing files and folders in NestJS modules, ensuring consistency, scalability, and maintainability across the project.

## [Standard NestJS Module Structure]()

Recommended file and folder organization for NestJS modules following framework conventions and industry best practices. This structure balances modularity, discoverability, and maintainability while supporting both simple CRUD and complex business logic use cases.

### When to use?

Use this structure for all new NestJS modules in the project to ensure consistency. Apply this pattern when creating domain modules that handle business entities, API endpoints, and data persistence with TypeORM, ensuring uniform organization across the codebase.

### When NOT to use?

Do not use this structure for shared utility modules like common helpers, authentication modules, or infrastructure modules like database configuration. These special-purpose modules may have different organizational needs that don't follow the standard CRUD pattern.

### Example: Product Module with Standard Structure

```
src/modules/module-name/
├── module-name.module.ts          # Module configuration
├── module-name.controller.ts      # HTTP routes (endpoints)
├── module-name.service.ts         # Simple CRUD business logic
├── entities/                      # Data models
│   └── module-name.entity.ts
├── dto/                          # Data Transfer Objects
│   ├── create-module-name.dto.ts
│   └── update-module-name.dto.ts
├── use-cases/                    # Use-Cases with complex rules (optional)
│   ├── interfaces.ts             # Segregated interfaces
│   └── business-rules.usecase.ts # Use-case implementation
└── enums/                        # Enumerations (optional)
    └── module-name-status.enum.ts
```

### Checklist

- [ ] Module file with @Module decorator configuring imports, controllers, providers, and exports
- [ ] Controller file with REST endpoints using proper HTTP decorators
- [ ] Service file for simple CRUD operations or delegating to use-cases
- [ ] Entities folder containing TypeORM entity classes
- [ ] DTOs folder with create and update data transfer objects
- [ ] Use-cases folder added when business logic complexity requires it
- [ ] Enums folder created when fixed value sets are needed

### Troubleshooting

**Module not loading**: Ensure the module is imported in the parent module (usually app.module.ts) and all providers are properly declared in the providers array.

**Circular dependency errors**: Check for circular imports between modules. Use forwardRef() or restructure to avoid bidirectional dependencies between module imports.

**Entity not recognized**: Verify the entity is registered in TypeOrmModule.forFeature() array in the module file to enable TypeORM repository injection.

### Best Practices

- Keep module files focused on a single business domain for better maintainability
- Start with the minimal structure (module, controller, service, entities, dto) and add folders as needed
- Use barrel exports (index.ts) in folders with multiple files for cleaner imports
- Always co-locate related files within the same module folder rather than creating global folders

## [Module File Types and Responsibilities]()

Comprehensive guide detailing the specific role, content patterns, and usage guidelines for each file type in a NestJS module. Understanding these responsibilities ensures proper separation of concerns and maintains clean architecture throughout the application.

### When to use?

Reference this section when creating or modifying any file within a NestJS module to understand its specific purpose and implementation pattern. Use these guidelines to ensure each file type maintains its designated responsibility and follows framework conventions.

### When NOT to use?

Do not apply these patterns to non-NestJS backend code or frontend components. These responsibilities are specific to NestJS architecture and should not be confused with other architectural patterns like MVC or microservices.

### Example: Module Declaration File

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleNameController } from './module-name.controller';
import { ModuleNameService } from './module-name.service';
import { ModuleName } from './entities/module-name.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModuleName]),
  ],
  controllers: [ModuleNameController],
  providers: [ModuleNameService],
  exports: [ModuleNameService], // If other modules need it
})
export class ModuleNameModule {}
```

### Checklist

- [ ] Module file declares imports, controllers, providers, and exports
- [ ] Controller file handles HTTP request/response with proper decorators
- [ ] Service file contains business logic or delegates to use-cases
- [ ] Entity file defines TypeORM database model extending SuperEntity
- [ ] DTO files validate incoming request data with class-validator decorators

### Troubleshooting

**Provider not found errors**: Ensure all services and use-cases are listed in the providers array of the module decorator.

**Import errors between files**: Use proper relative imports within module and barrel exports for cleaner import statements.

**TypeORM entity not loading**: Verify entity is both defined with @Entity decorator and registered in TypeOrmModule.forFeature() array.

### Best Practices

- Keep controllers thin, delegating all business logic to services or use-cases
- Services should orchestrate use-cases and repositories, not contain complex algorithms
- Entities should extend SuperEntity for automatic id, createdAt, updatedAt fields
- Use PartialType for update DTOs to inherit validation from create DTOs

## [Controller Implementation Pattern]()

Defines REST endpoints handling HTTP requests and responses. Controllers should remain thin, focusing only on request validation, calling services, and returning responses with appropriate HTTP status codes.

### When to use?

Use controllers for all HTTP endpoint definitions in your NestJS module. Controllers handle routing, request parameter extraction, response formatting, and delegating business logic to services. Apply Swagger decorators for API documentation.

### When NOT to use?

Do not implement business logic directly in controllers. Avoid database queries, complex calculations, or business rule validation in controller methods. Controllers should only orchestrate service calls and handle HTTP-specific concerns.

### Example: REST Controller with Standard Endpoints

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('module-name')
@ApiBearerAuth()
@Controller('module-name')
export class ModuleNameController {
  constructor(private readonly service: ModuleNameService) {}

  @Post()
  create(@Body() dto: CreateDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
```

### Checklist

- [ ] @Controller decorator with route prefix
- [ ] @ApiTags and @ApiBearerAuth for Swagger documentation
- [ ] Service injected via constructor dependency injection
- [ ] HTTP method decorators (@Get, @Post, @Patch, @Delete)
- [ ] Request parameter decorators (@Body, @Param, @Query, @Request)
- [ ] All business logic delegated to service methods

### Troubleshooting

**Routes not accessible**: Check that controller is registered in module's controllers array and module is imported in app.module.ts.

**DTO validation not working**: Ensure ValidationPipe is globally enabled in main.ts and DTOs use class-validator decorators.

**Authentication errors**: Verify @ApiBearerAuth decorator is present and authentication guard is properly configured.

### Best Practices

- Use @ApiTags to group endpoints in Swagger documentation
- Extract user information from @Request() object after authentication
- Return service results directly without additional processing
- Use proper HTTP status codes through decorators like @HttpCode()

## [Service Implementation Pattern]()

Contains simple CRUD business logic or delegates to use-cases for complex operations. Services orchestrate repositories and use-cases, providing a clean interface for controllers to interact with business logic.

### When to use?

Use services for straightforward CRUD operations on single entities. Services should handle basic business logic like simple validations, data transformations, and repository interactions. Delegate complex multi-step operations to use-cases.

### When NOT to use?

Do not implement complex business rules, multi-entity transactions, or sophisticated validation logic directly in services. When logic exceeds 200-300 lines or involves multiple database operations, create use-cases instead.

### Example: Service with Simple CRUD and Use-Case Delegation

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ModuleNameService {
  constructor(
    @InjectRepository(ModuleName)
    private repository: Repository<ModuleName>,
  ) {}

  // Simple CRUD remains in service
  async create(dto: CreateDto, userId: number) {
    const entity = this.repository.create({ ...dto, userId });
    return await this.repository.save(entity);
  }

  async findAll(userId: number) {
    return await this.repository.find({ where: { userId } });
  }

  async findOne(id: number) {
    return await this.repository.findOneOrFail({ where: { id } });
  }

  async update(id: number, dto: UpdateDto) {
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.repository.softDelete(id);
  }

  // For complex rules, delegate to Use-Cases
}
```

### Checklist

- [ ] @Injectable decorator for dependency injection
- [ ] Repository injected using @InjectRepository
- [ ] Create, read, update, delete methods implemented
- [ ] Simple business logic kept under 200 lines total
- [ ] Complex operations delegated to use-cases

### Troubleshooting

**Repository not found**: Ensure entity is registered in TypeOrmModule.forFeature() in the module file.

**Service growing too large**: When service exceeds 300 lines, extract complex logic into use-cases with interface segregation.

**Transaction errors**: For multi-step operations requiring transactions, move logic to use-cases using EntityManager or QueryRunner.

### Best Practices

- Keep services focused on orchestration rather than implementation
- Use repository methods for simple queries, QueryBuilder for complex ones
- Throw NotFoundException when entities are not found
- Return entities directly without unnecessary data transformations

## [Entity Definition Pattern]()

Data model representing database table structure using TypeORM decorators. Entities must be located inside the module folder and extend SuperEntity for automatic timestamp and ID management.

### When to use?

Create entity files for every database table your module manages. Entities define columns, relationships, indexes, and constraints. Always extend SuperEntity to inherit id, createdAt, updatedAt, and deletedAt fields automatically.

### When NOT to use?

Do not create entities for data that doesn't require database persistence. Avoid creating centralized entity folders outside modules - each module owns its entities. SuperEntity is the only shared entity.

### Example: TypeORM Entity with Relationships

```typescript
import { Entity, Column, ManyToOne } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '../user/entities/user.entity';

@Entity('table_name')
export class ModuleName extends SuperEntity {
  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.ACTIVE })
  status: StatusEnum;

  @ManyToOne(() => User, user => user.items)
  user: User;

  @Column()
  userId: number;
}
```

### Checklist

- [ ] @Entity decorator with table name in snake_case
- [ ] Extends SuperEntity for automatic fields
- [ ] @Column decorators with appropriate types
- [ ] Relationships defined with @ManyToOne, @OneToMany, etc.
- [ ] Entity file located in entities/ folder within module
- [ ] Enum columns use type: 'enum' with enum property

### Troubleshooting

**Entity not creating table**: Ensure entity is registered in TypeOrmModule.forFeature() and synchronize or migrations are properly configured.

**Column type errors**: Verify TypeORM column types match PostgreSQL types (use 'decimal' not 'float' for precision).

**Relationship errors**: Check that foreign key columns exist and relationship decorators are properly configured on both sides.

### Best Practices

- Use snake_case for table and column names to match database conventions
- Always extend SuperEntity to avoid duplicating common fields
- Define indexes for frequently queried columns using @Index decorator
- Keep entity files focused on structure, avoid business logic methods

## [DTO Validation Pattern]()

Input data validation objects using class-validator decorators. DTOs ensure request data is properly validated before reaching business logic, providing type safety and automatic error responses.

### When to use?

Create DTOs for all controller endpoints that accept request body or query parameters. Use create DTOs for POST requests and update DTOs (extending PartialType) for PATCH requests. Apply class-validator decorators for comprehensive validation.

### When NOT to use?

Do not use DTOs for internal method parameters between services and use-cases. DTOs are specifically for HTTP request validation. Avoid over-validating data that will be validated again by database constraints.

### Example: Create and Update DTOs with Validation

```typescript
// create-module-name.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateModuleNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsEnum(StatusEnum)
  status: StatusEnum;
}

// update-module-name.dto.ts
import { PartialType } from '@nestjs/swagger';

export class UpdateModuleNameDto extends PartialType(CreateModuleNameDto) {}
```

### Checklist

- [ ] Import class-validator decorators (@IsString, @IsNumber, etc.)
- [ ] Apply @IsNotEmpty for required fields
- [ ] Use @Type() for proper type transformation
- [ ] Update DTO extends PartialType of Create DTO
- [ ] Use @IsEnum for enumeration validation
- [ ] Add @ApiProperty decorators for Swagger documentation

### Troubleshooting

**Validation not working**: Ensure ValidationPipe is globally configured in main.ts with transform: true and whitelist: true options.

**Type transformation errors**: Use @Type(() => Number/Boolean/Date) decorators for class-transformer to properly convert string inputs.

**Enum validation failing**: Verify @IsEnum decorator receives the enum type and enum values match exactly.

### Best Practices

- Use PartialType for update DTOs to inherit all validations from create DTOs
- Apply whitelist: true in ValidationPipe to strip unknown properties
- Group related validation decorators together for readability
- Document validation rules in API using @ApiProperty with description

## [Use-Cases Folder Organization]()

Guidelines for deciding when to introduce use-cases folder for complex business logic versus keeping simple operations in services. Use-cases are appropriate when operations involve multiple transactions, sophisticated validation, or require high testability through interface segregation.

### When to use?

Create a use-cases folder when your module requires complex business logic involving multiple entities, transactions spanning several database operations, sophisticated validation rules beyond simple DTO validation, or when you need interface segregation for better testability and dependency injection patterns.

### When NOT to use?

Do not create use-cases for simple CRUD operations that only involve basic create, read, update, delete actions on a single entity. Keep straightforward business logic in the service file to avoid over-engineering and unnecessary complexity for simple modules.

### Example: Financial Module with Multiple Use-Cases

```
src/modules/financial/
├── financial.module.ts
├── financial.controller.ts
├── financial.service.ts                    # Simple CRUD
└── use-cases/
    ├── interfaces.ts                       # Segregated interfaces
    ├── financial-rules.usecase.ts          # Complex business logic
    └── tax-calculations.usecase.ts         # Specialized calculations
```

```typescript
// use-cases/interfaces.ts
export interface CalculateCurrentBalance {
  calculateCurrentBalance(userId: number): Promise<number>;
}

export interface ProcessInvestment {
  processInvestment(userId: number, amount: number, type: string): Promise<boolean>;
}

// use-cases/financial-rules.usecase.ts
@Injectable()
export class FinancialRulesUseCase
  implements CalculateCurrentBalance, ProcessInvestment
{
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async calculateCurrentBalance(userId: number): Promise<number> {
    // Implementation with multiple queries and rules
    const transactions = await this.transactionRepo.find({ where: { userId } });
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  async processInvestment(userId: number, amount: number, type: string): Promise<boolean> {
    // Implementation with transactions and complex validations
  }
}
```

**See more**: [How to create Use-Cases](./how-to-create-use-case-backend.md)

### Checklist

- [ ] Business logic requires multiple database queries or transactions
- [ ] Logic involves complex validations beyond DTO class-validator rules
- [ ] Operation coordinates multiple entities or external services
- [ ] Testability requires interface segregation for mocking dependencies
- [ ] Service file exceeds 200-300 lines indicating complexity

### Troubleshooting

**When to split use-cases**: If a single use-case file exceeds 300 lines, split into multiple use-case files by business responsibility or feature area.

**Circular dependencies with service**: Inject use-cases into service, never inject service into use-case. Use-cases should depend on repositories directly.

**Testing complexity**: If use-case tests are difficult to write, ensure you're using interface segregation and injecting dependencies through constructor.

### Best Practices

- Create one use-case class per major business operation or feature
- Use interface segregation with separate interfaces for each method
- Keep use-cases focused on business logic, delegate data access to repositories
- Write comprehensive unit tests for use-cases using mocked repositories

## [Enums in Backend Modules]()

Best practices for organizing enumeration types representing fixed value sets like statuses, types, or categories. Enums provide type safety, improve code readability, and ensure database consistency when used with TypeORM enum column types.

### When to use?

Create enums when your module has fixed value sets like statuses, types, categories, or predefined options that should be type-safe and validated. Use enums for database columns that should only accept specific values, ensuring data integrity and providing autocomplete in TypeScript.

### When NOT to use?

Do not use enums for dynamic values that may change frequently or be user-configurable. Avoid enums for values that should be stored in a separate database table with additional metadata, or when the set of values is large and might require runtime configuration.

### Example: Alert Type Enum with Database Integration

```typescript
// enums/alert-type.enum.ts
export enum AlertType {
  DAILY_VARIATION = 'daily_variation',
  PRICE_TARGET = 'price_target',
  VOLUME_SPIKE = 'volume_spike',
}

// Usage in entity
import { AlertType } from '../enums/alert-type.enum';

@Entity('alerts')
export class Alert extends SuperEntity {
  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;
}

// Usage in DTO
import { IsEnum } from 'class-validator';

export class CreateAlertDto {
  @IsEnum(AlertType)
  type: AlertType;
}
```

### Checklist

- [ ] Enum uses PascalCase naming following TypeScript conventions
- [ ] Enum values use snake_case for database column compatibility
- [ ] Enum is exported from its own file in the enums folder
- [ ] Entity column uses @Column with type: 'enum' and enum property
- [ ] DTO validates enum values using @IsEnum() decorator from class-validator

### Troubleshooting

**Database enum type errors**: When adding or removing enum values, create a migration to update the database enum type definition or use string union types instead.

**Validation errors**: Ensure DTOs use @IsEnum(EnumType) decorator for proper request validation and frontend receives enum definition for form validation.

**TypeScript errors**: Import enum properly in entity and DTO files, and ensure enum values match database column constraints exactly.

### Best Practices

- Use string enum values instead of numeric for better database readability
- Keep enum values in snake_case to match database naming conventions
- Document what each enum value represents using JSDoc comments
- Create separate enums for different concerns rather than one large enum

## [Module Complexity Evolution]()

Progressive structure guidelines adapting module organization to codebase size. Start simple with flat structures for small modules, introduce use-cases for medium complexity, and fully subdivide with guards and multiple use-cases for large, feature-rich modules.

### When to use?

Apply these progressive organization patterns as your module grows in complexity. Start with minimal structure and evolve based on line count and feature complexity. This prevents over-engineering small modules while maintaining organization in large ones.

### When NOT to use?

Do not prematurely optimize module structure for features that may never be built. Avoid creating use-cases, guards, and multiple folders when simple CRUD operations suffice. Let complexity drive structure, not speculation.

### Example: Small Module Under 300 Lines

Keep everything in main files:
```
module/
├── module.module.ts
├── module.controller.ts
├── module.service.ts
├── entities/
│   └── module.entity.ts
└── dto/
    ├── create-module.dto.ts
    └── update-module.dto.ts
```

### Example: Medium Module 300-1000 Lines

Separate responsibilities into use-cases:
```
module/
├── module.module.ts
├── module.controller.ts
├── module.service.ts
├── entities/
│   └── module.entity.ts
├── dto/
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
└── use-cases/
    ├── interfaces.ts
    └── business-rules.usecase.ts
```

### Example: Large Module Over 1000 Lines

Subdivide completely with multiple use-cases:
```
module/
├── module.module.ts
├── module.controller.ts
├── module.service.ts
├── entities/
│   ├── module.entity.ts
│   └── module-detail.entity.ts
├── dto/
│   ├── create-module.dto.ts
│   ├── update-module.dto.ts
│   └── filter-module.dto.ts
├── use-cases/
│   ├── interfaces.ts
│   ├── business-rules-a.usecase.ts
│   ├── business-rules-b.usecase.ts
│   └── calculations.usecase.ts
├── enums/
│   ├── module-status.enum.ts
│   └── module-type.enum.ts
└── guards/
    └── module-permission.guard.ts
```

### Checklist

- [ ] Small modules (< 300 lines) use minimal structure
- [ ] Medium modules (300-1000 lines) introduce use-cases folder
- [ ] Large modules (> 1000 lines) have multiple use-cases and guards
- [ ] Structure evolves based on actual complexity, not speculation
- [ ] Related entities and DTOs added as features grow

### Troubleshooting

**Module growing unmanageable**: When any file exceeds 300 lines, split into multiple files by responsibility or introduce use-cases.

**Too many files in module**: Group related use-cases in subfolders within use-cases directory if you have more than 5 use-case files.

**Unclear module boundaries**: If module is handling multiple unrelated domains, consider splitting into separate modules.

### Best Practices

- Start simple and refactor as complexity demands
- Use line count as initial indicator, but prioritize logical separation
- Keep related functionality together even in large modules
- Document module purpose and boundaries in module file comments

## [Real-World Module Examples]()

Practical examples contrasting simple CRUD modules with complex modules containing use-cases, enums, and advanced features. These real-world patterns demonstrate how module structure evolves based on business logic complexity and feature requirements.

### When to use?

Reference these examples when planning module structure for new features. Use simple module pattern for straightforward CRUD operations and complex module pattern for features requiring business rules, calculations, or multi-entity coordination.

### When NOT to use?

Do not copy these structures blindly without understanding your specific requirements. Adapt patterns based on actual business needs rather than assuming complexity that may not exist.

### Example: Simple Asset Module

```
src/modules/asset/
├── asset.module.ts
├── asset.controller.ts
├── asset.service.ts
├── entities/
│   └── asset.entity.ts
└── dto/
    ├── create-asset.dto.ts
    └── update-asset.dto.ts
```

This module handles basic CRUD for asset management with no complex business rules, making it suitable for the simple pattern.

### Example: Complex Financial Module

```
src/modules/financial/
├── financial.module.ts
├── financial.controller.ts
├── financial.service.ts
├── entities/
│   ├── transaction.entity.ts
│   └── investment.entity.ts
├── dto/
│   ├── create-transaction.dto.ts
│   ├── process-investment.dto.ts
│   └── filter-transaction.dto.ts
├── use-cases/
│   ├── interfaces.ts
│   ├── financial-rules.usecase.ts
│   ├── tax-calculations.usecase.ts
│   └── balance-calculator.usecase.ts
└── enums/
    ├── transaction-type.enum.ts
    └── investment-status.enum.ts
```

This module handles complex financial operations with multiple entities, sophisticated calculations, tax rules, and business validations.

### Checklist

- [ ] Simple modules handle single entity CRUD operations
- [ ] Complex modules have multiple entities and business rules
- [ ] Use-cases separate concerns in complex modules
- [ ] Enums used for fixed value sets in both patterns
- [ ] Structure reflects actual business complexity

### Troubleshooting

**Module too simple**: If business adds complex requirements later, refactor from simple to complex pattern by introducing use-cases folder.

**Module over-engineered**: If use-cases contain only simple repository calls, consider moving logic back to service and removing use-cases.

**Unclear which pattern**: Start with simple pattern and evolve to complex when any single file exceeds 300 lines or business logic requires multiple steps.

### Best Practices

- Start with simple pattern for all new modules
- Introduce use-cases when business logic becomes complex
- Keep entity definitions simple in both patterns
- Use multiple entities in complex modules when domain requires it

## [Naming Conventions]()

Standardized naming patterns for all module elements ensuring consistency and international compatibility. Following English naming conventions with proper case styles facilitates collaboration, integrates with TypeScript ecosystem, and maintains professional code standards.

### When to use?

Apply these naming conventions to all files, classes, interfaces, and folders throughout the backend codebase. Consistent naming improves code readability, enables better IDE support, and follows international TypeScript development standards.

### When NOT to use?

These conventions are specific to backend TypeScript/NestJS code. Frontend components, database tables, and API routes may have different conventions. Database table names use snake_case while TypeScript uses PascalCase and kebab-case.

### Example: Module Element Naming

**IMPORTANT**: All classes, interfaces, entities, DTOs, enums and use-cases must be named in English, following international TypeScript development conventions.

| Item | Pattern | Example | Language |
|------|---------|---------|----------|
| Module folder | kebab-case | `asset-group` | English |
| File | kebab-case | `asset-group.service.ts` | English |
| Class | PascalCase | `AssetGroupService` | English |
| Entity | PascalCase | `AssetGroup` | English |
| DTO | PascalCase | `CreateAssetGroupDto` | English |
| Interface (Use-Case) | PascalCase without I | `CalculateBalance` | English |
| Use-Case | PascalCase with UseCase | `FinancialRulesUseCase` | English |
| Enum | PascalCase | `AssetStatus` | English |

**Examples of correct naming**:
- ✅ `ProcessInvestment`, `CalculateBalance`, `GenerateReport`
- ✅ `UserService`, `OrderController`, `ProductEntity`
- ❌ `ProcessarInvestimento`, `CalcularSaldo`, `GerarRelatorio`
- ❌ `IUserService`, `orderController`, `product_entity`

### Checklist

- [ ] Module folders use kebab-case in English
- [ ] Files use kebab-case with appropriate suffix (.service.ts, .controller.ts)
- [ ] Classes use PascalCase without prefixes
- [ ] Interfaces use PascalCase without "I" prefix
- [ ] All naming in English, no Portuguese or mixed languages

### Troubleshooting

**Import path errors**: Ensure folder and file names use kebab-case consistently and match across operating systems.

**Interface confusion**: Do not prefix interfaces with "I". Use descriptive names like `CalculateBalance` instead of `ICalculateBalance`.

**Language mixing**: Avoid mixing English and Portuguese in names. Choose English for all technical elements.

### Best Practices

- Use clear, descriptive names that explain purpose
- Prefer longer, explicit names over short, cryptic abbreviations
- Follow NestJS naming conventions with .module, .service, .controller suffixes
- Keep naming consistent across similar modules

## [Project-Wide Module Location]()

Project-wide directory hierarchy showing proper module placement within the NestJS application. All domain modules reside in src/modules with shared code in common, authentication in auth, and database configurations separated from business logic.

### When to use?

Follow this project structure when creating new modules or organizing existing code. Place all business domain modules in src/modules, keeping authentication, database config, and shared utilities in their designated folders.

### When NOT to use?

Do not create custom folder structures outside this hierarchy. Avoid placing modules directly in src root or creating alternative module organization schemes that break from this standard.

### Example: NestJS Project Structure

```
backend/src/
├── app.module.ts          # Root module importing all feature modules
├── main.ts               # Application entry point with bootstrap
├── auth/                 # Authentication and authorization (special module)
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── strategies/
│   └── guards/
├── common/               # Shared code (decorators, filters, pipes)
│   ├── decorators/
│   ├── filters/
│   └── pipes/
├── database/             # Database configs and migrations
│   ├── migrations/
│   └── entities/
│       └── super.entity.ts
└── modules/              # Domain business modules
    ├── asset/
    │   ├── asset.module.ts
    │   ├── asset.controller.ts
    │   └── ...
    ├── wallet/
    ├── quote/
    └── financial/
```

**Note**: This shows the internal backend/src/ folder structure. For the complete project root organization including where backend/, frontend/, and build/ folders should be located, see [Project Root Structure](./project-root-structure.md).

### Checklist

- [ ] All domain modules in src/modules folder
- [ ] Authentication logic in src/auth
- [ ] Shared utilities in src/common
- [ ] Database configuration in src/database
- [ ] Root module in src/app.module.ts
- [ ] Entry point in src/main.ts

### Troubleshooting

**Module not found**: Ensure module is imported in app.module.ts imports array and properly exported from its folder.

**Database connection errors**: Verify database configuration in database folder and TypeORM module is properly configured in app.module.ts.

**Shared code circular dependencies**: Keep common folder utilities truly generic and avoid importing from domain modules.

### Best Practices

- Keep domain modules independent and loosely coupled
- Use common folder only for truly shared, reusable code
- Maintain SuperEntity as the only centralized entity
- Import modules in app.module.ts in logical order (database, auth, features)

## [Module Organization Tips]()

Essential organizational principles for maintaining clean module architecture including single responsibility, progressive refactoring, proper exports, DTO separation, and entity organization. These tips prevent common pitfalls and ensure modules remain maintainable as they grow.

### When to use?

Apply these organizational principles continuously throughout development. Reference these tips during code reviews, refactoring sessions, and when planning new module features to maintain architectural consistency.

### When NOT to use?

These tips are specific to NestJS module organization. Do not apply them to non-module code like configuration files, scripts, or frontend components which have different organizational needs.

### Example: Applying Organization Principles

1. **One module = One responsibility**: Don't mix domains
   - ❌ Bad: UserProfilePaymentModule handling users, profiles, and payments
   - ✅ Good: UserModule, ProfileModule, PaymentModule as separate modules

2. **Start simple**: Don't create unnecessary folders
   - ❌ Bad: Creating use-cases folder for simple CRUD on day one
   - ✅ Good: Start with module, controller, service, entities, dto

3. **Refactor when it grows**: If it exceeds 300 lines, separate
   - ❌ Bad: 800-line service file with all logic mixed together
   - ✅ Good: Split into service (orchestration) and use-cases (business logic)

4. **Export services**: If other modules need to use them
   - ✅ Add service to module exports array when external dependencies exist

5. **Separate DTOs**: Always in their own file
   - ❌ Bad: DTO classes defined in controller or service files
   - ✅ Good: Each DTO in dto/ folder with descriptive filename

6. **Own entities**: One entity per file
   - ❌ Bad: Multiple entities in single file or entities in centralized folder
   - ✅ Good: Each entity in entities/ folder within its module

### Checklist

- [ ] Each module handles single business domain
- [ ] Modules start with minimal structure
- [ ] Files refactored when exceeding 300 lines
- [ ] Services exported when used by other modules
- [ ] DTOs in separate files with validation
- [ ] Entities co-located within module

### Troubleshooting

**Module boundaries unclear**: If uncertain whether code belongs in module, check if it shares the same database entity and business domain.

**Excessive coupling**: If module depends on many other modules, consider extracting shared logic to common folder or creating new abstraction.

**Growing complexity**: When module feels unwieldy, audit against these principles and refactor toward cleaner separation.

### Best Practices

- Review these principles during PR reviews to catch violations early
- Refactor immediately when principles are violated rather than accumulating debt
- Document module purpose and boundaries in module file header comment
- Keep modules independently deployable and testable

## [References]()

Official NestJS documentation link providing deeper insights into module system, dependency injection, and architectural patterns. This reference expands on concepts presented here with framework-specific implementation details and advanced features.

### When to use?

Consult NestJS official documentation when you need deeper understanding of framework features, advanced module patterns, or troubleshooting complex dependency injection scenarios not covered in this guide.

### When NOT to use?

This project has specific conventions that may differ from generic NestJS documentation. Always prioritize project-specific rules in this .rules folder over generic framework documentation when conflicts arise.

### Example: Key Documentation Sections

- [NestJS Modules](https://docs.nestjs.com/modules) - Core module system and dependency injection
- [NestJS Controllers](https://docs.nestjs.com/controllers) - Routing and request handling
- [NestJS Providers](https://docs.nestjs.com/providers) - Services and dependency injection
- [TypeORM Integration](https://docs.nestjs.com/techniques/database) - Database integration patterns

### Checklist

- [ ] Reviewed NestJS modules documentation for dependency injection patterns
- [ ] Understood controller routing and decorators
- [ ] Familiar with provider scopes and lifecycle
- [ ] Studied TypeORM integration with NestJS

### Troubleshooting

**Documentation conflicts**: When official docs contradict project rules, follow project-specific conventions in .rules folder.

**Version differences**: Ensure you're reading documentation matching the NestJS version used in this project's package.json.

### Best Practices

- Bookmark official documentation for quick reference
- Stay updated with NestJS releases and migration guides
- Combine official docs with project-specific rules for complete understanding
- Contribute to project documentation when discovering gaps
