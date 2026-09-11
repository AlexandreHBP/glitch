# [Scalable Implementation Patterns for Backend Modules]()

Complete guide to building scalable and maintainable NestJS modules using SOLID principles, dependency injection, and proven design patterns for long-term code quality.

## [SOLID Principles - Foundation for Scalable Architecture]()

Essential software design principles for NestJS modules including Single Responsibility, Dependency Injection, and Dependency Inversion ensuring code maintainability, testability, and reduced coupling between components enabling easier refactoring and long-term scalability in production systems.

### When to use?

Apply SOLID principles when designing any NestJS module or service. Use Single Responsibility to ensure each class has one job, Dependency Injection to avoid tight coupling, and Dependency Inversion to depend on abstractions rather than concrete implementations. Essential for all backend development requiring maintainability and testability.

### When NOT to use?

These principles are foundational and should always be followed in production code. However, in quick prototypes, proof-of-concepts, or throwaway scripts where long-term maintainability is not a concern, strict adherence may be relaxed for speed of development without impacting production quality.

### Example

Example demonstrating Single Responsibility with separated concerns between ProductService, EmailService, and PdfService:

```typescript
// ❌ Bad - Service doing everything
@Injectable()
export class ProductService {
  async create() { /* ... */ }
  async sendEmail() { /* ... */ }  // Shouldn't be here
  async generatePDF() { /* ... */ } // Shouldn't be here
}

// ✅ Good - Separated responsibilities
@Injectable()
export class ProductService {
  constructor(
    private emailService: EmailService,
    private pdfService: PdfService,
  ) {}

  async create(dto) {
    const product = await this.repository.save(dto);
    await this.emailService.sendCreationEmail(product);
    return product;
  }
}
```

### Checklist

- [ ] Each class has a single, well-defined responsibility
- [ ] Dependencies are injected via constructor, not created internally
- [ ] Services depend on interfaces, not concrete implementations
- [ ] Code is testable with mockable dependencies
- [ ] No circular dependencies exist

### Troubleshooting

**Problem:** Circular dependency errors at runtime.
**Solution:** Review your dependency graph and introduce interfaces to break the cycle using Dependency Inversion.

**Problem:** Difficulty testing services due to hard dependencies.
**Solution:** Ensure all dependencies are injected via constructor and use interfaces for better mockability.

### Best Practices

- Keep constructors clean with only dependency injection
- Use interfaces for all external dependencies to enable easy mocking
- Follow the "new is glue" principle - avoid using 'new' in business logic
- Document complex dependency relationships in comments
- Regularly refactor to maintain principle compliance

## [Single Responsibility Principle - One Class One Purpose]()

Each class should have a single, well-defined responsibility to ensure code remains maintainable and testable. Avoid classes that combine multiple concerns like business logic, email notifications, and PDF generation. Separate concerns into dedicated services that can be injected and composed together for complex operations.

### When to use?

Apply Single Responsibility when designing any class, service, or use-case. Each component should have exactly one reason to change. If a service handles product management, delegate email notifications to EmailService and PDF generation to PdfService. Use for all production code requiring maintainability.

### When NOT to use?

Never violate Single Responsibility in production code. Even in simple applications, maintaining single responsibility pays dividends during maintenance and testing. The only exception is throwaway prototypes that will never reach production or require maintenance.

### Example

Example showing separation of product creation, email notification, and PDF generation into distinct services:

```typescript
// ❌ Bad - Multiple responsibilities
@Injectable()
export class ProductService {
  async create() { /* ... */ }
  async sendEmail() { /* ... */ }  // Email concern
  async generatePDF() { /* ... */ } // PDF concern
}

// ✅ Good - Single responsibility
@Injectable()
export class ProductService {
  constructor(
    private emailService: EmailService,
    private pdfService: PdfService,
  ) {}

  async create(dto) {
    const product = await this.repository.save(dto);
    await this.emailService.sendCreationEmail(product);
    return product;
  }
}
```

### Checklist

- [ ] Each class has exactly one reason to change
- [ ] Business logic separated from infrastructure concerns (email, PDF, etc)
- [ ] Helper services created for cross-cutting concerns
- [ ] No mixed responsibilities within single class

### Troubleshooting

**Problem:** Class exceeds 300 lines and handles multiple concerns.
**Solution:** Extract each distinct responsibility into dedicated service classes.

**Problem:** Changes to email logic require modifying product service.
**Solution:** Move email functionality to EmailService injected as dependency.

### Best Practices

- Identify distinct responsibilities and extract into separate classes
- Use composition over inheritance for combining behaviors
- Delegate infrastructure concerns (email, storage, PDF) to specialized services
- Keep business logic focused on core domain operations

## [Dependency Injection - Inversion of Control]()

Always inject dependencies via constructor instead of creating them internally using 'new' keyword. This enables testability through mocking, reduces coupling, and allows NestJS to manage component lifecycle and singleton behavior. Injected dependencies make code modular and swappable without modifying consumer classes.

### When to use?

Use dependency injection for all external dependencies including services, repositories, third-party libraries, configuration, and utilities. Apply to every NestJS service, controller, and use-case. Constructor injection is mandatory for proper NestJS integration and testing capabilities.

