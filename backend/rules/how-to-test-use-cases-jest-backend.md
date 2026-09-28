# [How to Test Use-Cases with Jest in the Backend]()

Complete guide to configure and create unit tests exclusively for Use-Case classes using Jest, mocking all external dependencies for isolated execution.

## [Jest Initial Setup and Configuration for NestJS Backend]()

This section covers the complete installation and configuration of Jest testing framework for NestJS backend applications, including TypeScript support, coverage collection for use-case files, and integration with the project structure.

### When to use?

Use this Jest setup when starting a new backend project that requires unit testing, when establishing testing standards for use-cases containing business logic, or when implementing test-driven development practices for critical backend features.

### When NOT to use?

Do not use this configuration if the project already has a different testing framework established. Do not apply to integration or e2e tests which require different configuration. Do not use for testing repositories or controllers which should not have unit tests.

### Example

Installation command for testing dependencies:

```bash
# Install dependencies
npm install --save-dev @nestjs/testing jest @types/jest ts-jest
```

**File**: `jest.config.js` (project root)

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.usecase.ts',
    '!**/*.module.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

**File**: `package.json` (add scripts)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

### Checklist

- [ ] Jest and related packages installed
- [ ] jest.config.js created in project root
- [ ] Test scripts added to package.json
- [ ] Path aliases configured in moduleNameMapper
- [ ] Coverage collection targeting only use-case files
- [ ] Test environment set to node

### Troubleshooting

**Error: Cannot find module '@/...'**
- Solution: Check moduleNameMapper in jest.config.js matches your tsconfig.json paths configuration

**Tests not running**
- Solution: Verify testRegex matches your test file naming pattern (*.spec.ts)

**Coverage not collecting**
- Solution: Ensure collectCoverageFrom pattern matches your use-case file locations

### Best Practices

- Only collect coverage for use-case files (business logic)
- Use consistent naming: `name.usecase.ts` and `name.usecase.spec.ts`
- Keep test configuration centralized in jest.config.js
- Use test:watch during development for fast feedback
- Run test:cov before commits to verify coverage targets

## [Use-Case Testing Principles - Isolated Execution with Mocked Dependencies]()

This section establishes the fundamental principles for testing use-cases, emphasizing isolated execution with mocked dependencies, focus on business logic validation, and the Arrange-Act-Assert pattern for clear and maintainable test organization.

### When to use?

Apply these principles when writing tests for any use-case class that contains business logic, when reviewing test quality during code reviews, or when establishing testing standards and guidelines for the development team.

### When NOT to use?

Do not apply these principles to integration tests that verify database interactions, end-to-end tests that verify full request/response cycles, or tests for simple CRUD operations without complex business logic.

### Example

**Core Principles:**

1. **Test only Use-Cases** - Services, Controllers and APIs don't need unit tests
2. **Mock all dependencies** - Repositories, external services, HttpService, etc.
3. **Isolated execution** - No database, no external APIs, no filesystem
4. **Focus on business logic** - Validate rules, calculations and decision flows
5. **Use Arrange-Act-Assert pattern** - Clear test organization

```typescript
it('should calculate balance correctly', async () => {
  // Arrange - Setup mocks and test data
  mockRepository.find.mockResolvedValue([{ amount: 100 }]);

  // Act - Execute the use-case method
  const result = await useCase.calculateBalance(userId);

  // Assert - Verify results and calls
  expect(result).toBe(100);
  expect(mockRepository.find).toHaveBeenCalledWith({ userId });
});
```

### Checklist

- [ ] All external dependencies mocked
- [ ] No real database connections in tests
- [ ] No actual HTTP requests to external APIs
- [ ] Tests focus on business logic validation
- [ ] Arrange-Act-Assert pattern followed
- [ ] Each test is independent and isolated

### Troubleshooting

**Tests fail intermittently**
- Solution: Ensure tests are isolated and not sharing state, use jest.clearAllMocks() in afterEach

**Tests are slow**
- Solution: Verify no real external dependencies are being used (database, APIs, filesystem)

**Hard to understand test purpose**
- Solution: Use descriptive test names, follow Arrange-Act-Assert with clear sections

### Best Practices

