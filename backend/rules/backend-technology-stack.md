# [Backend Technology Stack]()

Complete technical documentation describing all technologies, frameworks, libraries, and tools used in the backend application including runtime, database, security, validation, and development tools.

## [Main Stack - NestJS Framework with TypeScript and Express]()

Core technologies powering the backend application including NestJS framework for modular architecture, TypeScript for type safety and developer experience, Node.js as JavaScript runtime environment, and Express.js as underlying HTTP server handling requests and responses efficiently.

### When to use?

Use this stack when building scalable server-side applications requiring strong typing, modular architecture, dependency injection, and built-in support for REST APIs, WebSockets, or microservices. Ideal for enterprise applications and complex backend systems requiring maintainability and testability.

### When NOT to use?

Avoid this stack for simple static sites, serverless functions with cold start constraints, or when team has no TypeScript/Node.js experience. Not recommended for CPU-intensive tasks better suited for languages like Go or Rust, or when framework overhead is excessive for minimal requirements.

### Example

Basic NestJS application entry point with dependency injection and modular architecture.

```typescript
// main.ts - NestJS application entry point
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

// app.module.ts - Root module with dependency injection
@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Checklist

- [ ] Node.js version >= 18.x installed
- [ ] TypeScript configured with strict mode enabled
- [ ] NestJS CLI installed globally (`npm i -g @nestjs/cli`)
- [ ] Express.js integrated via `@nestjs/platform-express`
- [ ] Environment variables configured in .env file
- [ ] tsconfig.json targeting ES2023 with strict compilation

### Troubleshooting

**Problem**: NestJS application fails to start with dependency injection errors
**Solution**: Ensure all providers are properly registered in module imports/providers arrays and circular dependencies are avoided

**Problem**: TypeScript compilation errors despite valid JavaScript
**Solution**: Check tsconfig.json strict mode settings and ensure all types are properly declared without using `any`

**Problem**: Express middleware not executing
**Solution**: Verify middleware registration order in main.ts or module configuration, as order matters for request processing

### Best Practices

- Enable TypeScript strict mode for maximum type safety
- Organize code in feature modules following domain-driven design
- Use dependency injection instead of direct instantiation
- Implement proper error handling with exception filters
- Configure environment variables via ConfigModule
- Keep controllers thin, business logic in services/use-cases

## [Database Technologies - PostgreSQL with TypeORM]()

Database management system and ORM framework providing robust ACID-compliant data persistence, type-safe queries, automated migrations, and relational data modeling. PostgreSQL offers advanced features like JSONB support and complex queries, while TypeORM enables type-safe database operations with entities and repositories.

### When to use?

Use PostgreSQL with TypeORM when building applications requiring complex relational data models, ACID transactions, advanced querying capabilities, type-safe database operations, and automated schema migrations. Perfect for applications with structured data, referential integrity requirements, and complex business logic involving multiple related entities.

### When NOT to use?

Avoid this stack for applications primarily dealing with unstructured data better suited for document databases, when requiring extreme horizontal scalability beyond PostgreSQL capabilities, or for simple key-value storage where Redis suffices. Not ideal for time-series data optimized for specialized databases like TimescaleDB or InfluxDB.

### Example

Entity definition with TypeORM decorators and type-safe repository usage.

```typescript
// Entity definition with TypeORM
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Post, post => post.user)
  posts: Post[];
}