### When NOT to use?

Never create dependencies with 'new' keyword in NestJS business logic. Only exception is creating simple value objects (DTOs, entities) that don't require lifecycle management or mocking. All services must use constructor injection for proper framework integration.

### Example

Example demonstrating constructor injection of EmailService and PdfService instead of internal instantiation:

```typescript
// ❌ Bad - Creating dependencies internally
@Injectable()
export class ProductService {
  private emailService = new EmailService(); // Bad - tight coupling

  async create() { /* ... */ }
}

// ✅ Good - Injecting dependencies
@Injectable()
export class ProductService {
  constructor(
    private emailService: EmailService,     // Injected
    private pdfService: PdfService,          // Injected
  ) {}
}
```

### Checklist

- [ ] All services injected via constructor, not created with 'new'
- [ ] @Injectable() decorator present on all injectable classes
- [ ] Dependencies registered in module providers
- [ ] No hard-coded instantiation of services in business logic

### Troubleshooting

**Problem:** Cannot mock dependencies for testing.
**Solution:** Ensure all dependencies are injected via constructor, not created internally.

**Problem:** NestJS cannot resolve dependencies error.
**Solution:** Add service to module providers array and verify circular dependencies.

### Best Practices

- Use constructor injection exclusively for services and repositories
- Declare injected dependencies as private readonly when possible
- Keep constructors simple with only dependency assignments
- Register all providers in appropriate module
- Use @Inject() token when injecting by interface or custom token

## [Dependency Inversion - Program to Interfaces]()

Depend on abstractions (interfaces) instead of concrete implementations to enable flexibility, testability, and multiple implementations. Define interface contracts that specify behavior without implementation details. Services consume interfaces while concrete classes implement them, allowing swapping implementations without changing consumers.

### When to use?

Apply Dependency Inversion when you need multiple implementations of same behavior (email vs SMS notifications), when writing testable code requiring mocking, or when you want to isolate business logic from infrastructure details. Essential for Strategy pattern and Use-Case pattern implementations.

### When NOT to use?

Skip interfaces for simple internal helpers with single implementation unlikely to change. Don't over-engineer with abstractions when concrete dependency is stable and won't be swapped. Use pragmatically when benefit of abstraction outweighs complexity cost.

### Example

Example showing interface-based notification system allowing email and SMS implementations to be swapped without changing ProductService:

```typescript
// Interface (abstraction)
export interface INotificationService {
  send(message: string): Promise<void>;
}

// Concrete implementations
@Injectable()
export class EmailNotificationService implements INotificationService {
  async send(message: string) { /* Send email */ }
}

@Injectable()
export class SmsNotificationService implements INotificationService {
  async send(message: string) { /* Send SMS */ }
}

// Service depends on interface, not implementation
@Injectable()
export class ProductService {
  constructor(
    @Inject('INotificationService')
    private notificationService: INotificationService,
  ) {}

  async create(dto) {
    const product = await this.repository.save(dto);
    await this.notificationService.send('Product created');
    return product;
  }
}
```

### Checklist

- [ ] Interfaces defined for dependencies with multiple implementations
- [ ] Services inject interfaces using @Inject() with token
- [ ] Concrete implementations registered in module providers with token
- [ ] Business logic depends on abstractions, not concrete classes

### Troubleshooting

**Problem:** Cannot inject interface - TypeScript interfaces don't exist at runtime.
**Solution:** Use @Inject() with string token and register provider with useClass in module.

**Problem:** Multiple implementations but service still tightly coupled to one.
**Solution:** Refactor to depend on interface and configure concrete class in module.

### Best Practices

- Define clear interface contracts with minimal methods
- Use interfaces for any dependency with potential multiple implementations
- Register concrete implementation in module with custom token
- Document which implementation is active in module configuration
- Use for Strategy pattern and plugin architectures

## [Use-Case Pattern - Business Logic Isolation]()

Primary pattern for implementing complex business rules in isolated, testable classes following Interface Segregation Principle. Each use-case handles one specific business operation with single interface defining its contract. Preferred over fat services for operations involving multiple transactions, entities, or complex orchestration requiring independent testing.

### When to use?

Apply Use-Case pattern for complex business rules involving multiple transactions, operations spanning multiple entities, logic requiring isolated testing, or processes with potential multiple implementations. Essential for domain-driven design and maintaining clean separation between business logic and infrastructure concerns in scalable systems.

### When NOT to use?

Skip Use-Cases for simple CRUD operations with direct database reads/writes, basic queries without processing, or trivial single-entity operations. Keep these simple operations in services. Don't over-engineer straightforward operations that don't benefit from abstraction or isolated testing.

### Example

Example showing thin use-case with single interface for calculating user balance using dedicated business logic:

