# [How to Create Use-Cases in NestJS Backend]()

Comprehensive guide for implementing thin, focused Use-Cases following SOLID principles, interface segregation, and dependency injection for scalable NestJS backend development.

## [Core Use-Case Philosophy and Architecture]()

A Use-Case is a class implementing specific domain interfaces representing single business responsibilities. This design promotes high cohesion, low coupling, and enables comprehensive testing through dependency injection and interface segregation.

### When to use?

Use Use-Cases when implementing complex business logic involving multiple database operations, external API integrations, sophisticated validation rules, or orchestration between multiple services requiring high testability and maintainability.

### When NOT to use?

Avoid Use-Cases for simple CRUD operations, direct database reads/writes without business logic, trivial endpoints, or basic transformations. In these cases, keep logic in the standard service layer to avoid over-engineering.

### Example

Thin use-case implementing single interface with private helper methods for internal logic organization, keeping class under 100 lines focused on one business rule.

### Checklist

- [ ] Use-Case implements one interface (preferred) or max 2-3 related interfaces
- [ ] Each interface has only one public method
- [ ] Use-Case class is under 100-150 lines
- [ ] Private helper methods organize internal logic
- [ ] Dependencies injected through constructor
- [ ] Named in English with UseCase suffix
- [ ] Registered in module providers

### Troubleshooting

**Issue**: Use-Case becoming too large and complex
**Solution**: Split into multiple thin use-cases, each implementing single interface. Better to have many small files than few large ones.

**Issue**: Difficulty testing use-case
**Solution**: Ensure dependencies are injected as interfaces, making them easy to mock. Keep use-cases focused on single responsibility.

### Best Practices

Prefer one use-case per interface for maximum simplicity and testability. Keep use-cases thin (under 100 lines). Use private methods to organize complex logic. Name all interfaces, classes, and methods in English. Follow Interface Segregation Principle religiously.

## [Thin Use-Cases Design Pattern]()

The core philosophy emphasizes creating thin, focused use-cases where ONE use-case implements ONE interface. This results in many small files rather than few large files, maximizing testability, maintainability, and adherence to Single Responsibility Principle.

### When to use?

Always prefer thin single-interface use-cases as the default pattern. Create one use-case class per interface to maximize code clarity, reusability, composition, and independent evolution of each business rule.

### When NOT to use?

Avoid combining multiple interfaces except when they are extremely related (max 2-3). Never create fat use-cases with more than 5 interfaces as this violates Single Responsibility Principle and reduces testability.

### Example

Portfolio balance calculation use-case demonstrating single interface implementation with one public method and multiple private helper methods keeping class focused and under 100 lines.

```typescript
// Interface with a single responsibility
export interface CalculatePortfolioBalance {
  calculatePortfolioBalance(userId: number): Promise<BalanceResult>;
}

// Thin use-case implementing one interface
@Injectable()
export class CalculatePortfolioBalanceUseCase implements CalculatePortfolioBalance {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Public method from interface
  async calculatePortfolioBalance(userId: number): Promise<BalanceResult> {
    const assets = await this.getUserAssets(userId);
    const transactions = await this.getUserTransactions(userId);

    const totalInvested = this.calculateTotalInvested(transactions);
    const currentValue = this.calculateCurrentValue(assets);
    const profit = this.calculateProfit(currentValue, totalInvested);

    return {
      totalInvested,
      currentValue,
      profit,
      profitPercentage: (profit / totalInvested) * 100,
    };
  }

  // Private helper methods
  private async getUserAssets(userId: number): Promise<Asset[]> {
    return this.assetRepository.find({ where: { userId } });
  }

  private async getUserTransactions(userId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({ where: { userId } });
  }

  private calculateTotalInvested(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateCurrentValue(assets: Asset[]): number {
    return assets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
  }

  private calculateProfit(currentValue: number, totalInvested: number): number {
    return currentValue - totalInvested;
  }
}
```

### Checklist

- [ ] One use-case implements one interface (preferred)
- [ ] Class has only one public method from interface
- [ ] Private helper methods organize complex logic
- [ ] Class stays under 100-150 lines total
- [ ] Easy to test each method in isolation
- [ ] File name follows kebab-case.usecase.ts pattern
- [ ] Class name follows PascalCaseUseCase pattern

### Troubleshooting

**Issue**: Feeling overwhelmed by many small files
**Solution**: This is intentional and correct. Many small focused files (10-20 use-cases) are easier to navigate, test, and maintain than 2-3 large files.

**Issue**: Unclear how to split large use-case
**Solution**: Identify each distinct business rule or responsibility and extract to separate use-case with dedicated interface. Each interface method becomes its own use-case.

### Best Practices

Embrace many small files over few large files. Each use-case should represent exactly one business rule or responsibility. Use descriptive names matching business domain language. Keep classes under 100 lines. Private methods are encouraged for internal organization.

## [File Structure - Use-Cases Folder Organization]()

Recommended file organization pattern within modules emphasizing separate thin use-case files in dedicated use-cases folder. Each use-case gets its own file implementing single interface, with shared interfaces.ts file containing all interface definitions.

### When to use?

Always organize use-cases as separate thin files within the use-cases folder of each module. This structure maximizes code organization, testability, maintainability, and enables easy navigation through focused files.

### When NOT to use?

Avoid this pattern only in legacy codebases where migration cost is prohibitive. Never create single large files containing multiple use-cases as this defeats interface segregation and increases coupling.