// Repository usage with type safety
const userRepository = getRepository(User);
const user = await userRepository.findOne({
  where: { email: 'user@example.com' },
  relations: ['posts'],
});
```

### Checklist

- [ ] PostgreSQL >= 14.x installed and running
- [ ] TypeORM configured in app.module.ts with database credentials
- [ ] Database migrations folder created (`src/migrations`)
- [ ] Entities decorated with proper TypeORM decorators
- [ ] Connection pooling configured for production
- [ ] Migration scripts added to package.json

### Troubleshooting

**Problem**: TypeORM cannot connect to PostgreSQL database
**Solution**: Verify database credentials in .env file, ensure PostgreSQL service is running, and check firewall/network connectivity to database port 5432

**Problem**: Migration fails with "relation already exists" error
**Solution**: Check migration history in `migrations` table, revert failed migrations, or manually clean database schema before re-running migrations

**Problem**: Query performance degradation with complex relations
**Solution**: Add database indexes on foreign keys and frequently queried columns, use query builder for optimization, or implement eager/lazy loading strategies appropriately

### Best Practices

- Always use migrations for schema changes, never modify database manually
- Define indexes on foreign keys and frequently queried columns
- Use transactions for operations involving multiple tables
- Implement soft deletes with `@DeleteDateColumn()` instead of hard deletes
- Use repository pattern or custom repositories for complex queries
- Enable query logging in development to monitor and optimize queries

## [Authentication and Security - Passport, JWT, and Bcrypt]()

Authentication strategies, JWT token management, password hashing and security middleware protecting API endpoints and user data. Passport provides flexible authentication with multiple strategies including local and JWT, while bcrypt ensures secure password storage with cryptographic hashing using salt rounds.

### When to use?

Use this authentication stack for applications requiring secure user authentication, stateless API authentication with JWT tokens, multiple authentication strategies (local, JWT, OAuth), and password-based login with cryptographic hashing. Ideal for REST APIs, single-page applications, mobile apps, and microservices requiring token-based authentication without server-side sessions.

### When NOT to use?

Avoid JWT for applications requiring instant token revocation (prefer session-based auth with Redis), extremely short-lived sessions needing frequent rotation, or when GDPR requires complete user data deletion including active sessions. Not suitable for public APIs without authentication or when OAuth/SAML is enterprise requirement.

### Example

JWT strategy implementation with Passport and secure password hashing using bcrypt.

```typescript
// JWT Strategy for token validation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

// Login endpoint returning JWT
@Post('login')
async login(@Body() loginDto: LoginDto) {
  const user = await this.authService.validateUser(loginDto);
  const token = this.jwtService.sign({ sub: user.id, email: user.email });
  return { access_token: token };
}

// Password hashing with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### Checklist

- [ ] Passport and authentication strategies installed and configured
- [ ] JWT secret stored securely in environment variables
- [ ] JWT expiration time configured appropriately
- [ ] Bcrypt salt rounds set to 10 or higher
- [ ] Guards applied to protected routes
- [ ] Password validation rules enforced
- [ ] HTTPS enforced in production for token transmission

### Troubleshooting

**Problem**: JWT authentication fails with "Unauthorized" error
**Solution**: Verify JWT secret matches in environment variables, check token expiration, ensure Authorization header format is "Bearer <token>", and validate token signature

**Problem**: Password comparison always returns false
**Solution**: Ensure password is hashed before storing, verify bcrypt version consistency, check salt rounds match during hash and compare operations

**Problem**: Authentication guard not protecting routes
**Solution**: Verify guard is applied with @UseGuards(JwtAuthGuard) decorator, ensure passport module is properly imported, and check guard execution order

### Best Practices

- Store JWT secret in environment variables, never in code
- Set appropriate JWT expiration (15min-1h for access, 7d for refresh)
- Use bcrypt with minimum 10 salt rounds for password hashing
- Implement refresh token mechanism for extended sessions
- Never expose password hashes in API responses
- Use HTTPS in production to protect tokens during transmission
- Implement rate limiting on login endpoints to prevent brute force

## [Data Validation - Class Validator and Class Transformer]()

Validation and transformation libraries for DTOs ensuring data integrity, type safety and automatic validation of incoming requests using decorators. Class-validator provides declarative validation rules with decorators, while class-transformer handles serialization, deserialization, and sensitive field exclusion for secure API responses.

### When to use?