```typescript
// 1. Define interface with single responsibility
export interface CalculateBalance {
  calculateBalance(userId: number): Promise<number>;
}

// 2. Implement thin use-case (1 interface = 1 use-case)
@Injectable()
export class CalculateBalanceUseCase implements CalculateBalance {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async calculateBalance(userId: number): Promise<number> {
    const credits = await this.getCredits(userId);
    const debits = await this.getDebits(userId);
    return credits - debits;
  }

  private async getCredits(userId: number): Promise<number> {
    // Private helper logic
  }

  private async getDebits(userId: number): Promise<number> {
    // Private helper logic
  }
}

// 3. Inject in controller via interface
@Controller('balance')
export class BalanceController {
  constructor(
    private readonly calculateBalance: CalculateBalance,
  ) {}

  @Get()
  async getBalance(@Request() req) {
    return await this.calculateBalance.calculateBalance(req.user.userId);
  }
}
```

### Checklist

- [ ] Use-Cases implemented for complex business rules with multiple transactions
- [ ] Each use-case has single interface defining its contract
- [ ] Thin use-cases with 1 interface per class following ISP
- [ ] Controllers inject via interface, not concrete class
- [ ] Private helper methods extract complex logic
- [ ] Comprehensive documentation in ./how-to-create-use-case-backend.md consulted

### Troubleshooting

**Problem:** Business logic scattered across controllers and services making testing difficult.
**Solution:** Extract complex operations into dedicated Use-Case classes with clear interfaces.

**Problem:** Fat use-cases implementing multiple interfaces violating ISP.
**Solution:** Split into thin use-cases with 1 interface per class as documented in best practices.

**Problem:** Unclear when to use use-case vs service.
**Solution:** Use-cases for complex multi-step operations, services for simple CRUD.

### Best Practices

- Keep use-cases thin with single interface per class (Interface Segregation)
- Use for complex operations involving multiple transactions or entities
- Inject use-cases via interface in controllers for testability
- Extract helper logic into private methods within use-case
- Consult ./how-to-create-use-case-backend.md for complete implementation guide
- Place use-cases in module use-cases/ folder for organization
- Prefer use-cases over fat services for maintainable business logic

## [Repository Pattern - Data Access Abstraction]()

TypeORM repository pattern abstracts data access providing clean API for database operations without exposing SQL details. Inject Repository<Entity> using @InjectRepository decorator to leverage built-in methods like find, findOne, save, remove with type safety and query builder capabilities for complex queries.

### When to use?

Use TypeORM repositories for all database access operations including queries, inserts, updates, and deletes. Apply to every entity requiring persistence. Inject repositories into services and use-cases that need data access. Leverage query builder for complex joins and filtering beyond basic CRUD.

### When NOT to use?

Use raw queries only for extremely complex operations not feasible with query builder or performance-critical queries requiring hand-tuned SQL. For most cases, TypeORM repository and query builder provide sufficient capabilities with better type safety and maintainability.

### Example

Example demonstrating TypeORM repository injection and usage for querying products filtered by userId:

```typescript
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  async findAll(userId: number) {
    return await this.repository.find({
      where: { userId },
    });
  }
}
```

### Checklist

- [ ] Repository<Entity> injected using @InjectRepository decorator
- [ ] All database queries use repository methods instead of raw SQL
- [ ] TypeOrmModule.forFeature([Entity]) registered in module imports
- [ ] Complex queries use query builder for type safety

### Troubleshooting

**Problem:** Repository is undefined or cannot be injected.
**Solution:** Ensure entity is registered in TypeOrmModule.forFeature([Entity]) in module imports.

**Problem:** Need complex query beyond basic find operations.
**Solution:** Use repository.createQueryBuilder() for advanced queries with joins and conditions.

### Best Practices

- Inject repositories only in services and use-cases, never controllers
- Use repository methods (find, findOne, save, remove) for standard operations
- Leverage query builder for complex queries requiring joins
- Keep data access logic in repositories/services, not business logic
- Use repository transactions via manager for multi-operation atomicity

## [DTO Pattern - Input Validation and Data Transfer]()

Data Transfer Objects with class-validator decorators ensure type-safe input validation before processing. DTOs define expected structure of request bodies with validation rules using decorators like @IsString, @IsNumber, @Min, @IsNotEmpty. NestJS ValidationPipe automatically validates DTOs rejecting invalid requests with detailed error messages.

### When to use?

Define DTOs for all API endpoint inputs including POST bodies, PUT/PATCH updates, and complex query parameters. Use class-validator decorators to enforce business rules, data types, required fields, string formats, number ranges, and custom validations. Essential for every controller accepting user input.

### When NOT to use?

Skip DTOs for internal method parameters not crossing API boundaries. Simple GET endpoints with primitive parameters don't require DTOs. Only create DTOs for data crossing external boundaries where validation and documentation are essential.

### Example

Example showing CreateProductDto with validation decorators and controller usage with automatic validation:

```typescript
// DTO for input validation
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}

// Controller
@Post()
create(@Body() dto: CreateProductDto) {
  return this.service.create(dto);
}

// Service
async create(dto: CreateProductDto, userId: number) {
  const product = this.repository.create({
    ...dto,
    userId,
  });
  return await this.repository.save(product);
}
```

### Checklist

- [ ] DTOs defined for all API inputs using class-validator decorators
- [ ] ValidationPipe enabled globally or per endpoint
- [ ] Required fields marked with @IsNotEmpty decorator
- [ ] Type validation using @IsString, @IsNumber, @IsBoolean, etc
- [ ] Business rules enforced with @Min, @Max, @Length, etc

