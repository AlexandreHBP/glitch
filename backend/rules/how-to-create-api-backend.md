# [How to Create an API in the Backend]()

Step-by-step guide to create a complete REST API in NestJS with TypeORM entities, DTOs, services, controllers, and migrations following project standards.

## [Step 1 - Generate Resource with NestJS CLI]()

Using NestJS CLI to automatically generate complete module structure including controllers, services, entities, and DTOs saves development time and ensures framework convention compliance across the codebase.

### When to use?

Use NestJS CLI resource generation when starting a new module or feature that requires standard CRUD operations. This approach is ideal for quickly scaffolding the basic structure of a REST API endpoint with all necessary files organized according to NestJS conventions.

### When NOT to use?

Avoid using CLI generation when creating custom architectures that deviate from standard CRUD patterns, implementing specialized services without HTTP endpoints, or when the module requires complex custom structure that doesn't fit the generated template.

### Example

Generate a new NestJS resource with CLI for complete CRUD scaffolding.

```bash
cd backend
nest g resource module-name
```

**Interactive options:**

1. **What transport layer?**
   - Select: `REST API`

2. **Generate CRUD entry points?**
   - Select: `Yes`

This creates:
```
src/modules/module-name/
  module-name.module.ts
  module-name.controller.ts
  module-name.service.ts
  entities/
    module-name.entity.ts
  dto/
    create-module-name.dto.ts
    update-module-name.dto.ts
```

### Checklist

- [ ] NestJS CLI installed globally or in project
- [ ] Run command from backend root directory
- [ ] Select REST API transport layer
- [ ] Confirm CRUD entry point generation
- [ ] Verify all files created successfully

### Troubleshooting

**CLI command not found**: Install NestJS CLI with `npm install -g @nestjs/cli` or use `npx @nestjs/cli` instead.

**Module already exists**: Choose different name or delete existing module first to avoid conflicts.

**Permission errors**: Run command with appropriate permissions or check directory write access.

### Best Practices

- Use descriptive, kebab-case module names that reflect business domain
- Review generated code before implementing business logic
- Remove unused files if certain operations aren't needed
- Follow single responsibility principle when naming modules

## [Step 2 - Define TypeORM Entity as Data Model]()

TypeORM entities define database table structure through TypeScript decorators, specifying columns, data types, relationships, and constraints while providing type-safe database access and automatic schema synchronization capabilities.

### When to use?

Create TypeORM entities when defining new database tables or modifying existing table structures. Entities are the source of truth for your data model and should extend appropriate base class: SuperEntity for standard entities, SoftDeletableEntity for soft delete support, or JunctionEntity for many-to-many junction tables with composite keys.

### When NOT to use?

Avoid creating entities for temporary data structures, API response objects, view models, or database views that don't represent persistent tables. Use DTOs for API data transfer and interfaces for non-persistent type definitions.

### Example

Define entity structure with columns, types, and relationships for database mapping.

**File**: `entities/module-name.entity.ts`

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';
import { User } from '@/auth/entities/user.entity';