Use class-validator and class-transformer for all API endpoints accepting user input requiring validation of request payloads, enforcing business rules at API boundary, transforming plain JSON to typed class instances, and excluding sensitive fields from responses. Essential for DTOs in POST, PUT, PATCH endpoints and all user-generated data.

### When NOT to use?

Not needed for internal service-to-service communication with trusted data sources, simple GET endpoints without input parameters, or when validation is handled by database constraints only. Avoid over-validating data already validated by upstream services in microservice architectures.

### Example

DTO with validation decorators and automatic validation in controllers.

```typescript
// DTO with validation decorators
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;
}

// Controller with automatic validation
@Post()
async create(@Body() createUserDto: CreateUserDto) {
  return this.userService.create(createUserDto);
}

// Entity with field exclusion
export class User {
  @Exclude()
  password: string;  // Never exposed in responses
}
```

### Checklist

- [ ] ValidationPipe enabled globally in main.ts
- [ ] All DTOs have validation decorators on required fields
- [ ] Sensitive fields marked with @Exclude() decorator
- [ ] Custom validation messages defined for user-facing errors
- [ ] Nested object validation implemented where needed
- [ ] Transform options configured (enableImplicitConversion)

### Troubleshooting

**Problem**: Validation not triggered on API endpoints
**Solution**: Ensure ValidationPipe is enabled globally in main.ts with `app.useGlobalPipes(new ValidationPipe())` or applied to specific controllers/routes

**Problem**: Sensitive fields exposed in API responses
**Solution**: Add @Exclude() decorator to sensitive entity fields and ensure ClassSerializerInterceptor is applied globally or to specific routes

**Problem**: Nested object validation not working
**Solution**: Use @ValidateNested() decorator and @Type(() => NestedClass) to enable validation of nested objects and arrays

### Best Practices

- Enable ValidationPipe globally with whitelist and forbidNonWhitelisted options
- Always validate user input at API boundary, never trust client data
- Use specific validation decorators (@IsEmail, @IsUUID) over generic @IsString
- Provide clear error messages for validation failures
- Exclude sensitive fields using @Exclude() in entity classes
- Use @Transform() for custom data transformations
- Validate nested objects with @ValidateNested() and @Type() decorators

## [API Documentation - Swagger/OpenAPI]()

Automatic OpenAPI/Swagger documentation generation from code using decorators, providing interactive UI for testing and exploring all backend API endpoints with request/response schema definitions. Swagger UI allows developers and API consumers to understand, test, and integrate with the API without reading source code.

### When to use?

Use Swagger for all REST APIs requiring documentation for external consumers, frontend developers, third-party integrators, or public API usage. Essential for microservices architectures, API-first development, maintaining API contracts, and providing self-service testing interfaces during development and integration phases.

### When NOT to use?

Skip Swagger for internal microservices with generated clients, GraphQL APIs using built-in introspection, purely internal tools without external consumers, or when OpenAPI specification conflicts with custom API patterns. Not necessary for simple CRUD APIs without complex request/response schemas.

### Example

API endpoint documentation with Swagger decorators and DTO annotations.

```typescript
// API endpoint documentation
@ApiTags('users')
@Controller('users')
export class UserController {
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}

// DTO with Swagger annotations
export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (min 8 chars)', minLength: 8 })
  @MinLength(8)
  password: string;
}
```

### Checklist

- [ ] Swagger module configured in main.ts with DocumentBuilder
- [ ] All controllers tagged with @ApiTags() decorator
- [ ] Endpoints documented with @ApiOperation() and @ApiResponse()
- [ ] DTOs annotated with @ApiProperty() for all fields
- [ ] Authentication/authorization schemes defined in Swagger config
- [ ] Swagger UI accessible at /api/docs endpoint

### Troubleshooting

**Problem**: Swagger UI not loading or showing empty documentation
**Solution**: Verify SwaggerModule.setup() is called in main.ts after app creation, check path conflicts with application routes, and ensure decorators are properly applied