- Test business logic exhaustively in use-cases
- Keep tests fast by mocking all external dependencies
- Use descriptive test names that explain the scenario
- Organize tests in describe blocks by method being tested
- Aim for 100% coverage on use-case files

## [Use-Case Test File Structure - Naming and Location Conventions]()

This section defines the mandatory file naming conventions and folder organization for test files, ensuring tests are located next to their corresponding use-case files for easy discovery and maintenance.

### When to use?

Follow this structure when creating any new use-case test file, when organizing existing test files, or when establishing project conventions for test file placement and naming.

### When NOT to use?

Do not deviate from this structure as it ensures consistency. Do not place test files in separate test directories. Do not use different naming patterns for test files.

### Example

**Folder Structure:**

```
src/
└── modules/
    └── transactions/
        ├── usecases/
        │   ├── financial-rules.usecase.ts
        │   └── financial-rules.usecase.spec.ts  ← Next to the use-case
        └── entities/
            └── transaction.entity.ts
```

**Naming Convention:**

- Use-Case: `name.usecase.ts`
- Test: `name.usecase.spec.ts`

### Checklist

- [ ] Test file in same folder as use-case
- [ ] Test file follows `.usecase.spec.ts` naming
- [ ] Use-case file follows `.usecase.ts` naming
- [ ] Test file imports use-case from relative path
- [ ] One test file per use-case file

### Troubleshooting

**Jest not finding test files**
- Solution: Verify test files end with `.spec.ts` and are in the src directory

**Import errors in test files**
- Solution: Use relative imports or path aliases configured in jest.config.js

### Best Practices

- Always place test file next to the use-case file being tested
- Use consistent naming pattern across all tests
- One test file per use-case for maintainability
- Keep test files focused on single use-case class

## [Basic Use-Case Test Template with NestJS Testing Module]()

This section provides a complete template for creating use-case tests with proper setup, teardown, mock configuration, and test organization that can be copied and adapted for any use-case testing scenario.

### When to use?

Use this template when creating a new use-case test file, when standardizing existing tests, or as a starting point for developers new to testing use-cases in the project.

### When NOT to use?

Do not use this template for integration tests, e2e tests, or tests that require real database connections. Adapt the template when use-case has different dependencies than repositories.

### Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NameOfUseCase } from './name-of.usecase';
import { RelatedEntity } from '../entities/entity.entity';

describe('NameOfUseCase', () => {
  let useCase: NameOfUseCase;
  let mockRepository: any;

  beforeEach(async () => {
    // 1. Create mocks for all dependencies
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getMany: jest.fn(),
      }),
    };

    // 2. Create test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NameOfUseCase,
        {
          provide: getRepositoryToken(RelatedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    // 3. Get use-case instance
    useCase = module.get<NameOfUseCase>(NameOfUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useCaseMethod', () => {
    it('should execute success scenario', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue({ id: 1, value: 100 });

      // Act
      const result = await useCase.useCaseMethod(1);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw exception when data is invalid', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.useCaseMethod(999)).rejects.toThrow();
    });
  });
});
```

### Checklist

- [ ] Test module created with Test.createTestingModule
- [ ] All dependencies provided with mocks
- [ ] Use-case instance retrieved in beforeEach
- [ ] jest.clearAllMocks() called in afterEach
- [ ] Tests organized in describe blocks by method
- [ ] Success and failure scenarios tested

### Troubleshooting

**Error: Nest can't resolve dependencies**
- Solution: Ensure all use-case dependencies are provided in the providers array with mocks

**Mock functions not working**
- Solution: Use jest.fn() for all mock methods, verify clearAllMocks is called in afterEach

### Best Practices

- Set up fresh mocks in beforeEach for isolation
- Clear mocks in afterEach to prevent test pollution
- Organize tests by method using describe blocks
- Test both success and error scenarios
- Use descriptive test names explaining the scenario

## [Mocking Multiple Dependencies - Repositories, HttpService, and ConfigService]()

This section demonstrates how to mock multiple dependencies including repositories, external services like HttpService, ConfigService, and other injected dependencies to achieve complete isolation in use-case tests.

### When to use?

Use multiple dependency mocking when the use-case being tested depends on repositories, external HTTP services, configuration services, or other custom services that need to be isolated during testing.

### When NOT to use?

Do not mock dependencies that are simple utilities or pure functions. Do not mock the use-case methods themselves unless testing interdependent methods. Do not use real services in unit tests.

### Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@/common/http/http.service';
import { ConfigService } from '@nestjs/config';
import { StockQuoteUseCase } from './stock-quote.usecase';
import { Investment } from '../entities/investment.entity';

describe('StockQuoteUseCase', () => {
  let useCase: StockQuoteUseCase;
  let mockInvestmentRepository: any;
  let mockHttpService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    // Repository mock
    mockInvestmentRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    // HttpService mock
    mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    // ConfigService mock
    mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          API_KEY: 'test-key',
          API_URL: 'https://test-api.com',
          MAX_RETRIES: 3,
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockQuoteUseCase,
        {
          provide: getRepositoryToken(Investment),
          useValue: mockInvestmentRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<StockQuoteUseCase>(StockQuoteUseCase);
  });

  it('should fetch quote and update investments', async () => {
    // Arrange
    mockInvestmentRepository.find.mockResolvedValue([
      { id: 1, ticker: 'AAPL', quantity: 10 },
    ]);

    mockHttpService.get.mockResolvedValue({
      symbol: 'AAPL',
      price: 150.0,
    });

    mockInvestmentRepository.save.mockResolvedValue({
      id: 1,
      ticker: 'AAPL',
      currentValue: 1500.0,
    });

    // Act
    const result = await useCase.updateQuotes(1);

    // Assert
    expect(result.updatedInvestments).toBe(1);
    expect(mockHttpService.get).toHaveBeenCalledWith('https://test-api.com/quote/AAPL');
    expect(mockConfigService.get).toHaveBeenCalledWith('API_URL');
  });
});
```