### Troubleshooting

**Problem:** Validation not running despite DTO decorators.
**Solution:** Enable ValidationPipe globally in main.ts or add to controller method.

**Problem:** Custom validation rules not supported by built-in decorators.
**Solution:** Create custom validator using @ValidatorConstraint and @Validate decorators.

### Best Practices

- Create separate DTOs for create and update operations when validation differs
- Use class-transformer decorators (@Transform, @Type) for data transformation
- Document validation rules in Swagger using @ApiProperty decorator
- Keep DTOs thin with only validation decorators and properties
- Validate nested objects using @ValidateNested and @Type decorators
- Export DTOs from dedicated dto/ folder within module

## [Strategy Pattern - Multiple Implementation Selector]()

Strategy pattern enables runtime selection between multiple algorithm implementations through interface-based abstraction. Define strategy interface, create concrete implementations for each algorithm, and use Map or factory to select appropriate strategy based on runtime conditions like payment method or report type.

### When to use?

Apply Strategy pattern when you have multiple implementations of same behavior selected at runtime such as payment methods (credit card, PIX, PayPal), notification channels (email, SMS, push), report formats (PDF, Excel, CSV), or pricing algorithms. Essential when adding new implementations without modifying existing code.

### When NOT to use?

Skip Strategy pattern when only single implementation exists with no foreseeable alternatives. Don't over-engineer simple conditional logic that won't expand. Use simple if/else for 2-3 static options without complex algorithms. Strategy adds complexity justified only by multiple swappable implementations.

### Example

Example showing payment strategy interface with credit card and PIX implementations selected via Map:

```typescript
// Strategy interface
export interface IPaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

// Concrete implementations
@Injectable()
export class CreditCardStrategy implements IPaymentStrategy {
  async process(amount: number) {
    // Process credit card payment
  }
}

@Injectable()
export class PixStrategy implements IPaymentStrategy {
  async process(amount: number) {
    // Process PIX payment
  }
}

// Service using strategies
@Injectable()
export class PaymentService {
  private strategies = new Map<string, IPaymentStrategy>();

  constructor(
    private creditCardStrategy: CreditCardStrategy,
    private pixStrategy: PixStrategy,
  ) {
    this.strategies.set('credit_card', this.creditCardStrategy);
    this.strategies.set('pix', this.pixStrategy);
  }

  async processPayment(method: string, amount: number) {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new BadRequestException('Invalid payment method');
    }
    return await strategy.process(amount);
  }
}
```

### Checklist

- [ ] Strategy interface defined with common method signatures
- [ ] Multiple concrete implementations of strategy interface
- [ ] Selection mechanism (Map, factory, or conditional) for choosing strategy
- [ ] Strategies injected via dependency injection
- [ ] Error handling for invalid strategy selection

### Troubleshooting

**Problem:** Adding new payment method requires modifying service logic.
**Solution:** Register new strategy in Map during construction without changing processPayment method.

**Problem:** Strategies have different constructor dependencies.
**Solution:** Inject all strategies in service constructor and register in Map.

### Best Practices

- Use Map for registry pattern enabling easy strategy addition
- Inject all strategies via constructor for proper DI lifecycle
- Define clear strategy interface with minimal required methods
- Validate strategy selection and throw meaningful exceptions
- Document available strategies and selection criteria
- Consider factory pattern for complex strategy instantiation

## [Factory Pattern - Complex Object Creation]()

Factory pattern centralizes complex object creation logic providing clean API for instantiating different types based on runtime parameters. Factories encapsulate conditionals and construction logic away from business code, returning interface types allowing implementation swapping without affecting consumers.

### When to use?

Use Factory pattern when object creation involves complex logic, conditional instantiation of different classes based on type parameter, or initialization requiring multiple steps. Essential for creating reports, documents, notifications, or any polymorphic objects requiring type-specific construction logic.

### When NOT to use?

Skip factories for simple object creation using 'new' or repository.create(). Don't create factories for objects without complex initialization or type variance. Use direct instantiation when creation logic is straightforward and unlikely to change or expand with new types.

### Example

Example showing ReportFactory creating different report types based on type parameter:

```typescript
@Injectable()
export class ReportFactory {
  createReport(type: string, data: any): IReport {
    switch (type) {
      case 'pdf':
        return new PdfReport(data);
      case 'excel':
        return new ExcelReport(data);
      case 'csv':
        return new CsvReport(data);
      default:
        throw new BadRequestException('Invalid report type');
    }
  }
}
```

### Checklist

- [ ] Factory encapsulates complex object creation logic
- [ ] Returns interface type, not concrete class
- [ ] Handles all supported types with clear error for invalid types
- [ ] Factory injectable via dependency injection
- [ ] Complex initialization logic hidden from consumers

### Troubleshooting

**Problem:** Adding new type requires modifying switch statement.
**Solution:** Consider using Strategy pattern with registry or Map-based factory.

**Problem:** Factory violates Open/Closed Principle.
**Solution:** Refactor to registry-based factory where types register themselves.

### Best Practices