### Example

Financial module structure showing multiple thin use-case files versus anti-pattern of single large file:

```
src/modules/financial/
├── financial.module.ts
├── financial.controller.ts
├── financial.service.ts
├── entities/
│   └── transaction.entity.ts
├── dto/
│   ├── create-transaction.dto.ts
│   └── calculate-balance.dto.ts
├── use-cases/
│   ├── interfaces.ts                           # All interfaces
│   ├── calculate-balance.usecase.ts            # Use-case 1
│   ├── process-investment.usecase.ts           # Use-case 2
│   ├── generate-report.usecase.ts              # Use-case 3
│   ├── validate-credit.usecase.ts              # Use-case 4
│   ├── calculate-interest.usecase.ts           # Use-case 5
│   ├── process-transfer.usecase.ts             # Use-case 6
│   └── apply-discount.usecase.ts               # Use-case 7
```

### Checklist

- [ ] use-cases folder exists in module
- [ ] interfaces.ts file contains all interface definitions
- [ ] Each use-case in separate file (kebab-case.usecase.ts)
- [ ] Use-case class name is PascalCaseUseCase
- [ ] Interface name is descriptive in English
- [ ] No large multi-use-case files
- [ ] Barrel exports (index.ts) for clean imports

### Troubleshooting

**Issue**: Too many files feels overwhelming in file explorer
**Solution**: This is intentional and correct. Use IDE search, barrel exports, and descriptive naming to navigate. Many small files are objectively better than few large files.

**Issue**: Finding the right use-case file
**Solution**: Use descriptive names matching interface purpose. Implement barrel exports. Leverage IDE fuzzy search. Consistent naming conventions aid discovery.

### Best Practices

Embrace many small files over few large files. Use consistent naming (kebab-case.usecase.ts). Keep interfaces.ts as single source of interface definitions per module. Export use-cases through barrel files for clean imports. Organize by business domain.

## [Naming Conventions for Use-Cases and Interfaces]()

All interfaces, classes, and methods must use English following TypeScript naming conventions and international development best practices. Consistent naming ensures code readability, maintainability, and compatibility with ecosystem.

### When to use?

Apply these naming conventions universally to all use-cases, interfaces, methods (public and private), and related files. Enforce during code reviews to maintain consistency across entire codebase.

### When NOT to use?

These naming conventions are mandatory with no exceptions. Never use Portuguese or other languages for code identifiers as this violates TypeScript ecosystem conventions and reduces international collaboration.

### Example

Naming pattern reference table:

| Item | Pattern | Example | Language |
|------|---------|---------|----------|
| Folder | `use-cases/` | Always singular | English |
| Interfaces file | `interfaces.ts` | Single file per module | English |
| Use-case file | `descriptive-name.usecase.ts` | kebab-case with `.usecase` suffix | English |
| Use-case class | `DescriptiveNameUseCase` | PascalCase with `UseCase` suffix | English |
| Interface | `ResponsibilityName` | PascalCase without I prefix | English |
| Public methods | `calculateBalance()` | camelCase describing action | English |
| Private methods | `getUserAssets()` | camelCase describing action | English |

### Checklist

- [ ] All interface names in English (CalculateBalance, ProcessInvestment)
- [ ] All class names in English with UseCase suffix (CalculateBalanceUseCase)
- [ ] All public methods in English (calculateBalance, processInvestment)
- [ ] All private methods in English (getUserAssets, calculateTotalInvested)
- [ ] File names in kebab-case with .usecase.ts suffix
- [ ] No Portuguese or non-English identifiers anywhere

### Troubleshooting

**Issue**: Team members using Portuguese in code
**Solution**: Enforce through code reviews, linting rules, and automated checks. Reject PRs with non-English identifiers. Document rationale clearly.

**Issue**: Legacy code has Portuguese names
**Solution**: Refactor incrementally. Apply English naming to all new code. Plan migration sprints for critical legacy components.

### Best Practices

Always use English for all code identifiers without exception. Follow TypeScript ecosystem conventions (camelCase for methods, PascalCase for classes/interfaces). Use descriptive names indicating action or responsibility. Avoid abbreviations except well-known acronyms.

## [Interface Design and Interface Segregation Principle]()

Each interface must have exactly one method representing single responsibility. This follows Interface Segregation Principle ensuring clients depend only on methods they use, maximizing testability and reducing coupling.

### When to use?

Always design interfaces with single methods when creating use-case contracts. This pattern applies universally to all business logic interfaces requiring high testability and clear separation of concerns.

### When NOT to use?

Never combine multiple methods into single interface even if they seem related. Each distinct business operation deserves its own interface for maximum flexibility and substitutability.

### Example

Correct single-method interfaces versus incorrect multi-method interface:

```typescript
// ❌ Wrong: Interface with multiple responsibilities
export interface FinancialOperations {
  calculateBalance(userId: number): Promise<number>;
  processInvestment(userId: number, amount: number): Promise<boolean>;
  generateReport(userId: number): Promise<any>;
}

// ✅ Correct: Segregated interfaces with single methods
export interface CalculateBalance {
  calculateBalance(userId: number): Promise<number>;
}

export interface ProcessInvestment {
  processInvestment(userId: number, amount: number): Promise<boolean>;
}

export interface GenerateReport {
  generateReport(userId: number): Promise<any>;
}
```