@Entity('table_name')
export class ModuleName extends SuperEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Relationship with User (record owner)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;
}
```

### Checklist

- [ ] Entity extends appropriate base class (SuperEntity, SoftDeletableEntity, or JunctionEntity)
- [ ] Table name uses snake_case convention
- [ ] Column names use snake_case with explicit name attribute
- [ ] Relationships use @JoinColumn with explicit name
- [ ] Foreign key column defined separately for query efficiency
- [ ] Data types match database column types
- [ ] Nullable columns marked with nullable: true

### Troubleshooting

**Synchronization errors**: Ensure database table exists via migration before using entity. TypeORM sync should be disabled in production.

**Circular dependency errors**: Use lazy relations with arrow functions `() => RelatedEntity` to resolve circular import issues.

**Foreign key constraint failures**: Verify referenced table exists and has correct primary key before adding relationship.

### Best Practices

- Always extend appropriate base class: SuperEntity (standard), SoftDeletableEntity (soft delete), or JunctionEntity (composite keys)
- Use snake_case for database column names (PostgreSQL convention)
- Specify explicit names in @JoinColumn for relationship clarity
- Add separate userId columns to facilitate efficient queries
- Use appropriate data types matching database capabilities
- Document complex relationships with inline comments

## [Step 3 - Create Data Transfer Objects with Validation]()

DTOs define API request/response structure with class-validator decorators ensuring data integrity through automatic validation. They separate external API contracts from internal entity representations protecting database models from direct exposure.

### When to use?

Create DTOs for all API endpoints accepting user input to validate data format, types, and constraints before processing. Use separate DTOs for create and update operations, with update DTOs typically extending create DTOs using PartialType to make fields optional.

### When NOT to use?

Skip DTOs for internal service-to-service communication, database query results, or when response data exactly matches entity structure without transformation. Don't create DTOs for GET endpoints that simply return entity data without modification.

### Example

Build validated DTOs with decorators for request body validation and API documentation.

**Create DTO** (`dto/create-module-name.dto.ts`):

```typescript
import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleNameDto {
  @ApiProperty({
    description: 'Item name',
    example: 'My Item',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed description',
    example: 'Complete item description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether the item is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
```

**Update DTO** (`dto/update-module-name.dto.ts`):

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateModuleNameDto } from './create-module-name.dto';

export class UpdateModuleNameDto extends PartialType(CreateModuleNameDto) {}
```

### Checklist

- [ ] All properties have validation decorators
- [ ] Swagger @ApiProperty decorators added for documentation
- [ ] String fields have MaxLength constraints
- [ ] Required fields use @IsNotEmpty
- [ ] Optional fields marked with ? and @IsOptional
- [ ] Update DTO uses PartialType from @nestjs/swagger
- [ ] Examples provided in ApiProperty decorators

### Troubleshooting

**Validation not triggering**: Ensure ValidationPipe is enabled globally in main.ts with `app.useGlobalPipes(new ValidationPipe())`.

**Type mismatch errors**: Verify decorator types match property types and imported from correct packages.

**Swagger not showing DTOs**: Import from @nestjs/swagger not @nestjs/mapped-types for PartialType in update DTOs.

### Best Practices

- Combine class-validator and Swagger decorators for validation and documentation
- Use strict validation decorators to prevent malformed data
- Provide clear examples in ApiProperty for API consumers
- Keep DTOs focused on single operation context
- Use PartialType for update DTOs to inherit validations
- Validate nested objects with @ValidateNested and @Type decorators

## [Step 4 - Implement Service with Business Logic]()

Services contain business logic, CRUD operations, and data access orchestration using injected TypeORM repositories. They implement security through user isolation, handle exceptions appropriately, and return processed data to controllers.

### When to use?

Implement services for all business logic, data manipulation, and database operations. Services should be the single source of truth for how data is created, read, updated, and deleted ensuring consistent validation and access control across all application entry points.

### When NOT to use?

Avoid putting HTTP-specific logic, request/response transformation, or authentication/authorization logic in services. These concerns belong in controllers, guards, or interceptors. Don't create services for simple data pass-through without business logic.

### Example

Develop service layer with CRUD operations, repository injection, and user isolation logic.

**File**: `module-name.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleNameDto } from './dto/create-module-name.dto';
import { UpdateModuleNameDto } from './dto/update-module-name.dto';
import { ModuleName } from './entities/module-name.entity';

@Injectable()
export class ModuleNameService {
  constructor(
    @InjectRepository(ModuleName)
    private repository: Repository<ModuleName>,
  ) {}

  async create(createDto: CreateModuleNameDto, userId: number) {
    const item = this.repository.create({
      ...createDto,
      userId,
    });

    return await this.repository.save(item);
  }

  async findAll(userId: number) {
    return await this.repository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const item = await this.repository.findOne({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }

    return item;
  }

  async update(id: number, updateDto: UpdateModuleNameDto, userId: number) {
    const item = await this.findOne(id, userId);
    Object.assign(item, updateDto);
    return await this.repository.save(item);
  }

  async remove(id: number, userId: number) {
    const item = await this.findOne(id, userId);
    await this.repository.remove(item);
    return { message: 'Item removed successfully' };
  }
}
```

### Checklist

- [ ] Service decorated with @Injectable()
- [ ] Repository injected with @InjectRepository
- [ ] userId validation in all data operations
- [ ] findOne called before update/delete operations
- [ ] Appropriate exceptions thrown (NotFoundException, ForbiddenException)
- [ ] Methods return updated entities for frontend use
- [ ] Async/await used for all database operations

### Troubleshooting

**Dependency injection errors**: Ensure entity is registered in TypeOrmModule.forFeature in module file.

**Transaction errors**: Wrap multiple operations in queryRunner.startTransaction() for atomicity when needed.

**Performance issues**: Add indexes via migrations for frequently queried fields and use select to limit returned columns.

### Best Practices

- Always validate userId to ensure data isolation between users
- Use findOne before update/delete to validate permissions
- Throw appropriate HTTP exceptions (NotFoundException, ForbiddenException)
- Return updated entities after save operations for frontend state management
- Use TypeORM's built-in methods (find, findOne, save) for standard operations
- Implement pagination for list operations handling large datasets

## [Step 5 - Create Controller with Versioned REST Endpoints]()

Controllers define HTTP route handlers with versioning, Swagger documentation, and request/response transformation. They delegate business logic to services while handling HTTP-specific concerns like status codes, parameter parsing, and authentication context access.

### When to use?

Create controllers for every module exposing REST API endpoints. Controllers should handle HTTP request routing, parameter extraction, DTO validation triggers, and response formatting while delegating all business logic to injected services for separation of concerns.

### When NOT to use?

Don't put business logic, database access, or complex calculations in controllers. Avoid creating controllers for internal modules, background jobs, or event handlers that don't require HTTP endpoints. Use services or specialized handlers instead.

### Example

Build HTTP route handlers with versioning, Swagger docs, and service delegation.

**File**: `module-name.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModuleNameService } from './module-name.service';
import { CreateModuleNameDto } from './dto/create-module-name.dto';
import { UpdateModuleNameDto } from './dto/update-module-name.dto';

@ApiTags('module-name')
@ApiBearerAuth()
@Controller({ path: 'module-name', version: '1' })
export class ModuleNameController {
  constructor(private readonly service: ModuleNameService) {}

  @Post()
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(@Body() createDto: CreateModuleNameDto, @Request() req) {
    return this.service.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all items' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find item by ID' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateModuleNameDto,
    @Request() req,
  ) {
    return this.service.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.remove(id, req.user.userId);
  }
}
```

### Checklist

- [ ] Controller uses version: '1' in decorator
- [ ] Swagger decorators added (@ApiTags, @ApiOperation)
- [ ] Bearer authentication documented with @ApiBearerAuth
- [ ] ParseIntPipe used for ID parameter validation
- [ ] Request object injected to access authenticated user
- [ ] Proper HTTP verbs (POST, GET, PATCH, DELETE) used
- [ ] RESTful route structure followed

### Troubleshooting

**Versioning not working**: Ensure version is enabled globally in main.ts with `app.enableVersioning({ type: VersioningType.URI })`.

**Request user undefined**: Verify JWT authentication guard is applied globally or on controller/route level.

**Swagger not displaying**: Check that DocumentBuilder configuration includes the controller's API tags.

### Best Practices

- Use Swagger decorators for automatic API documentation
- Apply ParseIntPipe for automatic ID validation and conversion
- Inject @Request() to access authenticated user context
- Use correct HTTP verbs following REST conventions
- Structure routes RESTfully: /resource and /resource/:id
- Always use versioning from the start: version: '1'
- Document all possible response status codes

## [Step 6 - Configure NestJS Module and Registration]()

NestJS modules organize application structure by grouping related controllers, services, and dependencies. Module registration with TypeORM establishes repository availability and enables dependency injection throughout the module scope while exports allow cross-module service sharing.

### When to use?

Configure modules when creating new features or organizing related functionality. Register TypeORM entities in imports, declare controllers and providers, and export services that need to be used by other modules ensuring proper dependency injection throughout the application.

### When NOT to use?

Avoid creating modules for single utilities, helpers, or when functionality naturally fits into an existing module. Don't over-modularize by creating too many small modules that increase complexity without providing organizational benefits.

### Example

Register entities, controllers, and services in module for dependency injection setup.

**File**: `module-name.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleNameService } from './module-name.service';
import { ModuleNameController } from './module-name.controller';
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

**Register in AppModule** (`src/app.module.ts`):

```typescript
import { ModuleNameModule } from './modules/module-name/module-name.module';

@Module({
  imports: [
    // ... other modules
    ModuleNameModule,
  ],
})
export class AppModule {}
```

### Checklist

- [ ] TypeOrmModule.forFeature includes all entities
- [ ] Controllers array includes all module controllers
- [ ] Providers array includes all services
- [ ] Exports array includes services needed by other modules
- [ ] Module imported in AppModule
- [ ] No circular dependencies between modules

### Troubleshooting

**Repository not found**: Ensure entity is included in TypeOrmModule.forFeature array in module imports.

**Circular dependency errors**: Restructure module relationships or use forwardRef to resolve circular imports.

**Module not loaded**: Verify module is imported in AppModule imports array.

### Best Practices

- Register all entities the module uses in TypeOrmModule.forFeature
- Only export services that other modules need to import
- Keep module imports organized and grouped logically
- Avoid circular dependencies between modules
- Use feature modules to organize domain-specific functionality
- Import shared modules when needed for cross-cutting concerns

## [Step 7 - Create Database Migration for Schema Changes]()

TypeORM migrations provide version-controlled database schema evolution using pure SQL. They ensure consistent schema across environments, enable rollback capabilities, and maintain change history while supporting automated deployment and team synchronization through sequential timestamped files.

### When to use?

Create migrations for all database schema changes including new tables, column modifications, index additions, and constraint updates. Migrations ensure database changes are version-controlled, reversible, and can be deployed consistently across development, staging, and production environments.

### When NOT to use?

Avoid migrations for temporary development changes, data seeding that varies by environment, or experimental schema modifications during early prototyping. Don't use migrations for data-only updates that should be handled by application logic or separate data scripts.

### Example

Generate migration file, write SQL schema changes, and execute migration to database.

```bash
npm run typeorm -- migration:create src/database/migrations/CreateModuleNameTable
```

**Edit migration to use pure SQL**:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateModuleNameTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE table_name (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        user_id INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_table_name_user_id ON table_name(user_id);
    `);

    await queryRunner.query(`
      ALTER TABLE table_name
        ADD CONSTRAINT fk_table_name_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE table_name;`);
  }
}
```

**Run migration**:

```bash
npm run typeorm -- migration:run
```

### Checklist

- [ ] Migration created with descriptive name
- [ ] Up method implements schema changes
- [ ] Down method reverts changes completely
- [ ] Pure SQL used (not TypeORM schema builder)
- [ ] Foreign key constraints defined
- [ ] Indexes created for performance
- [ ] Migration tested in development first
- [ ] Migration executed successfully

### Troubleshooting

**Migration not detected**: Verify migrations path in database config matches actual file location.

**Already executed error**: Check migration status with `npm run typeorm -- migration:show` before re-running.

**Failed migration**: Revert with `npm run typeorm -- migration:revert`, fix the SQL, and run again.

### Best Practices

- Use pure SQL through queryRunner.query for explicit control
- Always implement both up and down methods
- Test migrations in development before production deployment
- Use descriptive names indicating what changed
- Create indexes for foreign keys and frequently queried columns
- One responsibility per migration file
- Document complex migrations with comments

## [Step 8 - Test API with Swagger and HTTP Tools]()

Testing REST APIs using Swagger UI interactive documentation or command-line curl requests validates endpoint functionality, authentication, request/response formats, and error handling ensuring API contracts are correctly implemented and documented.

### When to use?

Test APIs after implementation, before deployment, and when debugging issues. Use Swagger UI for interactive testing during development and curl for automated testing, CI/CD pipelines, or when documenting API usage for consumers.

### When NOT to use?

Don't rely solely on manual testing for production validation. Supplement with automated unit tests, integration tests, and end-to-end tests. Avoid using production databases for testing to prevent data corruption or accidental operations.

### Example

Validate endpoints using Swagger UI interface and curl commands for all CRUD operations.

**Via Swagger UI**:

1. Access: `http://localhost:3000/api/docs`
2. Click "Authorize" and insert JWT token
3. Expand endpoint section
4. Click "Try it out"
5. Fill request body/parameters
6. Execute and view response