### Checklist

- [ ] All repositories mocked with getRepositoryToken
- [ ] All external services mocked
- [ ] ConfigService mocked if used
- [ ] All mocks provided in Test module providers
- [ ] Mock methods return appropriate test data
- [ ] All dependency calls verified in assertions

### Troubleshooting

**Error: Cannot find dependency**
- Solution: Ensure all use-case constructor dependencies are mocked in providers array

**ConfigService returns undefined**
- Solution: Implement get method in mock to return appropriate values for test scenarios

**HttpService mock not called**
- Solution: Verify mock is properly configured and use-case is calling the mocked methods

### Best Practices

- Mock all external dependencies completely
- Use realistic test data in mock responses
- Verify both return values and method calls in assertions
- Keep mock configuration consistent across tests
- Use separate describe blocks for testing different dependency interactions

## [Testing Exception Handling - Validation, Business Rules, and Error Scenarios]()

This section covers comprehensive techniques for testing error conditions, exception throwing, validation failures, and error propagation in use-cases to ensure robust error handling throughout the application.

### When to use?

Test exceptions when the use-case validates input data, when external services can fail, when business rules can reject operations, or when you need to verify proper error messages and error types are thrown.

### When NOT to use?

Do not test every possible exception if some are redundant. Do not test framework exception handling unless customized. Do not write tests for errors that cannot occur in the use-case logic.

### Example

```typescript
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('error handling', () => {
  it('should throw BadRequestException when userId is invalid', async () => {
    // Act & Assert
    await expect(useCase.processTransaction(null, 100)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when user does not exist', async () => {
    // Arrange
    mockRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.fetchUserData(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should propagate repository error', async () => {
    // Arrange
    const dbError = new Error('Database connection failed');
    mockRepository.save.mockRejectedValue(dbError);

    // Act & Assert
    await expect(useCase.saveData({})).rejects.toThrow('Database connection failed');
  });

  it('should throw with specific error message', async () => {
    // Arrange
    mockRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.withdraw(1, 1000)).rejects.toThrow(
      'Insufficient balance'
    );
  });
});
```

### Checklist

- [ ] Input validation errors tested
- [ ] Not found scenarios tested
- [ ] Business rule violations tested
- [ ] External service failures tested
- [ ] Correct exception types verified
- [ ] Error messages verified

### Troubleshooting