### Checklist

- [ ] Each interface has exactly one method
- [ ] Interface name describes single responsibility
- [ ] Method name clearly indicates action
- [ ] Parameters are explicitly typed
- [ ] Return type is always specified (including Promise)
- [ ] Interface documented with JSDoc comments

### Troubleshooting

**Issue**: Tempted to group related methods in single interface
**Solution**: Resist this temptation. Separate interfaces enable independent testing, flexible composition, and adherence to SOLID principles.

**Issue**: Clients need multiple interfaces
**Solution**: Use TypeScript intersection types (&) to combine interfaces at injection point without violating Interface Segregation Principle.

### Best Practices

One interface equals one method always. Use descriptive names indicating action (verb in infinitive). Explicitly type all parameters and returns. Document interfaces with JSDoc. Never use 'I' prefix for interfaces.

## [Step-by-Step Implementation - Define Interfaces]()

First step in use-case implementation involves defining all module interfaces in centralized interfaces.ts file. Each interface represents single business responsibility with one method, using English naming and explicit typing.

### When to use?

Begin every use-case implementation by defining interfaces first. This clarifies responsibilities, establishes contracts, and guides implementation ensuring SOLID principles compliance from the start.

### When NOT to use?

Never skip interface definition step. Starting with implementation before defining interfaces leads to poor separation of concerns and violates Interface Segregation Principle.

### Example

Financial module interfaces demonstrating single-method pattern:

```typescript
// src/modules/financeiro/use-cases/interfaces.ts

// Each interface represents ONE responsibility
// Each interface has ONLY ONE method

export interface CalculateCurrentBalance {
  calculateCurrentBalance(userId: number): Promise<number>;
}

export interface CalculateMonthlyReturn {
  calculateMonthlyReturn(userId: number, month: number, year: number): Promise<number>;
}

export interface ProcessInvestment {
  processInvestment(
    userId: number,
    amount: number,
    type: string,
  ): Promise<{ success: boolean; transactionId: number }>;
}

export interface GenerateFinancialReport {
  generateFinancialReport(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    initialBalance: number;
    finalBalance: number;
    income: number;
    expenses: number;
  }>;
}
```

### Checklist

- [ ] interfaces.ts file created in use-cases folder
- [ ] Each interface has descriptive name in English
- [ ] Each interface has exactly one method
- [ ] Method names use camelCase verbs
- [ ] All parameters explicitly typed
- [ ] All return types specified (including Promise)
- [ ] JSDoc comments document interface purpose

### Troubleshooting

**Issue**: Unclear how to name interface
**Solution**: Use verb describing business action (Calculate, Process, Generate, Validate, Execute). Name should clearly indicate what operation performs.

**Issue**: Return type is complex
**Solution**: Define explicit type or interface for return object. Avoid 'any'. Use structured types for clarity and type safety.

### Best Practices

Define all module interfaces in single interfaces.ts file. Start with interface design before implementation. Use verb-based names indicating action. Explicitly type everything. Document with JSDoc comments. Review interfaces for Single Responsibility adherence.

## [Step-by-Step Implementation - Create Use-Case Class]()

Second step involves implementing use-case class with Injectable decorator, constructor dependency injection, and methods implementing defined interfaces. Prefer single-interface use-cases for maximum focus and testability.

### When to use?

Create use-case class after defining interfaces, injecting all required dependencies through constructor. Implement interface methods as public and use private helper methods for complex internal logic.

### When NOT to use?

Never create use-case without proper dependency injection. Avoid implementing more than 3 interfaces unless absolutely necessary. Don't create use-cases for simple CRUD operations.

### Example

Financial rules use-case implementing multiple interfaces (note: prefer single-interface use-cases when possible):

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from '../entities/transacao.entity';
import {
  CalculateCurrentBalance,
  CalculateMonthlyReturn,
  ProcessInvestment,
  GenerateFinancialReport
} from './interfaces';