- Return interface types to maintain abstraction
- Validate type parameter and throw descriptive exceptions
- Keep creation logic within factory, not scattered in services
- Consider dependency injection for created objects when needed
- Document supported types and expected data format
- Use for report generation, document creation, or polymorphic instantiation

## [Layered Architecture - HTTP Business Data Separation]()

Organize code into well-defined layers with clear boundaries: HTTP layer for routing, Business layer for logic, and Data layer for persistence. Controllers handle only HTTP concerns, services and use-cases contain business rules, repositories manage data access. This separation ensures maintainability, testability, and independent evolution of each layer.

### When to use?

Apply layered architecture to all NestJS modules for consistency and scalability. Use HTTP layer for request/response handling, Business layer for complex operations and simple CRUD, Data layer for database queries. Organize complex modules with use-cases folder, entities for models, and dto for validation following recommended structure.

### When NOT to use?

For extremely simple modules with only 1-2 files, strict folder separation may create unnecessary overhead. Small utility modules or shared components may use flatter structure. However, migrate to layered structure proactively as modules grow before complexity becomes unmanageable.

### Example

Example showing recommended module structure with use-cases for complex business logic and service for simple operations:

```
module/
├── module.controller.ts    # HTTP layer (routing only)
├── module.service.ts        # Business layer (simple CRUD)
├── use-cases/              # ⭐ Complex business rules
│   ├── interfaces.ts         # Interface segregation
│   ├── calculate-balance.usecase.ts
│   ├── process-payment.usecase.ts
│   └── generate-report.usecase.ts
├── entities/               # Data layer (TypeORM models)
├── dto/                    # Input/output validation
└── services/               # Auxiliary sub-services
```

### Checklist

- [ ] Controllers contain only HTTP routing logic, no business rules
- [ ] Complex business logic implemented in use-cases folder
- [ ] Simple CRUD operations remain in service layer
- [ ] Entities folder contains TypeORM models
- [ ] DTOs folder contains input/output validation classes
- [ ] Services folder contains auxiliary sub-services
- [ ] No circular dependencies between layers

### Troubleshooting

**Problem:** Module files exceeding 300 lines and becoming difficult to maintain.
**Solution:** Extract business logic into separate use-cases and break services into smaller sub-services.

**Problem:** Unclear where to place new functionality.
**Solution:** Follow layer rules: HTTP in controller, complex business in use-case, simple CRUD in service, data in repository.

**Problem:** Difficulty testing due to mixed responsibilities.
**Solution:** Ensure strict layer separation allowing isolated unit testing of each component.

### Best Practices

- Keep controllers thin - only routing and HTTP concerns
- Place complex business rules in use-cases, not services
- Use services for simple CRUD operations without complex orchestration
- Group related use-cases in use-cases folder with clear interfaces
- Maintain consistent naming: module.controller.ts, module.service.ts
- Consult ./backend-module-folder-structure.md for complete structure guidelines
- Reference ./how-to-create-use-case-backend.md for use-case implementation

## [Exception Handling - Standardized Error Responses]()

Use NestJS built-in exceptions for consistent error handling providing meaningful HTTP status codes and standardized response format. Throw NotFoundException for missing resources, BadRequestException for validation failures, ConflictException for constraint violations, UnauthorizedException for authentication failures. Proper exceptions improve debugging and client error handling.

### When to use?

Use NestJS exceptions for all error scenarios in services, use-cases, and controllers. Throw NotFoundException when resources don't exist, BadRequestException for invalid inputs, ConflictException for uniqueness violations, UnauthorizedException for auth failures, ForbiddenException for permission denials. Apply to every error condition requiring HTTP response.

### When NOT to use?

Avoid creating custom exception classes unless you have very specific error handling requirements not covered by NestJS built-ins. Don't throw generic Error objects losing automatic HTTP status code mapping and standardized response formatting. Use built-in exceptions for 99% of cases.

### Example

Example showing proper NestJS exception usage for not found and conflict scenarios with descriptive messages:

```typescript
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class ProductService {
  async findOne(id: number, userId: number) {
    const product = await this.repository.findOne({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto, userId: number) {
    const existing = await this.repository.findOne({
      where: { code: dto.code, userId },
    });

    if (existing) {
      throw new ConflictException('Product with this code already exists');
    }

    return await this.repository.save({ ...dto, userId });
  }
}
```

### Checklist

- [ ] All error scenarios throw appropriate NestJS exceptions
- [ ] Exception messages are descriptive and include context (IDs, resource names)
- [ ] NotFoundException used when resources are not found
- [ ] BadRequestException used for validation failures
- [ ] ConflictException used for uniqueness constraint violations
- [ ] UnauthorizedException used for authentication failures
- [ ] No generic Error objects thrown in business logic

### Troubleshooting

**Problem:** Clients receive 500 errors instead of specific HTTP status codes.
**Solution:** Ensure you're throwing NestJS exceptions, not generic Error objects.

**Problem:** Error messages expose sensitive implementation details.
**Solution:** Keep messages user-friendly while logging detailed errors server-side with Logger.

**Problem:** Inconsistent error response formats across endpoints.
**Solution:** Use only NestJS built-in exceptions for automatic standardized formatting.

### Best Practices