**Via curl**:

```bash
# Create
curl -X POST http://localhost:3000/api/v1/module-name \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "description": "Test description"}'

# List
curl -X GET http://localhost:3000/api/v1/module-name \
  -H "Authorization: Bearer YOUR_TOKEN"

# Find by ID
curl -X GET http://localhost:3000/api/v1/module-name/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update
curl -X PATCH http://localhost:3000/api/v1/module-name/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test"}'

# Delete
curl -X DELETE http://localhost:3000/api/v1/module-name/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Checklist

- [ ] Swagger UI accessible at /api/docs
- [ ] JWT authentication working via Authorize button
- [ ] All endpoints visible in Swagger documentation
- [ ] Request bodies validate according to DTOs
- [ ] Response formats match expected structure
- [ ] Error responses return appropriate status codes
- [ ] curl commands tested for each operation

### Troubleshooting

**Swagger not accessible**: Verify Swagger module configured in main.ts and app is running.

**Authentication fails**: Check JWT token is valid, not expired, and includes Bearer prefix.

**404 errors**: Verify route versioning matches (v1) and controller path is correct.

### Best Practices

- Test all CRUD operations in sequence (Create, Read, Update, Delete)
- Verify authentication and authorization work correctly
- Test edge cases like invalid IDs, missing fields, and unauthorized access
- Check that error messages are clear and helpful
- Validate response data types match API documentation
- Test pagination, filtering, and sorting when implemented

## [Advanced Feature - Implement Pagination for Large Datasets]()

Pagination divides large result sets into manageable pages improving API performance and user experience. Implementation includes skip/take logic, metadata response with total count, page number, and total pages calculation for client-side pagination controls.

### When to use?

Implement pagination when endpoints return large datasets to improve performance and user experience. Essential for list operations that could return hundreds or thousands of records preventing memory issues and slow response times.

### When NOT to use?

Skip pagination for endpoints that always return small result sets (under 50 items). Avoid for single resource endpoints (GET by ID) or when the business logic requires returning all items at once.

### Example

Add pagination logic with page and pageSize parameters returning metadata with results.

```typescript
// Service
async findAll(userId: number, page: number = 1, pageSize: number = 10) {
  const [data, total] = await this.repository.findAndCount({
    where: { userId },
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { created_at: 'DESC' },
  });

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Controller
@Get()
findAll(
  @Query('page') page: string = '1',
  @Query('pageSize') pageSize: string = '10',
  @Request() req,
) {
  return this.service.findAll(req.user.userId, +page, +pageSize);
}
```

### Checklist

- [ ] Pagination returns metadata (total, page, totalPages)
- [ ] Default page size set to reasonable value
- [ ] Page and pageSize parameters validated
- [ ] Skip and take calculations correct
- [ ] Query performance tested with large datasets
- [ ] API documentation includes pagination parameters

### Troubleshooting

**Poor pagination performance**: Add database indexes on sorting columns and ensure proper query optimization.

**Incorrect page count**: Verify totalPages calculation uses Math.ceil for proper rounding of division result.

**Negative page numbers**: Add validation to ensure page is at least 1 and pageSize is within acceptable range.

### Best Practices

- Return pagination metadata for client-side pagination controls
- Provide sensible defaults for page size (10-25 items)
- Validate page and pageSize parameters to prevent abuse
- Add indexes on columns used for sorting
- Document pagination parameters clearly in Swagger
- Consider maximum pageSize limit to prevent performance issues

## [Advanced Feature - Add Filtering and Search Capabilities]()

Filtering and search enable users to narrow results by specific criteria using query parameters. Implementation uses TypeORM's where conditions with Like operator for partial text matching and exact matching for boolean and enum fields.

### When to use?

Add filtering and search when users need to narrow results by specific criteria. Common for list endpoints where users want to find records matching certain conditions like name contains text, status equals value, or date ranges.

### When NOT to use?

Skip complex filtering for simple use cases where standard queries suffice. Avoid when performance impact of dynamic queries outweighs benefits or when search requirements are better served by full-text search engines like Elasticsearch.

### Example

Create filter DTO and implement dynamic where conditions for flexible querying.

```typescript
// DTO
export class FilterModuleNameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

// Service
async findAll(userId: number, filters: FilterModuleNameDto) {
  const where: any = { userId };

  if (filters.name) {
    where.name = Like(`%${filters.name}%`);
  }

  if (filters.active !== undefined) {
    where.active = filters.active;
  }

  return await this.repository.find({ where });
}
```

### Checklist

- [ ] Filter DTO created with validation
- [ ] Search uses LIKE operator for partial matching
- [ ] Optional filters don't affect query if not provided
- [ ] Boolean filters check for undefined to allow false values
- [ ] API documentation includes filter parameters

### Troubleshooting

**Filter not working**: Verify TypeORM's Like operator imported from 'typeorm' and syntax is correct.

**Boolean filter ignoring false**: Check condition uses `!== undefined` instead of truthy check.

**SQL injection risk**: Never concatenate user input directly into raw SQL. Use parameterized queries or TypeORM query builder.

### Best Practices

- Use separate DTO for filter parameters with validation
- Implement search with case-insensitive LIKE queries
- Check for undefined to allow false boolean values
- Sanitize user input to prevent SQL injection
- Document filter behavior clearly in Swagger
- Consider adding database indexes on filtered columns

## [Advanced Feature - Load Entity Relationships Efficiently]()

Relationship loading retrieves related entity data in queries using TypeORM's relations option or eager loading. Proper relationship management prevents N+1 query problems and reduces unnecessary database calls while providing complete data structures to API consumers.

### When to use?

Include relationship loading when frontend needs related entity data to avoid multiple requests. Use for detail endpoints (GET by ID) when showing complete object with related data or when relationships are frequently accessed together.

### When NOT to use?

Don't eager load relationships when related data isn't needed to reduce query overhead and response size. Avoid for list endpoints unless specifically required as relationships multiply result set size significantly impacting performance.

### Example

Configure relationship loading using relations option for selective data inclusion.

```typescript
async findOne(id: number, userId: number) {
  const item = await this.repository.findOne({
    where: { id, userId },
    relations: ['user', 'category'],
  });

  if (!item) {
    throw new NotFoundException(`Item ${id} not found`);
  }

  return item;
}
```

### Checklist

- [ ] Relationships loaded only when needed
- [ ] Relations array includes only required entities
- [ ] Query performance tested with relationships
- [ ] Circular references handled appropriately

### Troubleshooting

**Relationship errors**: Check that relationship names match entity definitions and referenced entities exist.

**Performance degradation**: Limit relationship depth and avoid loading relationships in list endpoints without pagination.

**Circular JSON error**: Use @Transform decorator or response interceptor to exclude circular references from JSON serialization.

### Best Practices

- Load relationships selectively to optimize performance
- Use relations option for lazy-loaded relationships
- Avoid deep relationship trees that cause performance issues
- Consider separate endpoints for related data if relationships are complex
- Document which endpoints include relationships in Swagger
- Test query performance with relationships on large datasets

## [Naming Conventions for NestJS Resources]()

Consistent naming patterns across modules, entities, tables, DTOs, services, and controllers ensure code readability, maintainability, and alignment with NestJS and TypeORM conventions while facilitating team collaboration and automated tooling integration.

### When to use?

Follow these naming conventions for all new resources, files, classes, and database objects. Apply these patterns consistently across the entire codebase to maintain uniformity and make code navigation intuitive for all team members.

### When NOT to use?

Maintain consistency with existing patterns when working on legacy code that uses different conventions. Don't retroactively rename existing resources unless performing systematic refactoring. Prioritize consistency within a module over strict adherence to new conventions.

### Example

Standard naming patterns for all NestJS components and database objects.

| Type | Pattern | Rules | Example |
|------|---------|-------|---------|
| Module | kebab-case | Descriptive name | `product-category` |
| Entity | PascalCase | Singular | `ProductCategory` |
| Table | snake_case | Lowercase + Plural | `product_categories` |
| DTO | PascalCase | Descriptive + Dto suffix | `CreateProductCategoryDto` |
| Service | PascalCase | Name + Service suffix | `ProductCategoryService` |
| Controller | PascalCase | Name + Controller suffix | `ProductCategoryController` |

**Important**:
- **Entity**: Always singular in PascalCase (e.g., `Product`, `User`)
- **Table**: Always plural in lowercase snake_case (e.g., `products`, `users`)

### Checklist

- [ ] Module names use kebab-case
- [ ] Entity classes use singular PascalCase
- [ ] Database tables use plural snake_case
- [ ] DTOs include operation prefix and Dto suffix
- [ ] Services include Service suffix
- [ ] Controllers include Controller suffix
- [ ] File names match class names in kebab-case

### Troubleshooting

**NestJS CLI generates wrong names**: Manually rename files and classes after generation to match conventions.

**TypeORM sync issues**: Ensure entity @Entity decorator specifies correct snake_case table name.

**Import errors**: Verify file names match exported class names when converted to kebab-case.

### Best Practices

- Use kebab-case for all file and folder names
- Keep entity class names singular and table names plural
- Always use snake_case for database identifiers
- Include descriptive prefixes in DTOs (Create, Update, Filter)
- Maintain consistent suffixes (Service, Controller, Module)
- Follow TypeScript naming conventions for classes and interfaces

## [Complete API Implementation Checklist]()

Comprehensive verification ensuring all components of REST API implementation are complete including code generation, entity definition, DTO validation, service logic, controller routing, module configuration, database migration, documentation, security, and versioning.

- [ ] Resource generated with `nest g resource`
- [ ] Entity created extending appropriate base class (SuperEntity, SoftDeletableEntity, or JunctionEntity)
- [ ] DTOs created with class-validator decorators
- [ ] Service implemented with complete CRUD operations
- [ ] Controller implemented with REST routes and v1 versioning
- [ ] Module configured with TypeORM and registered in AppModule
- [ ] Migration created and executed successfully
- [ ] Swagger documentation added with @Api decorators
- [ ] userId validation implemented in all operations
- [ ] API versioning configured (see [How to version API](./how-to-version-api-backend.md))
- [ ] All endpoints tested via Swagger or curl
- [ ] Error handling implemented with appropriate exceptions

## [Official Documentation References]()

Official framework and library documentation providing comprehensive reference for NestJS architecture patterns, TypeORM entity management, validation decorators, and advanced features beyond this guide's scope.

- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Providers](https://docs.nestjs.com/providers)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [TypeORM Entities](https://typeorm.io/entities)
- [TypeORM Relations](https://typeorm.io/relations)
- [class-validator Decorators](https://github.com/typestack/class-validator)
- [Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