@Injectable()
export class FinancialRulesUseCase
  implements
    CalculateCurrentBalance,
    CalculateMonthlyReturn,
    ProcessInvestment,
    GenerateFinancialReport
{
  constructor(
    @InjectRepository(Transacao)
    private readonly transacaoRepository: Repository<Transacao>,
  ) {}

  async calculateCurrentBalance(userId: number): Promise<number> {
    const credits = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'credito' })
      .getRawOne();

    const debits = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(transacao.valor)', 'total')
      .where('transacao.userId = :userId', { userId })
      .andWhere('transacao.tipo = :tipo', { tipo: 'debito' })
      .getRawOne();

    return (credits?.total || 0) - (debits?.total || 0);
  }

  // ... other interface implementations
}
```

### Checklist

- [ ] @Injectable() decorator applied
- [ ] Class name follows PascalCaseUseCase pattern
- [ ] Implements one (preferred) or max 2-3 interfaces
- [ ] Dependencies injected through constructor
- [ ] All injected dependencies use @Inject decorators when needed
- [ ] Public methods implement interface contracts
- [ ] Private helper methods organize complex logic
- [ ] Class stays under 100-150 lines

### Troubleshooting

**Issue**: Use-case growing too large
**Solution**: Split into multiple single-interface use-cases. Extract private methods to separate helper classes or services if needed.

**Issue**: Dependency injection failing
**Solution**: Ensure @Injectable() decorator present, dependencies registered in module providers, and using correct injection tokens.

### Best Practices

Keep use-cases thin by implementing minimal interfaces. Use private methods to organize internal logic. Inject dependencies through constructor only. Follow English naming conventions. Maintain single responsibility. Test each method thoroughly.

## [Step-by-Step Implementation - Register in Module]()

Third step requires registering use-case in module providers array to enable NestJS dependency injection. Export use-case if needed by other modules, ensuring proper encapsulation and module boundaries.

### When to use?

Immediately register use-case in module providers after creating the class. This enables dependency injection and makes use-case available to controllers, services, and other module components.

### When NOT to use?

Never skip module registration or use-case won't be injectable. Only export use-cases that truly need to be consumed by other modules to maintain proper encapsulation.

### Example

Module registration demonstrating use-case provider and export:

```typescript
// src/modules/financeiro/financeiro.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { Transacao } from './entities/transacao.entity';
import { FinancialRulesUseCase } from './use-cases/regras-financeiras.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Transacao])],
  controllers: [FinanceiroController],
  providers: [
    FinanceiroService,
    FinancialRulesUseCase, // Register the Use-Case
  ],
  exports: [
    FinanceiroService,
    FinancialRulesUseCase, // Export if other modules need it
  ],
})
export class FinanceiroModule {}
```

### Checklist

- [ ] Use-case class imported in module file
- [ ] Use-case added to providers array
- [ ] Use-case added to exports array only if needed externally
- [ ] All use-case dependencies also registered in module
- [ ] Module imports required TypeORM entities or other dependencies
- [ ] Module compiles without errors

### Troubleshooting

**Issue**: Cannot resolve dependencies error
**Solution**: Ensure all dependencies used by use-case are registered in module providers or imported from other modules.

**Issue**: Circular dependency warning
**Solution**: Use forwardRef() or restructure module dependencies to break circular references.

### Best Practices

Register use-cases in module immediately after creation. Only export what's truly needed by other modules. Import all required dependencies (TypeORM entities, services). Keep module organization clean and focused. Verify dependency injection works before proceeding.

## [Step-by-Step Implementation - Inject in Service or Controller]()

Final step involves injecting use-case through constructor dependency injection in services or controllers. Prefer injecting via interface types for better testability and mock substitution during testing.

### When to use?

Inject use-cases in services or controllers to execute business logic. Services provide additional orchestration layer while controllers expose use-cases directly through API endpoints.

### When NOT to use?

Avoid injecting use-cases in other use-cases as this creates tight coupling. Use services or dedicated orchestrator classes for composing multiple use-cases.

### Example

Service and controller injection patterns:

```typescript
// Option A: Inject in Service (Recommended)
import { Injectable } from '@nestjs/common';
import { FinancialRulesUseCase } from './use-cases/regras-financeiras.usecase';
import { CalculateCurrentBalance } from './use-cases/interfaces';

@Injectable()
export class FinanceiroService {
  constructor(
    // Inject via interface intersection for testing
    private readonly financialRules: CalculateCurrentBalance & FinancialRulesUseCase,
  ) {}

  async getBalance(userId: number): Promise<{ balance: number }> {
    const balance = await this.financialRules.calculateCurrentBalance(userId);
    return { balance };
  }
}

// Option B: Inject directly in Controller
import { Controller, Get, Request } from '@nestjs/common';
import { FinancialRulesUseCase } from './use-cases/regras-financeiras.usecase';

@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private readonly financialRules: FinancialRulesUseCase,
  ) {}

  @Get('balance')
  async getBalance(@Request() req) {
    return await this.financialRules.calculateCurrentBalance(req.user.userId);
  }
}
```

### Checklist

- [ ] Use-case injected through constructor
- [ ] Injection uses interface intersection type (Interface & ConcreteClass)
- [ ] Private readonly modifier applied to injected dependency
- [ ] Descriptive variable name used for injected use-case
- [ ] Methods called on use-case follow interface contracts
- [ ] Error handling implemented around use-case calls

### Troubleshooting

**Issue**: Cannot inject interface (runtime error)
**Solution**: TypeScript interfaces don't exist at runtime. Use intersection type (Interface & ConcreteClass) or inject concrete class directly.

**Issue**: Use-case methods not accessible
**Solution**: Ensure proper type declaration and that use-case class actually implements the interface methods.

### Best Practices

Inject via interface intersection for testability. Use descriptive variable names matching business domain. Handle errors appropriately. Prefer service layer for complex orchestration. Controllers should be thin, delegating to services or use-cases.

## [SOLID Principles - Single Responsibility Principle]()

Each interface represents exactly one responsibility ensuring that when a business requirement changes, only one interface and its implementations are affected. This minimizes ripple effects and maintains code stability.

### When to use?

Apply Single Responsibility Principle universally when designing interfaces and use-cases. Each interface should have one reason to change corresponding to single business responsibility.

### When NOT to use?

Single Responsibility Principle always applies - there are no scenarios where mixing multiple responsibilities in single interface is acceptable or beneficial.

### Example

Correct segregated interfaces versus incorrect multi-responsibility interface:

```typescript
// ❌ Wrong: Interface with multiple responsibilities
export interface FinancialOperations {
  calculateBalance(userId: number): Promise<number>;
  processInvestment(userId: number, amount: number): Promise<boolean>;
  generateReport(userId: number): Promise<any>;
}