**Problem**: DTO properties not appearing in Swagger schema
**Solution**: Add @ApiProperty() decorator to all DTO fields, ensure class-validator and class-transformer are installed, and check TypeScript emit decorator metadata is enabled

**Problem**: Authentication not working in Swagger UI
**Solution**: Configure authentication scheme with .addBearerAuth() in DocumentBuilder, add @ApiBearerAuth() to protected endpoints, and test token format

### Best Practices

- Tag all controllers with @ApiTags() for logical grouping
- Document all possible response status codes with @ApiResponse()
- Provide example values in @ApiProperty() for better clarity
- Use @ApiBearerAuth() or @ApiSecurity() for protected endpoints
- Keep Swagger documentation in sync with actual implementation
- Disable Swagger in production or protect with authentication
- Use @ApiExcludeEndpoint() to hide internal/deprecated endpoints

## [Configuration Management - NestJS ConfigModule and Dotenv]()

Environment variable management and configuration loading with type safety validation, separating settings by development, staging and production environments using .env files. NestJS ConfigModule provides centralized configuration with validation schema, while dotenv handles loading environment-specific variables from .env files into process.env.

### When to use?

Use ConfigModule for managing all application settings requiring different values per environment (dev, staging, production), storing sensitive credentials outside code, centralizing configuration access across the application, and validating configuration at startup. Essential for database URLs, API keys, feature flags, and external service endpoints.

### When NOT to use?

Not needed for static configuration values that never change across environments, hardcoded constants better defined as TypeScript constants, or simple applications with no environment-specific settings. Avoid for values that should be in code (like enum definitions or business constants).

### Example

Configuration module setup with validation schema and type-safe usage.

```typescript
// .env file
POSTGRES_URL=postgresql://localhost:5432/mydb
JWT_SECRET=supersecret
PORT=3000

// Configuration module with validation
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
})
export class AppModule {}

// Type-safe configuration usage
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    return this.configService.get<string>('POSTGRES_URL');
  }
}
```

### Checklist

- [ ] ConfigModule imported globally in AppModule
- [ ] .env file created with all required variables
- [ ] .env file added to .gitignore
- [ ] .env.example file provided with dummy values
- [ ] Configuration validation schema defined
- [ ] ConfigService injected where configuration needed
- [ ] Separate .env files for different environments

### Troubleshooting

**Problem**: Environment variables not loading from .env file
**Solution**: Ensure .env file is in project root, ConfigModule.forRoot() is called before other modules, and dotenv package is installed

**Problem**: ConfigService returning undefined for existing variables
**Solution**: Check environment variable names match exactly (case-sensitive), verify .env file format has no spaces around = sign, and restart application after .env changes

**Problem**: Application fails to start with validation errors
**Solution**: Review validation schema requirements, ensure all required variables are defined in .env, check variable types match schema definitions

### Best Practices

- Never commit .env files to version control
- Provide .env.example with all required variables and dummy values
- Use ConfigModule.forRoot({ isGlobal: true }) to avoid repeated imports
- Validate configuration at application startup with validation schema
- Use type-safe access with generics: configService.get<string>('KEY')
- Separate configuration by environment (.env.dev, .env.prod)
- Document all configuration variables in README or .env.example

## [Utility Libraries - Axios, Dayjs, RxJS, and Reflect-Metadata]()

Essential utility libraries for HTTP requests to external APIs, date manipulation with immutability, reactive programming with observables and metadata reflection required by TypeScript decorators. These libraries provide core functionality for external integrations, asynchronous operations, and TypeScript decorator-based programming patterns in NestJS.

### When to use?

Use axios for HTTP requests to external REST APIs and third-party services, dayjs for all date/time parsing, formatting, and manipulation, RxJS for complex asynchronous workflows and reactive programming patterns, and reflect-metadata as required dependency for TypeScript decorators in NestJS. Essential for API integrations, scheduled jobs, and event-driven architectures.