**Test passes but exception not actually thrown**
- Solution: Use await expect().rejects.toThrow() for async methods

**Wrong exception type thrown**
- Solution: Verify use-case throws correct NestJS exception types (BadRequestException, NotFoundException, etc.)

### Best Practices

- Test both exception type and message when critical
- Test all validation rules thoroughly
- Test error propagation from dependencies
- Use descriptive test names explaining the error scenario
- Group error tests in dedicated describe block

## [Testing with Date and Time - Using Jest Fake Timers]()

This section demonstrates how to test use-cases that depend on current time or date calculations using Jest's fake timers to ensure consistent and reliable test results regardless of when tests are executed.

### When to use?

Use fake timers when testing use-cases that use current date/time, calculate time differences, implement time-based business rules, or generate timestamps that need to be consistent across test runs.

### When NOT to use?

Do not use fake timers when testing date parsing that doesn't depend on current time. Do not use for tests that genuinely need real time to pass. Restore real timers after tests to avoid affecting other tests.

### Example

```typescript
describe('date operations', () => {
  beforeEach(() => {
    // Mock Date for consistent tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate interest based on current date', async () => {
    // Arrange
    mockRepository.findOne.mockResolvedValue({
      startDate: new Date('2024-01-01'),
      initialValue: 1000,
    });

    // Act
    const result = await useCase.calculateAccruedInterest(1);

    // Assert
    expect(result.elapsedDays).toBe(14);
    expect(result.interest).toBeCloseTo(23.33, 2);
  });

  it('should mark transaction as expired after 30 days', async () => {
    // Arrange
    const transactionDate = new Date('2023-12-15');
    mockRepository.findOne.mockResolvedValue({
      createdAt: transactionDate,
    });

    // Act
    const result = await useCase.checkExpiration(1);

    // Assert
    expect(result.isExpired).toBe(true);
  });
});
```

### Checklist

- [ ] jest.useFakeTimers() called in beforeEach
- [ ] Specific date/time set with jest.setSystemTime()
- [ ] jest.useRealTimers() called in afterEach
- [ ] Date-dependent calculations tested
- [ ] Time-based business rules validated

### Troubleshooting

**Tests fail with date-related errors**
- Solution: Ensure fake timers are set before executing use-case, use fixed dates in setSystemTime

**Timers affecting other tests**
- Solution: Always call jest.useRealTimers() in afterEach to restore normal time behavior

### Best Practices

- Always use fake timers for date/time dependent tests
- Set system time to specific known date for consistency
- Restore real timers in afterEach to avoid side effects
- Use ISO 8601 format for date strings
- Test edge cases like month boundaries, leap years if relevant

## [Code Coverage Requirements - 100% Coverage for Use-Case Business Logic]()

This section defines coverage requirements for use-cases, explains how to run coverage reports, configure coverage thresholds, and interpret coverage metrics to maintain high-quality business logic testing.

### When to use?

Run coverage reports before commits to verify test completeness, when adding new use-cases to ensure adequate testing, or when establishing quality gates for CI/CD pipelines.

### When NOT to use?

Do not enforce 100% coverage on non-critical code. Do not use coverage as the only quality metric. Do not sacrifice test quality for coverage numbers.

### Example

```bash
# Run coverage report
npm run test:cov
```

**Coverage Configuration** (jest.config.js):

```javascript
module.exports = {
  // ... other config
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
```