// ✅ Correct: Segregated interfaces each with single responsibility
export interface CalculateBalance {
  calculateBalance(userId: number): Promise<number>;
}

export interface ProcessInvestment {
  processInvestment(userId: number, amount: number): Promise<boolean>;
}

export interface GenerateReport {
  generateReport(userId: number): Promise<any>;
}
```

### Checklist

- [ ] Each interface has exactly one method
- [ ] Interface name clearly describes single responsibility
- [ ] Changes to one business rule affect only one interface
- [ ] No interface combines unrelated operations
- [ ] Use-cases implement minimal number of interfaces

### Troubleshooting

**Issue**: Unclear if operations belong in one or separate interfaces
**Solution**: Ask "do these operations change for the same business reason?" If not, separate them into distinct interfaces.

**Issue**: Many interfaces feels excessive
**Solution**: Many focused interfaces are better than few bloated ones. This is correct application of SRP.

### Best Practices

One interface equals one responsibility. Each interface has single method. Interface names describe specific business capability. Separate interfaces even for related operations. Embrace many small focused interfaces.

## [SOLID Principles - Open Closed Principle]()

Use-Cases are open for extension through adding new interfaces and implementations but closed for modification of existing code. This enables adding functionality without breaking existing tested code.

### When to use?

Apply Open/Closed Principle when extending functionality by creating new use-cases or interfaces rather than modifying existing ones. Use inheritance or composition to extend behavior.

### When NOT to use?

Open/Closed doesn't mean never modify code - bugs and improvements require changes. Principle guides adding new features without breaking existing functionality.

### Example

Extending functionality without modifying existing use-case:

```typescript
// Add new functionality without modifying existing Use-Case
export interface ValidateCredit {
  validateCredit(userId: number, amount: number): Promise<boolean>;
}

// Create new Use-Case or extend existing one
export class AdvancedFinancialRulesUseCase
  extends FinancialRulesUseCase
  implements ValidateCredit
{
  async validateCredit(userId: number, amount: number): Promise<boolean> {
    const balance = await this.calculateCurrentBalance(userId);
    return balance >= amount;
  }
}
```

### Checklist

- [ ] New features added through new interfaces
- [ ] New implementations extend rather than modify
- [ ] Existing code remains unchanged when adding features
- [ ] Inheritance or composition used for extensions
- [ ] Tests for existing code don't require changes

### Troubleshooting

**Issue**: Need to change existing use-case behavior
**Solution**: For new features, create new use-case or extend existing. For bugs, modify existing code but update tests.

**Issue**: Extension creates duplication
**Solution**: Extract common logic to protected methods or separate helper services that both implementations use.

### Best Practices

Add new functionality through new classes and interfaces. Extend existing use-cases via inheritance when appropriate. Protect existing tested code from modification. Use composition over modification. Maintain backward compatibility.

## [SOLID Principles - Liskov Substitution Principle]()

Any implementation of an interface can replace another without breaking the code. This ensures polymorphism and substitutability enabling flexible testing through mock implementations and runtime strategy switching.

### When to use?

Apply Liskov Substitution when designing interface contracts ensuring all implementations honor the contract's semantic meaning and preconditions/postconditions expected by clients.

### When NOT to use?

Liskov Substitution always applies when using interfaces and inheritance. Violations create subtle bugs where substituted implementations break client expectations.

### Example

Multiple substitutable implementations of same interface:

```typescript
// Multiple implementations of the same interface
export class FinancialRulesUseCase implements CalculateCurrentBalance {
  async calculateCurrentBalance(userId: number): Promise<number> {
    // Standard implementation using database
  }
}

export class CachedFinancialRulesUseCase implements CalculateCurrentBalance {
  async calculateCurrentBalance(userId: number): Promise<number> {
    // Implementation with cache layer
    // Still returns same type and honors same contract
  }
}

// Client code works with any implementation
export class BalanceService {
  constructor(private readonly calculator: CalculateCurrentBalance) {}

  async getBalance(userId: number) {
    // Works with any implementation
    return await this.calculator.calculateCurrentBalance(userId);
  }
}
```

### Checklist

- [ ] All implementations honor interface contract
- [ ] Return types match exactly across implementations
- [ ] Preconditions consistent across implementations
- [ ] Postconditions consistent across implementations
- [ ] Implementations can be swapped without client changes
- [ ] No implementation throws unexpected exceptions

### Troubleshooting

**Issue**: Different implementations behave differently
**Solution**: Ensure all implementations honor semantic contract, not just type signature. Document expected behavior in interface.

**Issue**: Client code breaks when swapping implementations
**Solution**: Implementation violates LSP. Review contract expectations and ensure all implementations honor them.

### Best Practices

Design interfaces with clear contracts. Document semantic expectations beyond type signatures. Ensure all implementations are truly substitutable. Test swapping implementations. Avoid implementation-specific behavior in clients.

## [SOLID Principles - Interface Segregation Principle]()

Clients should not depend on methods they don't use. Each interface has only one method ensuring dependencies are minimal and focused, reducing coupling and improving testability.

### When to use?

Apply Interface Segregation universally when designing interfaces. Controllers and services should inject only interfaces with methods they actually use, not large interface bundles.

### When NOT to use?

Interface Segregation always applies - there are no scenarios where forcing clients to depend on unused methods is beneficial or acceptable.

### Example

Controller depending only on needed interface:

```typescript
// ✅ Controller only needs to calculate balance
export class BalanceController {
  constructor(private readonly calculateBalance: CalculateCurrentBalance) {}