### When NOT to use?

Avoid axios for internal microservice communication (use NestJS HttpService or gRPC), dayjs for simple timestamp comparisons (use native Date), RxJS for simple promises (use async/await), or reflect-metadata configuration (it's auto-required by NestJS). Don't use these libraries when simpler native JavaScript alternatives suffice.

### Example

HTTP requests with axios, date manipulation with dayjs, and reactive operations with RxJS.

```typescript
// Axios for external API calls
@Injectable()
export class ExternalApiService {
  async fetchUserData(userId: string): Promise<UserData> {
    const response = await axios.get(`https://api.example.com/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      timeout: 5000,
    });
    return response.data;
  }
}

// Dayjs for date manipulation
import dayjs from 'dayjs';

const now = dayjs();
const tomorrow = now.add(1, 'day');
const formatted = now.format('YYYY-MM-DD HH:mm:ss');
const isAfter = dayjs('2024-01-01').isAfter('2023-01-01');

// RxJS for reactive operations
import { map, filter } from 'rxjs/operators';

this.dataStream$.pipe(
  filter(data => data.isValid),
  map(data => data.value)
).subscribe(result => console.log(result));
```

### Checklist

- [ ] Axios configured with base URL and default headers
- [ ] Axios interceptors set up for error handling and retries
- [ ] Dayjs imported with required plugins (timezone, utc, etc)
- [ ] RxJS operators imported individually for tree-shaking
- [ ] Reflect-metadata imported at top of main.ts
- [ ] HTTP timeout configured for all external requests

### Troubleshooting

**Problem**: Axios requests timeout or hang indefinitely
**Solution**: Configure timeout option in axios config, implement retry logic with exponential backoff, check network connectivity, and verify external API is responding

**Problem**: Dayjs formatting returns unexpected results
**Solution**: Ensure correct format string syntax, check timezone plugin is loaded if using timezone-aware dates, verify input date string is valid

**Problem**: RxJS memory leaks in subscriptions
**Solution**: Always unsubscribe from observables in ngOnDestroy or use takeUntil operator, avoid nested subscriptions, prefer async pipe in templates

### Best Practices

- Configure axios defaults for base URL, headers, and timeout
- Use axios interceptors for authentication token injection and error handling
- Implement retry logic with exponential backoff for failed requests
- Use dayjs with UTC plugin for consistent date handling across timezones
- Keep dayjs objects immutable, never mutate dates
- Import RxJS operators individually to reduce bundle size
- Use async/await for simple asynchronous operations instead of RxJS
- Unsubscribe from RxJS observables to prevent memory leaks

## [Development Tools - Compilation, Build, and Code Quality]()

Development tools for TypeScript compilation, build processes, code quality enforcement, and static analysis. Includes NestJS CLI for scaffolding, ts-node for development execution, ESLint for linting, Prettier for formatting, and TypeScript type definitions for third-party libraries.

### When to use?

Use these development tools in all phases of development for code generation with NestJS CLI, running TypeScript without compilation in development with ts-node, enforcing code quality with ESLint and Prettier, and ensuring type safety with @types packages. Essential for maintaining code standards and developer productivity.

### When NOT to use?

These are development dependencies not needed in production runtime. Skip ts-node in production (use compiled JavaScript), avoid running linters in production builds, and exclude type definitions from production bundles as they're compile-time only.

### Example

Development workflow using NestJS CLI, ESLint, and Prettier.

```bash
# Generate module with NestJS CLI
nest generate module users
nest generate controller users
nest generate service users

# Run development server with ts-node
npm run start:dev

# Lint code with ESLint
npm run lint

# Format code with Prettier
npm run format