- Always include resource identifiers in error messages (e.g., "Product 123 not found")
- Use specific exceptions over generic ones for clarity
- Log errors with stack traces using NestJS Logger before throwing
- Validate business rules early and throw exceptions immediately
- Document expected exceptions in Swagger with @ApiResponse decorators
- Never expose database errors directly - wrap in appropriate exceptions
- Prefer descriptive messages that help clients understand the issue

## [Ownership Validation - Multi-Tenant Data Isolation]()

Security pattern ensuring users access only their own resources by filtering database queries with userId from authenticated request. Prevents unauthorized access by including userId in all where clauses for find, update, and delete operations. Return NotFoundException for both missing and unauthorized resources to avoid leaking resource existence.

### When to use?

Apply ownership validation to all protected endpoints operating on user-specific resources. Always filter database queries by userId for find, update, and delete operations. Critical for multi-tenant applications where users should only access their own data. Implement private helper methods for reusable ownership checks.

### When NOT to use?

Skip ownership validation only for public resources accessible to all users, admin endpoints with explicit cross-user access requirements, or system-level operations. Unauthenticated public endpoints don't require userId filtering. Document any exemptions with clear security justification.

### Example

Example showing private helper method validating ownership with userId filter returning NotFoundException for unauthorized access:

```typescript
@Injectable()
export class ProductService {
  // Private helper method for ownership validation
  private async findOneOrFail(id: number, userId: number) {
    const product = await this.repository.findOne({
      where: { id, userId }, // Filter by authenticated user
    });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  // Use in all methods requiring ownership
  async update(id: number, dto: UpdateProductDto, userId: number) {
    const product = await this.findOneOrFail(id, userId);

    Object.assign(product, dto);
    return await this.repository.save(product);
  }

  async remove(id: number, userId: number) {
    const product = await this.findOneOrFail(id, userId);
    return await this.repository.remove(product);
  }
}
```

### Checklist

- [ ] All protected endpoints filter queries by userId from authenticated request
- [ ] Private findOneOrFail helper method validates ownership
- [ ] Update operations verify ownership before modification
- [ ] Delete operations verify ownership before removal
- [ ] NotFoundException thrown when resource not found or unauthorized
- [ ] No direct access to resources without userId validation

### Troubleshooting

**Problem:** Users can access other users' data by guessing IDs.
**Solution:** Ensure all database queries include userId filter from authenticated request.

**Problem:** Ownership checks duplicated across multiple methods.
**Solution:** Extract into private helper method (findOneOrFail) and reuse consistently.

**Problem:** Unclear whether 404 is "not found" or "not authorized".
**Solution:** This is correct - return 404 for both to avoid leaking resource existence information.

### Best Practices

- Always include userId in where clause for protected resources
- Create private helper methods for ownership validation to avoid duplication
- Return 404 (NotFoundException) for both missing and unauthorized resources
- Extract userId from authenticated request object, never from request body
- Log unauthorized access attempts for security monitoring
- Document ownership requirements in API documentation
- Validate ownership before any state-changing operations

## [Database Transactions - Atomic Multi-Operation Safety]()

Database transactions ensure atomicity of operations involving multiple tables guaranteeing all succeed or all fail together preventing data inconsistency. Use TypeORM DataSource transaction method wrapping related database operations where all writes either commit together on success or rollback completely on failure.

### When to use?

Use database transactions when performing operations involving multiple related database writes that must all succeed or all fail atomically. Essential for creating parent-child records (orders with items), transferring between accounts, updating inventory with orders, or any multi-step database operation requiring consistency guarantees.

### When NOT to use?

Avoid transactions for single database operations or read-only queries. Don't use for operations involving external APIs or long-running processes as transactions lock database resources. Skip for independent operations that don't require atomicity. Keep transactions short to minimize lock contention.

### Example

Example showing TypeORM DataSource transaction for creating order with items ensuring atomic multi-table operation:

```typescript
import { DataSource } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemRepository: Repository<OrderItem>,
  ) {}

  async createOrder(dto: CreateOrderDto, userId: number) {
    // Execute in transaction - all or nothing
    return await this.dataSource.transaction(async (manager) => {
      // Create order
      const order = manager.create(Order, {
        userId,
        total: dto.total,
      });
      await manager.save(order);

      // Create items
      const items = dto.items.map(item =>
        manager.create(OrderItem, {
          ...item,
          orderId: order.id,
        })
      );
      await manager.save(items);

      return order;
    });
  }
}
```

### Checklist

- [ ] All multi-table write operations wrapped in transactions
- [ ] DataSource injected and used for transaction management
- [ ] Transaction callback uses manager parameter for all operations
- [ ] Related records created in correct order (parent before children)
- [ ] Foreign keys properly set within transaction
- [ ] No external API calls inside transaction blocks

### Troubleshooting

**Problem:** Partial data saved when operation fails midway.
**Solution:** Wrap all related operations in single transaction block to ensure atomicity.

**Problem:** Transaction deadlocks under concurrent load.
**Solution:** Keep transactions short, always acquire locks in same order, avoid external calls.

**Problem:** Cannot access entities saved in transaction from outside.
**Solution:** Return entities from transaction callback - they'll be available after commit.