  @Get('balance')
  async getBalance(@Request() req) {
    // Doesn't have access to unnecessary methods
    // Only has calculateCurrentBalance available
    return await this.calculateBalance.calculateCurrentBalance(req.user.userId);
  }
}

// Controller needing multiple operations uses intersection type
export class FinancialController {
  constructor(
    private readonly operations: CalculateCurrentBalance & ProcessInvestment
  ) {}
}
```

### Checklist

- [ ] Each interface has one method only
- [ ] Clients inject only interfaces they use
- [ ] No client depends on unused methods
- [ ] Large interfaces split into focused smaller ones
- [ ] Intersection types combine needed interfaces at injection point

### Troubleshooting

**Issue**: Client needs multiple related operations
**Solution**: Use TypeScript intersection types (&) to combine multiple single-method interfaces at injection point.

**Issue**: Interface has multiple related methods
**Solution**: Split into separate single-method interfaces even if methods seem related. Use intersection types where multiple needed.

### Best Practices

One method per interface always. Clients inject minimal required interfaces. Use intersection types to combine interfaces. Never create fat interfaces. Keep interfaces focused and segregated. Design from client perspective.

## [SOLID Principles - Dependency Inversion Principle]()

High-level modules depend on abstractions (interfaces) not concrete implementations. This enables testability through mock injection, reduces coupling, and allows swapping implementations without changing dependent code.

### When to use?

Apply Dependency Inversion universally by injecting interface types rather than concrete classes. This is fundamental to testability and loose coupling in use-case architecture.

### When NOT to use?

Always depend on abstractions when possible. Only inject concrete classes when TypeScript runtime limitations require it, using intersection types to maintain interface dependency.

### Example

Correct abstraction dependency versus incorrect concrete dependency:

```typescript
// ✅ Correct: Depends on interface (abstraction)
export class FinanceiroService {
  constructor(
    private readonly calculateBalance: CalculateCurrentBalance, // Interface
  ) {}
}

// ✅ Acceptable: Intersection type for runtime injection
export class FinanceiroService {
  constructor(
    private readonly calculator: CalculateCurrentBalance & CalculateBalanceUseCase,
  ) {}
}