# Type-safe development with TypeScript
// TypeScript automatically checks types during development
```

### Checklist

- [ ] NestJS CLI installed globally or as dev dependency
- [ ] ESLint configured with TypeScript parser
- [ ] Prettier configured and integrated with ESLint
- [ ] TypeScript strict mode enabled in tsconfig.json
- [ ] All @types packages installed for third-party libraries
- [ ] Pre-commit hooks set up for linting and formatting
- [ ] tsconfig-paths configured for path aliases

### Troubleshooting

**Problem**: ESLint and Prettier conflicts causing formatting issues
**Solution**: Install eslint-config-prettier to disable conflicting ESLint rules, ensure Prettier runs after ESLint in pre-commit hooks

**Problem**: TypeScript path aliases not resolving at runtime
**Solution**: Install and configure tsconfig-paths, ensure paths in tsconfig.json match module resolution, use ts-node with -r tsconfig-paths/register

**Problem**: NestJS CLI commands fail with module not found errors
**Solution**: Verify @nestjs/cli is installed, check nest-cli.json configuration, ensure project structure matches NestJS conventions

### Best Practices

- Use NestJS CLI for consistent code generation following project patterns
- Enable ESLint auto-fix on save in IDE for immediate feedback
- Configure Prettier as ESLint rule for unified workflow
- Install exact @types versions matching runtime library versions
- Use strict TypeScript compiler options for maximum type safety
- Set up pre-commit hooks with husky and lint-staged
- Configure tsconfig-paths for clean import statements with aliases

## [TypeScript Type Definitions]()

Type definition packages providing TypeScript interfaces and type declarations for third-party JavaScript libraries enabling type-safe development and IntelliSense in IDEs. Essential for maintaining type safety when using JavaScript libraries in TypeScript projects.

### When to use?

Install @types packages for every third-party JavaScript library without built-in TypeScript definitions. Required for Express, Node.js APIs, Jest, bcrypt, Passport, and other JavaScript libraries to enable type checking and autocomplete in TypeScript development.

### When NOT to use?

Not needed for libraries with built-in TypeScript definitions (like NestJS, TypeORM), pure TypeScript libraries, or when using JavaScript without TypeScript. Skip installing @types if the library already exports .d.ts files.

### Example

Type definitions enabling IntelliSense and type safety for JavaScript libraries.

```typescript
// @types/express enables type-safe Express usage
import { Request, Response } from 'express';

function handler(req: Request, res: Response) {
  // Full autocomplete and type checking
  const userId = req.params.id;  // TypeScript knows params type
  res.json({ message: 'Success' });  // TypeScript validates json method
}

// @types/node enables Node.js API types
import { readFile } from 'fs/promises';
const buffer: Buffer = await readFile('file.txt');

// @types/bcrypt enables bcrypt type safety
import * as bcrypt from 'bcrypt';
const hash: string = await bcrypt.hash('password', 10);
```

### Checklist

- [ ] @types/express installed for Express types
- [ ] @types/node installed matching Node.js version
- [ ] @types/jest installed for test type safety
- [ ] @types/bcrypt installed for password hashing
- [ ] @types/passport-jwt installed for JWT strategy
- [ ] All @types versions match corresponding library versions
- [ ] TypeScript recognizes types without errors

### Troubleshooting

**Problem**: TypeScript cannot find type definitions for library
**Solution**: Install corresponding @types package, check DefinitelyTyped repository for availability, or create custom .d.ts file if types unavailable

**Problem**: Type conflicts between @types packages and library
**Solution**: Ensure @types version matches library version, check for duplicate type declarations, update or downgrade @types package to compatible version

**Problem**: IDE not showing autocomplete despite @types installed
**Solution**: Restart TypeScript language server, verify types are in node_modules/@types, check tsconfig.json includes node_modules

### Best Practices

- Install @types packages as devDependencies, not dependencies
- Match @types package versions with runtime library versions
- Keep @types packages updated with library updates
- Check if library has built-in types before installing @types
- Use exact versions for @types to prevent breaking changes
- Document required @types packages in README

## [Architecture and Design Patterns]()

Software architecture patterns and SOLID principles implemented throughout the backend codebase ensuring maintainable, testable, and scalable code structure. Includes dependency injection, repository pattern, DTOs, guards, decorators, and modular organization.

### When to use?

Apply these patterns and principles consistently across entire codebase for dependency management with IoC container, data access abstraction with repositories, input validation with DTOs, route protection with guards, and code organization with modules. Essential for enterprise applications requiring long-term maintainability.

### When NOT to use?

Don't over-engineer simple scripts or prototypes with full pattern implementation. For minimal MVPs or proof-of-concepts, pragmatic simpler approaches may suffice. Avoid pattern dogmatism when it adds complexity without proportional value.

### Example

Implementation of common design patterns in NestJS architecture.

```typescript
// Dependency Injection Pattern
@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}  // Injected dependency
}