**Coverage Output:**

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
financial.usecase   |     100 |      100 |     100 |     100
payment.usecase     |      95 |       90 |     100 |      95
```

### Checklist

- [ ] npm run test:cov runs successfully
- [ ] Use-cases have 100% coverage
- [ ] All branches tested
- [ ] All functions tested
- [ ] Coverage report reviewed

### Troubleshooting

**Coverage below 100% but all tests passing**
- Solution: Check coverage report for untested branches, add tests for missing scenarios

**Coverage report not generating**
- Solution: Verify collectCoverageFrom in jest.config.js matches use-case file locations

### Best Practices

- Aim for 100% coverage on use-case files
- Review coverage report to identify untested code paths
- Test all conditional branches (if/else, switch cases)
- Use coverage as guide but focus on meaningful tests
- Include coverage checks in CI/CD pipeline

## [Complete Practical Example - Financial Rules Use-Case Testing]()

This section provides a comprehensive real-world example testing a financial rules use-case with multiple methods, complex business logic, interdependent calculations, and various test scenarios demonstrating all testing techniques.

### When to use?

Reference this example when implementing complex use-case tests, when learning how to test financial or calculation-heavy logic, or as a blueprint for testing use-cases with multiple interdependent methods.

### When NOT to use?

Do not copy this example verbatim for simple CRUD use-cases. Adapt the patterns to your specific domain. Do not over-complicate tests for simple business logic.

### Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FinancialRulesUseCase } from './financial-rules.usecase';
import { Transaction } from '../entities/transaction.entity';

describe('FinancialRulesUseCase', () => {
  let useCase: FinancialRulesUseCase;
  let mockTransactionRepository: any;

  beforeEach(async () => {
    mockTransactionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      }),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialRulesUseCase,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<FinancialRulesUseCase>(FinancialRulesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateCurrentBalance', () => {
    it('should calculate balance correctly with credits and debits', async () => {
      // Arrange
      mockTransactionRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValueOnce({ total: 5000 })
        .mockResolvedValueOnce({ total: 2000 });

      // Act
      const balance = await useCase.calculateCurrentBalance(1);

      // Assert
      expect(balance).toBe(3000);
      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should return 0 when there are no transactions', async () => {
      // Arrange
      mockTransactionRepository.createQueryBuilder().getRawOne.mockResolvedValue(null);

      // Act
      const balance = await useCase.calculateCurrentBalance(1);

      // Assert
      expect(balance).toBe(0);
    });
  });

  describe('processInvestment', () => {
    it('should process investment with sufficient balance', async () => {
      // Arrange
      jest.spyOn(useCase, 'calculateCurrentBalance').mockResolvedValue(10000);
      mockTransactionRepository.create.mockReturnValue({ id: 1, type: 'INVESTMENT' });
      mockTransactionRepository.save.mockResolvedValue({ id: 1, type: 'INVESTMENT' });

      // Act
      const result = await useCase.processInvestment(1, 5000, 'CDB');

      // Assert
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe(1);
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should fail when balance is insufficient', async () => {
      // Arrange
      jest.spyOn(useCase, 'calculateCurrentBalance').mockResolvedValue(1000);

      // Act
      const result = await useCase.processInvestment(1, 5000, 'CDB');

      // Assert
      expect(result.success).toBe(false);
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });
  });
});
```

### Checklist

- [ ] Multiple use-case methods tested
- [ ] Query builder properly mocked
- [ ] Interdependent methods handled with spyOn
- [ ] Success and failure paths tested
- [ ] Business rules validated
- [ ] Repository interactions verified

### Troubleshooting

**Query builder mock not working**
- Solution: Ensure all chained methods return this with mockReturnThis()

**Spy on internal methods not working**
- Solution: Use jest.spyOn(useCase, 'methodName') after useCase instance is retrieved

### Best Practices

- Test each public method in dedicated describe block
- Use jest.spyOn for testing interdependent use-case methods
- Mock query builder with chained method support
- Test both positive and negative scenarios
- Verify repository methods are called with correct parameters

## [Useful Jest Commands and Workflows for Daily Development]()

This section lists essential Jest commands for running tests in different modes, debugging test failures, filtering specific tests, and integrating testing into development workflow for efficient test-driven development.

### When to use?

Reference these commands during daily development for running tests, when debugging failing tests, when running only specific test files or test cases, or when setting up CI/CD test automation.

### When NOT to use?

Do not run all tests repeatedly if only working on specific features. Do not use debug mode for all test runs. Do not use watch mode in CI/CD environments.

### Example

```bash
# Run all tests
npm test

# Run in watch mode (re-runs on save)
npm run test:watch

# Run with coverage
npm run test:cov

# Run only one file
npm test financial-rules.usecase.spec

# Run only tests containing "calculate"
npm test -- -t "calculate"

# Debug tests
npm run test:debug

# Run tests matching pattern
npm test -- --testPathPattern=transactions

# Update snapshots
npm test -- -u

# Run tests with verbose output
npm test -- --verbose
```