// ❌ Wrong: Depends on concrete implementation
export class FinanceiroService {
  constructor(
    private readonly financialRules: FinancialRulesUseCase, // Concrete class
  ) {}
}
```

### Checklist

- [ ] Dependencies injected as interfaces
- [ ] No direct instantiation of dependencies
- [ ] Constructor injection used exclusively
- [ ] Concrete classes only at composition root
- [ ] Easy to substitute mocks for testing
- [ ] No coupling to concrete implementation details

### Troubleshooting

**Issue**: Cannot inject interface at runtime
**Solution**: TypeScript interfaces don't exist at runtime. Use intersection type (Interface & ConcreteClass) to maintain abstraction while enabling injection.

**Issue**: Difficult to test due to concrete dependencies
**Solution**: Refactor to inject interfaces. This enables easy mock substitution and isolated unit testing.

### Best Practices

Depend on abstractions not concretions. Inject interfaces through constructor. Use intersection types for runtime compatibility. Design modules around interface contracts. Enable easy mock substitution for testing.

## [Testing Use-Cases with Jest]()

Use-Cases require comprehensive unit tests with mocked dependencies to ensure isolated testing of business logic. Tests should cover success scenarios, edge cases, error handling using Jest framework with arrange-act-assert pattern.

### When to use?

Write comprehensive unit tests for every use-case immediately after implementation covering all public methods, edge cases, error scenarios ensuring 100% code coverage through proper mocking.

### When NOT to use?

Never skip use-case testing. These are critical business logic components requiring thorough test coverage. Integration tests complement but don't replace use-case unit tests.

### Example

Complete use-case testing guide available in dedicated documentation file with templates and practical examples.

### Checklist

- [ ] Test file created (*.usecase.spec.ts)
- [ ] All dependencies mocked properly
- [ ] Success scenarios tested
- [ ] Error cases tested thoroughly
- [ ] Edge cases covered
- [ ] 100% code coverage achieved
- [ ] Arrange-Act-Assert pattern followed
- [ ] Tests are isolated and independent

### Troubleshooting

**Issue**: Difficult to mock dependencies
**Solution**: Ensure dependencies injected as interfaces. Use Jest's jest.fn() and mockImplementation for clean mocks. Review dependency injection configuration.

**Issue**: Low code coverage
**Solution**: Test all branches including error handling, edge cases, and private method logic paths. Use coverage reports to identify untested code.

### Best Practices

Test every use-case thoroughly. Mock all external dependencies. Follow AAA pattern consistently. Test both success and failure paths. Aim for 100% coverage. Keep tests readable and maintainable.

**📖 For complete Use-Case testing guide, see**: `./how-to-test-use-cases-jest-backend.md`

The referenced guide contains:
- Complete Jest configuration
- Test templates and examples
- Mocking repositories, HttpService, ConfigService
- Arrange-Act-Assert patterns
- Exception and error case testing
- Achieving 100% code coverage

## [Traditional Service vs Use-Case Pattern Comparison]()

Side-by-side analysis contrasting traditional service-based architecture with Use-Case-driven design highlighting differences in responsibility distribution, coupling levels, testability, and dependency management for informed architectural decisions.

### When to use?

Reference this comparison when deciding between traditional service methods and use-case pattern, explaining architecture to team members, or evaluating existing code for refactoring opportunities.

### When NOT to use?

Don't treat this as absolute rules - both patterns have their place. Simple CRUD legitimately belongs in services while complex business logic benefits from use-cases.

### Example

Comparison table and code examples demonstrating both architectural approaches:

| Aspect | Traditional Service | Use-Case |
|--------|-------------------|----------|
| **When to use** | Simple CRUD, direct operations | Complex rules, multiple transactions |
| **Responsibility** | Multiple operations in same service | One interface = one responsibility |
| **Testability** | Need to mock entire service | Mock only the necessary interface |
| **Dependencies** | Depends on concrete class | Depends on interfaces (abstractions) |
| **Coupling** | More coupled | Low coupling |
| **Example** | `UserService.findAll()` | `CalculateBalanceUseCase.calculateBalance()` |

### Checklist

- [ ] Simple CRUD remains in traditional service
- [ ] Complex logic extracted to use-cases
- [ ] Decision documented for each complex operation
- [ ] Team aligned on when to use each pattern
- [ ] Refactoring plan for misplaced logic
- [ ] Consistent patterns across codebase

### Troubleshooting

**Issue**: Everything becoming use-case (over-engineering)
**Solution**: Keep simple CRUD in services. Use use-cases only for complex multi-step operations requiring high testability.

**Issue**: Complex logic buried in services
**Solution**: Refactor complex operations to use-cases for better testability and separation of concerns.

### Best Practices

Use traditional services for simple CRUD operations. Apply use-case pattern for complex business logic. Don't force everything into use-cases. Maintain consistent patterns across codebase. Document architectural decisions clearly.

## [Use-Case Best Practices and Guidelines]()

Essential guidelines for creating maintainable Use-Cases: one interface per method, descriptive English naming, type aliases for combinations, preferring single-interface use-cases ensuring code remains modular, testable, and aligned with SOLID principles.

### When to use?

Apply these best practices universally when creating any use-case, during code reviews, when refactoring existing code, or establishing coding standards for development team.

### When NOT to use?

These are mandatory best practices not optional guidelines. There are no scenarios where you should deviate from these standards as they ensure code quality and maintainability.

### Example

Numbered best practices with code examples demonstrating correct and incorrect patterns including naming conventions, interface design, and use-case sizing.

### Checklist

- [ ] One interface = one method
- [ ] Names in English (interfaces, classes, methods)
- [ ] Use-case implements 1 interface (preferred) or max 2-3
- [ ] Type aliases used for interface combinations
- [ ] Interfaces well-documented with JSDoc
- [ ] Use-case file under 100-150 lines
- [ ] Private helper methods for complex logic

### Troubleshooting

**Issue**: Team not following best practices
**Solution**: Implement linting rules, code review checklist, automated formatting. Reference this guide in PR templates. Provide training sessions.

**Issue**: Legacy code doesn't follow standards
**Solution**: Refactor incrementally. Apply standards to all new code. Plan migration sprints for critical legacy components. Document migration strategy.

### Best Practices

Treat these as non-negotiable standards. Enforce through code review and automation. Keep use-cases thin and focused. Use English naming universally. Document interfaces clearly. Prefer many small files over few large files.

**Golden Rules:**

1. **One Interface = One Method**: Never combine multiple methods in single interface
2. **English Naming**: All interfaces, classes, methods in English following TypeScript conventions
3. **Thin Use-Cases**: Prefer 1 interface per use-case, maximum 2-3 related interfaces
4. **Type Aliases**: Use intersection types when combining interfaces at injection point
5. **Documentation**: Document interfaces with JSDoc describing business purpose

## [Complete Implementation Example - Orders Module]()

End-to-end implementation demonstrating real-world use-case pattern in orders module including interface definitions, use-case implementation with multiple responsibilities, and controller integration showcasing practical application of all concepts.

### When to use?

Reference this complete example when setting up new modules with use-cases, as template for consistent implementation across project, or when teaching use-case pattern to team members.

### When NOT to use?

Don't blindly copy this example - adapt to your specific domain and requirements. This demonstrates multi-interface use-case; prefer single-interface use-cases when possible for simplicity.

### Example

Complete orders module implementation showing interfaces, use-case class, and controller integration:

```typescript
// Interfaces
export interface CreateOrder {
  createOrder(userId: number, items: OrderItem[]): Promise<Order>;
}

export interface ValidateInventory {
  validateInventory(items: OrderItem[]): Promise<boolean>;
}

export interface CalculateOrderTotal {
  calculateOrderTotal(items: OrderItem[]): Promise<number>;
}

export interface ApplyDiscount {
  applyDiscount(total: number, coupon?: string): Promise<number>;
}

// Use-Case Implementation
@Injectable()
export class ProcessOrderUseCase
  implements CreateOrder, ValidateInventory, CalculateOrderTotal, ApplyDiscount
{
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async validateInventory(items: OrderItem[]): Promise<boolean> {
    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product || product.inventory < item.quantity) {
        return false;
      }
    }
    return true;
  }

  async calculateOrderTotal(items: OrderItem[]): Promise<number> {
    let total = 0;
    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  }

  async applyDiscount(total: number, coupon?: string): Promise<number> {
    if (!coupon) return total;
    const discount = 0.1; // 10% example
    return total * (1 - discount);
  }

  async createOrder(userId: number, items: OrderItem[]): Promise<Order> {
    const validInventory = await this.validateInventory(items);
    if (!validInventory) {
      throw new BadRequestException('Insufficient inventory');
    }

    const total = await this.calculateOrderTotal(items);
    const order = this.orderRepository.create({
      userId,
      total,
      status: 'pending',
      items: JSON.stringify(items),
    });

    return await this.orderRepository.save(order);
  }
}