// Repository Pattern
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.repository.findOne({ where: { email } });
  }
}

// DTO Pattern with Validation
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}

// Guard Pattern for Route Protection
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {}
```

### Checklist

- [ ] All dependencies injected via constructor, not instantiated
- [ ] Repository pattern used for all database access
- [ ] DTOs created for all input/output operations
- [ ] Guards applied to protected routes
- [ ] Code organized into feature modules
- [ ] Each service has single responsibility
- [ ] Interfaces used for abstraction where appropriate

### Troubleshooting

**Problem**: Circular dependency errors between modules
**Solution**: Use forwardRef() for circular dependencies, restructure modules to remove circular references, or extract shared functionality to separate module

**Problem**: Repository methods not available or undefined
**Solution**: Ensure repository is properly injected with @InjectRepository(), verify entity is registered in module imports, check TypeORM connection

**Problem**: Guards not executing or protecting routes
**Solution**: Verify guard is registered in module providers, check execution context in canActivate method, ensure guard order is correct

### Best Practices

- Follow Single Responsibility Principle: one class, one purpose
- Use dependency injection for all service dependencies
- Implement repository pattern for database abstraction
- Create DTOs for all API inputs and outputs
- Apply guards at controller or route level for authorization
- Organize code by feature modules, not by layer
- Use interfaces for contracts between layers
- Keep controllers thin, move logic to services/use-cases

## [Implemented Design Patterns Reference]()

Quick reference list of specific design patterns implemented in the backend codebase with examples of where and how each pattern is applied.

### Patterns List

1. **Dependency Injection**: NestJS native IoC container managing all service dependencies
2. **Repository Pattern**: Data access abstraction via TypeORM repositories for database operations
3. **DTO Pattern**: Data Transfer Objects with class-validator for input/output validation
4. **Strategy Pattern**: Multiple authentication strategies (JWT, Local, API Key) via Passport
5. **Guard Pattern**: Route protection and authorization with custom guards and decorators
6. **Decorator Pattern**: Functionality extension via TypeScript decorators (@Injectable, @Controller)
7. **Module Pattern**: Organization into independent, cohesive feature modules

### SOLID Principles Application

- **S - Single Responsibility**: Each service, controller, and repository has one clear purpose
- **O - Open/Closed**: Extensible via decorators, guards, and pipes without modifying core code
- **L - Liskov Substitution**: Entities extend base classes maintaining behavioral compatibility
- **I - Interface Segregation**: Specific interfaces per context avoiding fat interfaces
- **D - Dependency Inversion**: Dependencies injected via constructor, not directly instantiated

## [Project Domain Modules]()

Domain-specific feature modules developed for the project organized by business functionality. Each module encapsulates related entities, services, controllers, and business logic following domain-driven design principles.

### Module List

1. **AuthModule**: User authentication, authorization, and session management
2. **AssetModule**: Financial asset management (stocks, bonds, funds)
3. **AssetGroupModule**: Grouping and categorization of assets
4. **WalletModule**: User portfolio and wallet management
5. **WalletCompositionModule**: Portfolio composition and position tracking
6. **QuoteModule**: Historical price quotes and market data
7. **CurrencyModule**: Multi-currency support and exchange rates
8. **SectorModule**: Economic sector classification and analysis
9. **ProvidersModule**: External data provider integration
10. **DashboardModule**: Analytics dashboards and performance metrics
11. **IntegrationModule**: B3 stock exchange integration
12. **AlertModule**: Price alerts and notification system
13. **CommentModule**: User comments and notes on assets
14. **ConfigModule**: User preferences and application settings
15. **RebalanceModule**: Portfolio rebalancing calculations and recommendations

### Module Organization

Each domain module typically contains:
- **Entities**: Database models with TypeORM decorators
- **DTOs**: Request/response validation objects
- **Repository**: Data access layer
- **Service**: Business logic orchestration
- **Controller**: HTTP endpoints
- **Module**: Dependency injection configuration

## [Technology Summary and Quick Reference]()

Comprehensive list of all core technologies, libraries, and tools used in the backend stack for rapid lookup and onboarding new developers to the project's technology ecosystem.

### Core Technologies

- **NestJS**: Progressive Node.js framework for building efficient server-side applications
- **TypeScript**: Typed superset of JavaScript for enhanced developer experience
- **TypeORM**: Object-relational mapping framework for type-safe database operations
- **PostgreSQL**: Advanced relational database with ACID compliance
- **Express.js**: Fast, unopinionated web framework for Node.js

### Security and Authentication

- **Passport**: Authentication middleware supporting multiple strategies
- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Password hashing library with salt rounds

### Validation and Transformation

- **class-validator**: Decorator-based validation library for DTOs
- **class-transformer**: Object transformation and serialization library

### Utilities

- **Swagger**: OpenAPI documentation and testing UI
- **Axios**: Promise-based HTTP client for external API requests
- **dayjs**: Modern date manipulation library
- **RxJS**: Reactive programming with observables

### Development Tools

- **Jest**: Testing framework for unit and integration tests
- **ESLint**: JavaScript and TypeScript linter
- **Prettier**: Code formatter for consistent style

## [Package Managers and System Requirements]()

Package manager options and minimum system requirements for running the backend application in development and production environments.

### Supported Package Managers

The project supports multiple package managers with pnpm recommended for better performance and disk space efficiency:

- **npm**: Traditional Node.js package manager (package.json + package-lock.json)
- **pnpm**: Fast, disk space efficient package manager (pnpm-lock.yaml) - **Recommended**

### System Requirements

Minimum versions required for runtime, database, and package managers:

- **Node.js**: >= 18.x (LTS version recommended)
- **PostgreSQL**: >= 14.x (with JSONB support)
- **npm**: >= 9.x (if using npm)
- **pnpm**: >= 8.x (if using pnpm)

### Installation Commands

```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

## [Documentation References and Learning Resources]()

Official documentation links and learning resources for all major technologies used in the backend stack providing detailed guides, API references, and best practices for deeper understanding.

### Official Documentation

- **[NestJS Documentation](https://docs.nestjs.com)**: Comprehensive framework guide with examples
- **[TypeORM Documentation](https://typeorm.io)**: Database ORM reference and migration guides
- **[Passport.js Documentation](https://www.passportjs.org)**: Authentication strategy documentation
- **[TypeScript Documentation](https://www.typescriptlang.org)**: Language reference and handbook
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)**: Database features and SQL reference
- **[Jest Documentation](https://jestjs.io)**: Testing framework guides and API
- **[Swagger Documentation](https://swagger.io/docs/)**: OpenAPI specification and tools

### Additional Resources

- NestJS GitHub repository for examples and issue tracking
- TypeORM repository for entity relationship patterns
- Stack Overflow for community support and troubleshooting
- Medium and Dev.to for tutorials and best practices