### Checklist

- [ ] Know how to run all tests
- [ ] Use watch mode during development
- [ ] Run coverage before commits
- [ ] Can filter and run specific tests
- [ ] Know how to debug failing tests

### Troubleshooting

**Watch mode not detecting changes**
- Solution: Check git status, ensure files are tracked, restart watch mode

**Debug breakpoints not working**
- Solution: Use Chrome DevTools after running test:debug, set breakpoints in DevTools

**Test filter not working**
- Solution: Use correct syntax with -t flag, ensure test name matches pattern

### Best Practices

- Use watch mode during active development
- Run coverage before pushing code
- Use test name filters to focus on specific features
- Debug failing tests instead of adding console.logs
- Run all tests before committing to ensure no regressions

## [Common Testing Errors and Solutions for Faster Troubleshooting]()

This section provides solutions to frequently encountered testing errors including module resolution issues, dependency injection problems, mock configuration errors, and test isolation failures for faster troubleshooting.

### When to use?

Reference this section when encountering testing errors, when debugging test failures, when onboarding new developers to common testing pitfalls, or when establishing troubleshooting procedures.

### When NOT to use?

Do not use these solutions without understanding the root cause. Do not apply solutions blindly. Always verify the solution matches your specific error.

### Example

**Error: Cannot find module '@/...'**

Problem: Path alias not configured in Jest

Solution:
```javascript
// jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

**Error: Repository not provided**

Problem: Missing repository mock in providers

Solution:
```typescript
{
  provide: getRepositoryToken(MyEntity),
  useValue: mockRepository,
}
```

**Error: Mock not being called**

Problem: Mocks not cleared between tests

Solution:
```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

**Error: Cannot spy on method**

Problem: Trying to spy before getting instance

Solution:
```typescript
// Get instance first
useCase = module.get<MyUseCase>(MyUseCase);
// Then spy
jest.spyOn(useCase, 'methodName');
```

### Checklist

- [ ] Path aliases configured correctly
- [ ] All dependencies mocked in providers
- [ ] Mocks cleared between tests
- [ ] Spies created after instance retrieval
- [ ] Async methods tested with await

### Troubleshooting

**Error persists after applying solution**
- Solution: Clear Jest cache with `npm test -- --clearCache`, restart test process

**Different error appears after fix**
- Solution: Read error message carefully, may indicate different underlying issue

### Best Practices

- Read error messages completely before attempting fixes
- Clear Jest cache when experiencing strange errors
- Verify configuration changes in jest.config.js
- Check that all async operations use await
- Ensure test isolation with proper beforeEach/afterEach

## [References and Related Documentation for Comprehensive Understanding]()

This section provides links to official documentation, related project rules for use-case implementation, backend patterns, and additional testing resources for comprehensive understanding of the testing ecosystem.

### When to use?

Reference these links when needing deeper understanding of Jest features, when implementing use-cases following project standards, or when researching advanced testing patterns and techniques.

### When NOT to use?

Do not rely solely on external documentation without understanding project-specific patterns. Do not skip reading project .rules documentation before external resources.

### Example

**Internal Documentation:**
- Use-Case structure: `./how-to-create-use-case-backend.md`
- Backend patterns: `./scalable-implementation-pattern-backend.md`
- TypeScript standards: `./typescript-patterns-standards.md`

**External Documentation:**
- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [@nestjs/testing API](https://docs.nestjs.com/fundamentals/testing#unit-testing)
- [class-validator](https://github.com/typestack/class-validator)

### Checklist

- [ ] Internal .rules documentation reviewed
- [ ] Jest documentation consulted when needed
- [ ] NestJS testing guide reviewed
- [ ] Understanding of mocking with @nestjs/testing
- [ ] Familiar with test organization patterns

### Troubleshooting

**Cannot find specific testing pattern**
- Solution: Check internal .rules first, then consult Jest and NestJS documentation

**Documentation seems outdated**
- Solution: Verify version of Jest and NestJS in package.json, consult matching documentation version

### Best Practices

- Start with internal project documentation
- Consult official Jest docs for advanced features
- Keep documentation bookmarked for quick reference
- Share useful patterns with team
- Update internal documentation when discovering new patterns