// Controller Integration
@Controller('orders')
export class OrderController {
  constructor(private readonly processOrder: ProcessOrderUseCase) {}

  @Post()
  async create(@Body() dto: CreateOrderDto, @Request() req) {
    return await this.processOrder.createOrder(req.user.userId, dto.items);
  }
}
```

### Checklist

- [ ] Interfaces clearly defined with single methods
- [ ] Use-case implements all required interfaces
- [ ] Dependencies injected via constructor
- [ ] Business logic well-organized with helper methods
- [ ] Controller delegates to use-case
- [ ] All names in English following conventions
- [ ] Follows project architectural patterns
- [ ] Error handling implemented appropriately

### Troubleshooting

**Issue**: Example doesn't match my domain
**Solution**: Adapt pattern to your specific domain. Focus on principles (interface segregation, dependency injection) rather than specific implementation details.

**Issue**: Example has multiple interfaces per use-case
**Solution**: This shows it's acceptable for related interfaces. However, prefer splitting into multiple single-interface use-cases when feasible for better focus.

### Best Practices

Use as reference not rigid template. Adapt to specific domain needs. Prefer simpler single-interface use-cases when possible. Ensure all implementations follow project standards. Keep examples updated as patterns evolve.

## [Common Implementation Problems and Solutions]()

Solutions for frequent implementation challenges including dependency resolution errors, circular dependencies, and oversized use-cases helping resolve common NestJS and TypeScript issues when working with use-cases.

### When to use?

Reference this section when encountering errors during use-case implementation, dependency injection failures, circular dependency warnings, or when use-cases become too large and unwieldy.

### When NOT to use?

If issue is not listed here consult NestJS official documentation, TypeScript documentation, or project-specific troubleshooting guides. Add new patterns here as they're discovered by team.

### Example

Specific error scenarios with detailed solutions:

**Error: "Cannot resolve dependency"**

Problem: NestJS cannot resolve the interface dependency.

Solution: TypeScript interfaces are removed at runtime. Inject the concrete class:

```typescript
// ❌ Doesn't work: Interface doesn't exist at runtime
constructor(private readonly calc: CalculateBalance) {}

// ✅ Works: Inject concrete class
constructor(private readonly financialRules: FinancialRulesUseCase) {}

// ✅ Works: Type alias with concrete class
constructor(private readonly calc: CalculateBalance & FinancialRulesUseCase) {}
```

**Error: "Circular dependency"**

Problem: Use-Case depends on service that depends on use-case.

Solution: Use `forwardRef` or restructure dependencies:

```typescript
import { forwardRef, Inject } from '@nestjs/common';

constructor(
  @Inject(forwardRef(() => FinanceiroService))
  private readonly service: FinanceiroService,
) {}
```

### Checklist

- [ ] Error message identified and matched to scenario
- [ ] Solution applied correctly
- [ ] Root cause understood to prevent recurrence
- [ ] Similar patterns checked across codebase
- [ ] Documentation updated if new pattern discovered
- [ ] Knowledge shared with team

### Troubleshooting

This is the troubleshooting section itself - see specific error scenarios above for solutions.

### Best Practices

Document new error patterns as discovered. Share solutions with team through wiki or documentation. Address root causes not just symptoms. Refactor to prevent recurring issues. Keep this section updated with team's learnings.

## [External References and Learning Resources]()

Curated external resources including NestJS providers documentation, SOLID principles explanations, Clean Architecture guidance, and Interface Segregation Principle references for deepening understanding of use-case patterns.

### When to use?

Consult these references when deepening understanding of SOLID principles, learning Clean Architecture concepts, understanding NestJS dependency injection, or researching advanced use-case patterns.

### When NOT to use?

Start with this project guide before diving into external resources. Use references for deeper understanding not as replacement for project-specific patterns documented here.

### Example

External documentation and learning resources:

- [NestJS Providers](https://docs.nestjs.com/providers) - Official NestJS dependency injection documentation
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID) - Comprehensive SOLID principles overview
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Uncle Bob's Clean Architecture article
- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle) - Detailed ISP explanation
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle) - DIP comprehensive guide

### Checklist

- [ ] Project guide reviewed first
- [ ] Specific question or topic identified
- [ ] Reference material matches technology stack
- [ ] Patterns adapted to project conventions
- [ ] New learnings documented and shared with team
- [ ] References kept current and relevant

### Troubleshooting

**Issue**: External patterns don't match project conventions
**Solution**: Always adapt external examples to follow project standards. When in doubt, follow this guide's patterns and discuss with team.

**Issue**: Conflicting advice between sources
**Solution**: Prioritize project-specific patterns in this guide. Discuss with team before adopting conflicting external patterns. Document decisions.

### Best Practices

Use references for foundational understanding. Always filter through project-specific requirements. Share useful references with team. Contribute back learnings to this guide. Keep reference list updated and relevant. Prioritize official documentation.