### Best Practices

- Keep transaction blocks as short as possible to minimize lock duration
- Always use manager parameter inside transaction callback, not repositories
- Create parent entities before children to satisfy foreign key constraints
- Avoid calling external APIs inside transactions - do before or after
- Handle errors appropriately - transaction automatically rolls back on exception
- Log transaction start/end for debugging and monitoring
- Consider optimistic locking for concurrent updates
- Test transaction rollback behavior with integration tests

## [Strategic Logging - Observability and Debugging]()

Strategic logging at critical points using NestJS Logger service provides visibility into application behavior facilitating debugging and enabling monitoring. Log at service level with appropriate levels: log for informational messages, warn for non-critical issues, error for failures with stack traces including contextual information like userId and entityId.

### When to use?

Add logging to all critical operations including create/update/delete actions, external API calls, business rule validations, error scenarios, and performance-sensitive operations. Use log() for success cases, warn() for recoverable issues, and error() with stack traces for failures requiring investigation.

### When NOT to use?

Avoid logging in simple getters, trivial operations, or high-frequency read operations creating excessive noise. Don't log sensitive data like passwords, tokens, or PII. Skip logging in private helper methods already covered by public method logs. Use appropriate log levels to prevent log spam.

### Example

Example showing NestJS Logger usage with contextual information including userId and entityId:

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  async create(dto: CreateProductDto, userId: number) {
    this.logger.log(`Creating product for user ${userId}`);

    try {
      const product = await this.repository.save({ ...dto, userId });

      this.logger.log(`Product ${product.id} created successfully`);
      return product;

    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Checklist

- [ ] Logger instance created with class name for context
- [ ] Critical operations logged with relevant details
- [ ] Success cases use logger.log() with context
- [ ] Warnings use logger.warn() for recoverable issues
- [ ] Errors use logger.error() with message and stack trace
- [ ] Logs include userId, entityId, and operation context
- [ ] No sensitive data (passwords, tokens, PII) in logs

### Troubleshooting

**Problem:** Cannot identify which user triggered an error in production.
**Solution:** Always include userId in log messages for user-specific operations.

**Problem:** Log messages don't provide enough context to debug issues.
**Solution:** Include entity IDs, operation names, and relevant state information.

**Problem:** Too many logs making it hard to find important information.
**Solution:** Use appropriate log levels and avoid logging trivial operations or loops.

### Best Practices

- Create Logger instance with class name for proper context identification
- Include userId in all user-specific operation logs for traceability
- Include entity IDs when operating on specific records
- Use structured logging with consistent message formats
- Log before and after critical state changes
- Always include stack traces with error logs
- Use log levels appropriately: log (info), warn (recoverable), error (failure)
- Avoid logging in loops - summarize results instead
- Never log sensitive information - mask or exclude from logs

## [Implementation Verification Checklist]()

Comprehensive verification checklist ensuring all scalability best practices are applied including use-cases for complex logic, dependency injection, validation, error handling, transactions, logging, and documentation. Use this checklist before considering any implementation complete to verify all patterns and principles have been properly implemented.

### When to use?

Apply this checklist before submitting any implementation for review. Use as final verification step to ensure all scalability patterns and best practices have been implemented. Review checklist when refactoring existing code to identify improvement opportunities and missing patterns requiring implementation.

### When NOT to use?

Don't use this checklist as a step-by-step implementation guide - refer to specific pattern sections above for that. This is a verification tool, not a tutorial. Use after implementation is complete to validate compliance with all documented patterns and principles.

### Example

See checklist items below covering use-cases, service responsibilities, dependency injection, validation, error handling, transactions, logging, and documentation:

```markdown
- [ ] Use-Cases for complex business rules (see ./how-to-create-use-case-backend.md)
- [ ] One service = One responsibility (simple CRUD)
- [ ] Interface segregation (Use-Case Pattern)
- [ ] Dependency injection everywhere
- [ ] Validation with DTOs
- [ ] Error handling with appropriate exceptions
- [ ] Isolation by userId
- [ ] Transactions for atomic operations
- [ ] Logging at critical points
- [ ] Swagger documentation
- [ ] Type-safe code (TypeScript)
- [ ] English naming for classes, interfaces and methods
```

### Checklist

- [ ] **Use-Cases for complex business rules** (see ./how-to-create-use-case-backend.md)
- [ ] One service = One responsibility (simple CRUD)
- [ ] Interface segregation (Use-Case Pattern)
- [ ] Dependency injection everywhere
- [ ] Validation with DTOs
- [ ] Error handling with appropriate exceptions
- [ ] Isolation by userId
- [ ] Transactions for atomic operations
- [ ] Logging at critical points
- [ ] Swagger documentation
- [ ] Type-safe code (TypeScript)
- [ ] English naming for classes, interfaces and methods

### Troubleshooting

**Problem:** Checklist items unclear or ambiguous.
**Solution:** Refer to corresponding sections above for detailed explanations of each item.

**Problem:** Some checklist items don't apply to current implementation.
**Solution:** Mark N/A with explanation, but ensure you're not skipping applicable best practices.

### Best Practices

- Review checklist before submitting for code review
- Document any intentional deviations with rationale
- Use checklist during peer code reviews
- Update checklist based on project-specific requirements
- Refer to detailed sections for implementation guidance on each item

## [Quick Reference Guide - Essential Principles]()

Quick reference collection of the most important recommendations distilled from all sections above to help developers maintain scalable, maintainable code. These tips represent core principles that should guide all backend development decisions enabling consistent quality across the codebase.

### When to use?

Reference these tips when making design decisions, during code reviews, or when unsure about best approach. Use as quick mental checklist before implementing new features or refactoring existing code. Keep these principles in mind throughout development lifecycle for consistent quality.

### When NOT to use?

Don't rely solely on these tips without understanding the detailed sections above. Tips are reminders, not substitutes for comprehensive understanding of patterns and principles. Consult full documentation when implementing specific patterns or resolving complex architectural decisions.

### Example

Quick reference tips covering use-cases, simplicity, refactoring, interfaces, testing, and naming:

```markdown
1. Use Use-Cases for complex rules with multiple transactions
2. Prefer thin Use-Cases: 1 interface per use-case
3. Start simple without premature optimization
4. Refactor when files exceed 300 lines
5. Use interfaces to decouple implementations
6. Keep controllers thin with only routing logic
7. Service only for simple CRUD, complex rules in Use-Cases
8. Test in isolation using mocked interfaces
9. Document complex code with inline comments
10. Maintain consistency following project patterns
11. Use English naming for all code elements
```

### Checklist

- [ ] Use-Cases implemented for complex business rules with multiple transactions
- [ ] Code starts simple without premature optimization
- [ ] Refactoring performed when files exceed 300 lines
- [ ] Interfaces used to decouple implementations
- [ ] Controllers kept thin with only routing logic
- [ ] Tests written using mocked interfaces for isolation
- [ ] Complex code documented with inline comments
- [ ] English naming used consistently throughout

### Troubleshooting

**Problem:** Uncertain whether to create use-case or keep logic in service.
**Solution:** If multiple transactions or complex business logic, use use-case. Simple CRUD stays in service.

**Problem:** Code becoming difficult to maintain and test.
**Solution:** Refactor into smaller, focused classes following Single Responsibility Principle.

### Best Practices

1. **Use Use-Cases for complex rules**: Whenever there are multiple transactions or complex business logic
2. **Prefer thin Use-Cases**: 1 interface per use-case (see ./how-to-create-use-case-backend.md)
3. **Start simple**: Don't optimize prematurely
4. **Refactor when needed**: When exceeding 300 lines or complexity arises
5. **Use interfaces**: To decouple implementations (Use-Case Pattern)
6. **Avoid logic in controller**: Controller only routes, Use-Case processes
7. **Service only for simple CRUD**: Complex rules go in Use-Cases
8. **Test in isolation**: Mock interfaces, not concrete classes
9. **Inline docs**: Comment complex code
10. **Consistency**: Follow project patterns
11. **English naming**: Classes, interfaces and methods always in English

## [Additional Resources and Documentation]()

Curated collection of internal documentation and external resources for deeper learning about scalable implementation patterns, clean architecture principles, and NestJS best practices. Use these references to expand understanding beyond this guide with both project-specific and general software engineering resources.

### When to use?

Consult these references when you need deeper understanding of specific patterns, want to learn theoretical foundations, or need official documentation for NestJS features. Use internal references for project-specific implementation details and conventions. Reference external resources for general architectural concepts.

### When NOT to use?

Don't start with external references before reading this guide - they provide broader context but may not be project-specific. For immediate implementation guidance, always prioritize project documentation in .rules first. External resources provide foundational knowledge to support project patterns.

### Example

See links below including internal documentation for use-cases and external resources for NestJS, clean architecture, and SOLID:

```markdown
**Internal Project Documentation:**
- [Use-Cases in Backend](./how-to-create-use-case-backend.md)
- [Backend Module Folder Structure](./backend-module-folder-structure.md)

**External Resources:**
- [NestJS Best Practices](https://docs.nestjs.com/techniques/performance)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
```

### Checklist

- [ ] Internal project documentation consulted first (./how-to-create-use-case-backend.md)
- [ ] NestJS official docs referenced for framework-specific questions
- [ ] Clean Architecture principles understood for architectural decisions
- [ ] SOLID principles reviewed for design decisions
- [ ] Interface Segregation Principle applied for use-case design

### Troubleshooting

**Problem:** External resources contradict project patterns.
**Solution:** Project documentation in .rules takes precedence - external resources provide general guidance.

**Problem:** References seem outdated or no longer available.
**Solution:** Focus on internal documentation which is maintained for this project specifically.

### Best Practices

**Internal Project Documentation:**
- [Use-Cases in Backend](./how-to-create-use-case-backend.md) - Complete documentation on Use-Case Pattern
- [Backend Module Folder Structure](./backend-module-folder-structure.md) - Recommended folder organization

**External Resources:**
- [NestJS Best Practices](https://docs.nestjs.com/techniques/performance) - Official performance and scalability guide
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Foundational architecture principles
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID) - Core object-oriented design principles
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle) - ISP for use-case design
