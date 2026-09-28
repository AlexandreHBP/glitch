# [Summary - FAQ Documentation]()

> Complete index with all guides, sections and topics of the project.

## [📚 Stack and Technologies]()

Documentation about all technologies, frameworks and libraries used in backend.

### [TypeScript Patterns - `./typescript-patterns-standards.md`]()

- **Rule #1: NEVER use `any`** - Total prohibition of any type
- **Rule #2: strict: true** - Strict mode mandatory
- **Rule #3: Explicit typing** - Interfaces and types with clear types
- **Rule #4: use `unknown`** - Safe alternative for unknown types
- **Type Guards** - Runtime type validation
- **Generics** - Reusable code with type safety
- **Readonly** - Immutability and mutation prevention
- **Naming** - PascalCase conventions for types
- **ESLint Rules** - Mandatory typescript-eslint rules
- **Checklist** - TypeScript quality verification

### [Backend - `./backend-technology-stack.md`]()

- **Main Stack** - NestJS Framework, TypeScript, Node.js, Express
- **Database** - PostgreSQL, TypeORM, pg driver
- **Authentication and Security** - Passport, JWT, bcrypt
- **Data Validation** - class-validator, class-transformer
- **API Documentation** - Swagger/OpenAPI
- **Configuration** - @nestjs/config, dotenv
- **Utilities** - Axios, dayjs, rxjs
- **Development Tools** - ESLint, Prettier, Jest
- **Architecture and Patterns** - Dependency Injection, Repository Pattern
- **Custom Modules** - 15 implemented domain modules

## [🔧 Backend - Development]()

Complete guides for API development, service integration and backend feature implementation.

### [Redis - `./how-to-use-redis-backend.md`]()

- **When to Use** - Cache, sessions, counters, rate limiting, temporary data
- **Installation** - Required packages
- **Global Configuration** - Common and reusable RedisModule
- **Basic Usage** - Simple cache with get/set/del
- **Operations** - SET, GET, DEL, FLUSH
- **Shared Counter** - Atomic increment for horizontal scaling
- **Rate Limiting** - Control requests per user/IP
- **External API Cache** - Reduce latency and costs
- **Shared Sessions** - Multiple instances
- **Key Naming** - Hierarchical patterns
- **Mass Invalidation** - Helper with patterns
- **Docker Compose** - Local setup
- **Best Practices** - TTL, prefixes, invalidation, security
- **Checklist** - Implementation verification
- **Troubleshooting** - Common issues

### [RabbitMQ - `./how-to-use-rabbitmq-backend.md`]()

- **When to Use** - Asynchronous processing, long tasks, automatic retry, background jobs
- **Installation** - @nestjs/microservices packages
- **Topic Exchange Architecture** - ONE single exchange `app_exchange` with topic routing
- **Naming Pattern** - `<module>.<resource>.<action>` (ex: order.order.created)
- **Global Configuration** - Common and reusable RabbitMQModule
- **Producer** - Publish messages with topic
- **Consumer** - Subscribe to specific topics with @EventPattern
- **Wildcards** - Use `*` (one word) and `#` (zero or more words)
- **Examples per Module** - Order, Payment, Notification, Product, User, Report
- **Dead Letter Queue** - Retries and failed messages
- **Batch Processing** - Group multiple messages by topic
- **Multiple Consumers** - Horizontal scaling with round-robin
- **Retry Control** - Limit attempts and exponential backoff
- **Docker Compose** - Local setup with Management UI
- **Best Practices** - Naming pattern, single exchange, ACK/NACK, logging with routing key
- **Redis vs RabbitMQ Differences** - When to use each
- **Checklist** - Implementation verification
- **Troubleshooting** - Common issues

### [Real-Time SSE and MQTT - `./how-to-implement-realtime-sse-mqtt-backend.md`]()

- **Architecture Overview** - SSE to MQTT backend bridge pattern
- **When to Use** - Real-time dashboards, notifications, webhooks, IoT updates, instant reactivity
- **MQTT Setup** - Eclipse Mosquitto with Docker Compose configuration
- **NestJS MQTT Integration** - Global module configuration and environment setup
- **SSE Controller** - Server-Sent Events endpoints with authentication and user context
- **SSE Service** - MQTT subscription orchestration with business logic and topic management
- **Publishing Events** - Emit to MQTT from services, use-cases, and webhook handlers
- **Business Rules** - Topic authorization, access control, security patterns
- **RabbitMQ Bridge** - Forward RabbitMQ events to MQTT for client distribution
- **Performance** - Connection pooling, message filtering, QoS levels, load balancing
- **Testing** - Unit tests, integration tests, manual testing tools
- **Use Cases** - Order tracking, live dashboards, webhook notifications, IoT monitoring
- **Security** - JWT authentication, topic authorization, rate limiting, input sanitization
- **Troubleshooting** - Connection drops, message delivery issues, memory leaks, CORS
- **Related Docs** - Integration with RabbitMQ, webhooks, external APIs

### [Scheduler Bull - `./how-to-use-scheduler-bull-redis-backend.md`]()

- **When to Use** - Distributed scheduled tasks, horizontal scalability, automatic retry
- **node-cron vs Bull Difference** - Feature comparison and when to use each
- **Installation** - Bull packages
- **Folder Structure** - Organization jobs/, processors/, services/
- **Global Configuration** - Common and reusable BullConfigModule
- **@Cron Decorator** - Create custom decorator with metadata
- **How It Works** - Flow: Decorator → Metadata → Jobs Registry → Bull
- **Create Jobs** - Classes with methods marked by @Cron
- **Create Processor** - @Processor and @Process to execute jobs
- **Registry Service** - OnModuleInit to read metadata and register jobs
- **Cron Expressions** - Quick reference for common schedules
- **Bull Board Dashboard** - Web UI for queue monitoring
- **Tests** - Test jobs and processors in isolation
- **Manual Trigger** - Endpoint for on-demand job trigger
- **Best Practices** - Retry, logging, unique jobId, explicit timezone
- **Troubleshooting** - Duplicate job, doesn't execute, DI errors
- **Checklist** - Complete implementation verification
- **Complete Example** - Notifications module with scheduler

### [Date Handling - `./how-to-handle-dates-backend-frontend.md`]()

- **Golden Rule** - Database UTC, Backend UTC
- **Database** - TIMESTAMP WITH TIME ZONE, always UTC
- **Backend** - dayjs.utc() for all manipulations
- **Backend DTO** - Validation with @IsISO8601()
- **Backend Service** - Convert ISO string to UTC Date
- **Common Operations** - Practical examples for backend
- **Checklist** - Implementation verification
- **Common Errors** - What not to do vs what to do

### [Initial Setup - `./how-to-setup-backend.md`]()

- **Overview** - Configure NestJS + TypeORM from scratch
- **Prerequisites** - Node.js 18+, PostgreSQL, npm/yarn
- **Step 1: Create Project** - nest new backend
- **Step 2: Install Dependencies** - TypeORM, Passport, Validation, Swagger
- **Step 3: Configure tsconfig** - Path aliases @/*
- **Step 4: Folder Structure** - modules, config, common, database
- **Step 5: .env File** - Environment variables
- **Step 6: database.config.ts** - TypeORM configuration
- **Step 7: package.json Scripts** - Migration commands
- **Step 8: app.module.ts** - ConfigModule and TypeOrmModule
- **Next Steps** - References to continue setup

### [API and Endpoints - `./how-to-create-api-backend.md`]()

- **Step 1: Generate Resource** - nest g resource command
- **Step 2: Create Entity** - TypeORM data model
- **Step 3: Create DTOs** - Create and Update with validation
- **Step 4: Implement Service** - Business logic and CRUD
- **Step 5: Implement Controller** - REST routes **with v1 versioning**
- **Step 6: Configure Module** - Dependency registration
- **Step 7: Register in AppModule** - Global import
- **Step 8: Create Migration** - Schema versioning
- **Step 9: Test API** - Via Swagger or curl
- **Advanced Resources** - Pagination, filters, relationships
- **Implementation Checklist** - Complete verification list

### [API Versioning - `./how-to-version-api-backend.md`]()

- **Why version** - Avoid breaking integrations, allow evolution
- **When to version** - Breaking changes, contract changes
- **Strategies** - URL (recommended), Header, Query Parameter
- **NestJS Implementation** - VersioningType.URI
- **Folder structure** - Organization by version (v1/, v2/)
- **Complete example** - Evolution from V1 to V2
- **Share code** - Adapter Pattern, Base Services
- **Swagger per version** - Separate documentation
- **Deprecation** - Warning headers, transition period
- **Best practices** - Always start with v1, document changes
- **Tests** - Test multiple versions

### [External API Integration - `./how-to-integrate-external-api-backend.md`]()

- **HTTP Client Configuration** - Base HttpService with Axios
- **Service Structure** - Pattern for external integration
- **Authentication** - API Key, Bearer Token, Basic Auth, OAuth 2.0
- **Timeout and Retry** - Configuration and implementation
- **Circuit Breaker** - Protection against unstable APIs
- **Response Cache** - In-memory and Redis
- **Rate Limiting** - Detect 429 and local throttle
- **Webhooks** - Receive events from external APIs
- **Test Mocks** - HttpService mock and nock
- **Environment Variables** - Secure configuration
- **Complete Example** - Providers module (Yahoo, Kinvo, B3)
- **Best Practices** - Implementation checklist

### [Swagger - `./how-to-document-swagger-backend.md`]()

- **Initial Configuration** - Swagger setup in main.ts
- **Document Controllers** - Main decorators
- **Document DTOs** - @ApiProperty and examples
- **Document Responses** - Types and multiple status codes
- **Useful Decorators** - @ApiTags, @ApiBearerAuth, @ApiOperation
- **Hide Properties** - @ApiHideProperty and @Exclude
- **Test in Swagger UI** - How to authenticate and test endpoints
- **Document Pagination** - Paginated response DTO
- **Documentation Checklist** - Complete verification
- **Tips** - Documentation best practices

### [Data Validation - `./how-to-use-data-validation-api-backend.md`]()

- **Global Configuration** - ValidationPipe in main.ts
- **String Validators** - IsString, IsEmail, MaxLength, Matches
- **Numeric Validators** - IsNumber, Min, Max, IsPositive
- **Boolean Validators** - IsBoolean
- **Date Validators** - IsDate, MinDate, MaxDate
- **Array Validators** - IsArray, ArrayMinSize, each item
- **Enum Validators** - IsEnum
- **Optional Fields** - @IsOptional
- **Complete Example: Create DTO** - Full validation
- **Nested Object Validation** - @ValidateNested
- **Custom Validation** - Create own validators
- **Error Messages** - Message customization
- **Conditional Validation** - @ValidateIf
- **Type Transformation** - @Type and @Transform
- **Error Handling** - Structure and capture
- **Best Practices** - Validation checklist

## [💾 Database]()

Documentation about TypeORM, entities, migrations and database schema management.

### [TypeORM Entity - `./how-to-create-typeorm-entity-backend.md`]()

- **Basic Structure** - Simple entity, SuperEntity and SoftDeletableEntity
- **SuperEntity** - Base class with id, created_at, updated_at
- **SoftDeletableEntity** - Base class for soft delete (extends SuperEntity)
- **JunctionEntity** - Base class for junction tables with composite keys
- **Column Types** - Text, numbers, boolean, date, JSON
- **Relationships** - Many-to-One, One-to-Many, Many-to-Many, Explicit Junction Entity
- **Advanced Features** - Indexes, unique, default values
- **Optional Columns** - nullable
- **Enums** - Definition and usage
- **Field Exclusion** - @Exclude for sensitive data
- **Soft Delete** - SoftDeletableEntity, softDelete(), restore(), withDeleted
- **Conventions** - Naming of classes, tables, columns
- **Complete Example** - Entity with all features
- **Register in Module** - TypeOrmModule.forFeature
- **Use in Service** - @InjectRepository
- **Important Tips** - Best practices

### [Migrations - `./how-to-create-migration-backend.md`]()

- **What are Migrations** - Database versioning
- **Available Commands** - create, generate, run, revert, show
- **Create Manual Migration** - Step by step
- **Migration Types** - Create table, add column, indexes, FK
- **Example: Add Field** - Complete migration
- **Example: Relationship** - Add FK
- **Automatic Migrations** - migration:generate
- **Best Practices** - Down, tests, naming, single responsibility, **NEVER triggers/functions**
- **Important Rule** - All business logic in application, not in database
- **Troubleshooting** - Common problems and solutions
- **package.json Scripts** - Available commands

### [Migration Commands - `./migration-commands-packagejson-backend.md`]()

- **Required Scripts** - typeorm, generate, create, run, revert, show
- **typeorm (Base)** - Base script with ts-node
- **migration:generate** - Auto-generate
- **migration:create** - Create empty
- **migration:run** - Execute pending
- **migration:revert** - Revert last
- **migration:show** - List status
- **db:drop** - Reset database
- **Workflow** - Create entity - generate - execute
- **DataSource Configuration** - database.config.ts
- **Required Dependencies** - ts-node, tsconfig-paths
- **Additional Scripts** - seed, check, backup
- **CI/CD Integration** - GitHub Actions, Docker
- **Troubleshooting** - Common errors

## [🔐 Authentication and Security]()

Guides for implementing JWT authentication, API Key and security strategies.

### [JWT Authentication - `./how-authentication-works.md`]()

- **Overview** - Complete JWT system
- **Authentication Flow** - Signup - Login - Requests
- **User Entity** - User model
- **JWT Strategy** - Token validation
- **Local Strategy** - Login with credentials
- **Auth Service** - Authentication logic
- **Auth Controller** - Public endpoints
- **Guards** - Global JWT Guard and Local Guard
- **Public Decorator** - Mark public routes
- **How to Use in Controller** - Access req.user
- **Data Isolation** - Filter by userId
- **Complete Flow** - Signup, Login, Authenticated request
- **Environment Variables** - JWT_SECRET, JWT_EXPIRATION
- **Security** - Implemented best practices
- **Troubleshooting** - Common issues

### [API Key - `./how-api-key-authentication-works.md`]()

- **What is API Key** - Alternative authentication
- **When to Use** - Integrations, webhooks, cron jobs
- **Configure Variable** - X_API_KEY in .env
- **Create Guard** - ApiKeyAuthGuard
- **Create Decorator** - @ApiKeyAuth()
- **Register Global** - main.ts
- **How to Use** - Endpoint with API Key
- **How to Call** - curl, Axios, fetch
- **Advanced Implementation** - Multiple API Keys per client
- **Rate Limiting** - Limit requests
- **Document Swagger** - addApiKey
- **Security** - Best practices
- **JWT vs API Key Differences** - Comparison table
- **Troubleshooting** - Common errors

## [🤖 Agent System and Review Pipeline]()

Specialized agent system and review pipeline to ensure quality and compliance with project technical rules.

### [Review Pipeline - `./agent-review-pipeline.md`]()

- **Overview** - Two-stage review pipeline
- **Complete Flow** - developer → feature-review → code-review
- **Involved Agents** - developer-fullstack, feature-review, code-reviewer
- **developer-fullstack** - Implement following technical rules (`.rules`)
- **feature-review** - Validate completeness vs task requirements
- **code-reviewer** - Validate compliance vs technical rules (`.rules`)
- **Detailed Pipeline** - Stage 1 (Completeness) and Stage 2 (Quality)
- **Correction Loop** - Flow when there are incompatibilities or violations
- **Complete Example** - Implement Product CRUD with 4 rounds
- **Best Practices** - For Scrum Master, Developers and Reviewers
- **Output Files** - Reports in ./todo/
- **Summary** - Ensure complete code compliant with rules

## [🏗️ Backend Structure and Patterns]()

Architecture, code organization and design patterns for scalable backend modules.

### [Project Root Structure - `./project-root-structure.md`]()

- **Root Directory Organization** - Standard folder structure for monorepo
- **Allowed Files and Folders** - Complete whitelist/blacklist at root level
- **Backend Folder Naming** - Official `backend/` convention vs `back/`
- **Prohibited Items** - package.json, node_modules, configs at root
- **Keeping Root Clean** - Scripts and automation for verification
- **Migration Guide** - Step-by-step cleanup for existing projects
- **Best Practices** - Root directory management and maintenance

### [Main File - `./how-main-file-works-backend.md`]()

- **What is main.ts** - Entry point
- **Basic Structure** - Minimal bootstrap
- **Complete Configuration** - Project setup with NestExpressApplication
- **1. NestFactory.create** - Create application with Express typing
- **2. Global Prefix** - /api in all routes
- **3. CORS** - Enable cross-origin
- **4. Serve Static Files** - useStaticAssets for public folder
- **5. SPA Fallback** - React Router with index.html
- **6. Global ValidationPipe** - Automatic validation
- **7. Global Guards** - JWT Auth
- **8. Swagger** - Documentation with Bearer and API Key
- **9. Listen** - Start server
- **Detailed Explanation** - Each section with examples
- **Optional Configurations** - Helmet, compression, rate limiting
- **Environment Variables** - Required .env
- **Checklist** - Setup verification

### [Folder Structure - `./backend-module-folder-structure.md`]()

- **Standard Structure** - File organization
- **Module** - Module configuration
- **Controller** - REST endpoints
- **Service** - Business logic
- **Entity** - Data model
- **DTOs** - Input validation
- **When to Create Sub-services** - Complex logic
- **When to Use Interfaces** - Contracts
- **When to Use Enums** - Fixed values
- **Real Example** - Simple and complex module
- **Naming Conventions** - Pattern table
- **Organization by Size** - Small, medium, large
- **Module Location** - src/modules
- **Tips** - Best practices

### [Scalable Pattern - `./scalable-implementation-pattern-backend.md`]()

- **Fundamental Principles** - Single Responsibility, DI, Inversion
- **1. Single Responsibility** - One class, one responsibility
- **2. Dependency Injection** - Inject dependencies
- **Implementation Patterns** - Use-Case (MAIN), Repository, DTO, Strategy, Factory
- **1. Use-Case Pattern** - ⭐ MAIN pattern for complex business rules (see ./how-to-create-use-case-backend.md)
- **3. Dependency Inversion** - Depend on abstractions
- **Repository Pattern** - TypeORM repository
- **DTO Pattern** - Validation and transfer
- **Strategy Pattern** - Multiple implementations
- **Factory Pattern** - Complex creation
- **Layer Separation** - Controller - Service - Repository
- **Error Handling** - NestJS exceptions
- **Ownership Validation** - Filter by userId
- **Transactions** - Atomic operations
- **Logging** - NestJS Logger
- **Tests** - Testable structure
- **Checklist** - Scalability verification
- **Final Tips** - Best practices

### [Use-Cases - `./how-to-create-use-case-backend.md`]()

- **What is Use-Case** - Class with interfaces segregated by responsibility
- **When to Use** - Complex rules, multiple transactions, multiple responsibilities
- **When NOT to Use** - Simple CRUD, direct operations, trivial endpoints
- **File Structure** - use-cases/ folder, interfaces.ts, *.usecase.ts
- **Naming Convention** - Patterns for interfaces and use-cases
- **Step 1: Define Interfaces** - One responsibility = one method per interface
- **Step 2: Create Use-Case** - Implement multiple related interfaces
- **Step 3: Register in Module** - Add to providers and exports
- **Step 4: Inject** - Via DI in Service or Controller
- **SOLID Principles** - S (Single Responsibility), O (Open/Closed), L (Liskov), I (Interface Segregation), D (Dependency Inversion)
- **Testing Use-Cases** - Reference to complete testing guide
- **Service vs Use-Case Differences** - Detailed comparison and when to use each
- **Best Practices** - One interface = one method, descriptive naming, type aliases
- **Checklist** - Complete implementation verification
- **Troubleshooting** - Cannot resolve dependency, circular dependency, use-case too large
- **Complete Example** - Order module with interfaces and use-cases

### [Use-Case Tests - `./how-to-test-use-cases-jest-backend.md`]()

- **Test Principles** - Test only Use-Cases, mock dependencies, isolated execution
- **Jest Configuration** - jest.config.js, package.json scripts, dependencies
- **File Structure** - Location and naming of .spec.ts
- **Basic Template** - Standard Use-Case test structure
- **Complete Example** - FinancialRulesUseCase with mocks
- **Mock Multiple Dependencies** - Repository + HttpService + ConfigService
- **Mock ConfigService** - Simulate environment variables
- **Test Exceptions** - BadRequestException, NotFoundException
- **Jest.spyOn** - Mock methods of the Use-Case itself
- **Tests with Dates** - useFakeTimers and setSystemTime
- **Arrange-Act-Assert Pattern** - Test organization
- **Code Coverage** - 100% goal for Use-Cases
- **Jest Commands** - test, watch, coverage, debug
- **Checklist** - Complete test verification
- **Common Errors** - Solutions for frequent problems

## [📖 Quick Guides]()

Shortcuts for common tasks with direct links to specific guide sections.

### [Create complete new backend module]()

1. [How to create an API](./how-to-create-api-backend.md#passo-a-passo)
2. [How to create Entity](./how-to-create-typeorm-entity-backend.md#estrutura-básica)
3. [How to create Migration](./how-to-create-migration-backend.md#passo-a-passo-criar-migration-manual)
4. [How to document Swagger](./how-to-document-swagger-backend.md#documentar-controllers)
5. [How to validate data](./how-to-use-data-validation-api-backend.md#exemplo-completo-create-dto)

### [Authentication setup]()

1. [JWT Authentication](./how-authentication-works.md#componentes-do-sistema)
2. [API Key](./how-api-key-authentication-works.md#implementação)

## [🔍 Keyword Search]()

Alphabetical index of technical terms with direct links to corresponding guides.

| Keyword | Main Document |
|---------|---------------|
| Project Structure | [Project Root Structure](./project-root-structure.md) |
| Root Structure | [Project Root Structure](./project-root-structure.md) |
| Folder Organization | [Project Root Structure](./project-root-structure.md), [Backend Modules](./backend-module-folder-structure.md) |
| Monorepo | [Project Root Structure](./project-root-structure.md) |
| backend/ folder | [Project Root Structure](./project-root-structure.md#backend-folder-naming-convention) |
| Directory Structure | [Project Root Structure](./project-root-structure.md) |
| Agents | [Review Pipeline](./agent-review-pipeline.md) |
| Pipeline | [Review Pipeline](./agent-review-pipeline.md) |
| feature-review | [Review Pipeline](./agent-review-pipeline.md#2-feature-review) |
| code-reviewer | [Review Pipeline](./agent-review-pipeline.md#3-code-reviewer) |
| developer-fullstack | [Review Pipeline](./agent-review-pipeline.md#1-developer-fullstack) |
| Code Review | [Review Pipeline](./agent-review-pipeline.md) |
| TypeScript | [TypeScript Patterns](./typescript-patterns-standards.md) |
| any | [TypeScript Patterns - Rule #1](./typescript-patterns-standards.md#regra-1-nunca-use-o-tipo-any) |
| unknown | [TypeScript Patterns - Rule #4](./typescript-patterns-standards.md#regra-4-use-unknown-ao-invés-de-any-para-tipos-desconhecidos) |
| Generics | [TypeScript Patterns - Rule #7](./typescript-patterns-standards.md#regra-7-generics-para-código-reutilizável) |
| Type Guards | [TypeScript Patterns](./typescript-patterns-standards.md#type-guards-comuns) |
| strict mode | [TypeScript Patterns - Rule #2](./typescript-patterns-standards.md#regra-2-sempre-use-strict-true-no-tsconfigjson) |
| Typing | [TypeScript Patterns](./typescript-patterns-standards.md) |
| Backend Setup | [Initial Setup](./how-to-setup-backend.md) |
| NestJS Setup | [Initial Setup](./how-to-setup-backend.md) |
| TypeORM | [Entity](./how-to-create-typeorm-entity-backend.md), [Migration](./how-to-create-migration-backend.md) |
| SuperEntity | [Entity Base Class](./how-to-create-typeorm-entity-backend.md#superentity-base-class---automatic-id-and-timestamps) |
| SoftDeletableEntity | [Soft Delete](./how-to-create-typeorm-entity-backend.md#softdeletableentity-base-class---recoverable-deletion-pattern) |
| JunctionEntity | [Junction Tables](./how-to-create-typeorm-entity-backend.md#junctionentity-base-class---composite-key-junction-tables-with-timestamps) |
| Composite Key | [Junction Tables](./how-to-create-typeorm-entity-backend.md#junctionentity-base-class---composite-key-junction-tables-with-timestamps) |
| Many-to-Many | [Entity Relationships](./how-to-create-typeorm-entity-backend.md#entity-relationships---many-to-many-junction-table-pattern) |
| Junction Table | [Explicit Junction Entity](./how-to-create-typeorm-entity-backend.md#entity-relationships---explicit-junction-entity-pattern-with-junctionentity) |
| JWT | [Authentication](./how-authentication-works.md) |
| Swagger | [API Documentation](./how-to-document-swagger-backend.md) |
| Validation | [API Data](./how-to-use-data-validation-api-backend.md) |
| Versioning | [API Versioning](./how-to-version-api-backend.md) |
| API Versioning | [API Versioning](./how-to-version-api-backend.md) |
| v1 v2 | [API Versioning](./how-to-version-api-backend.md) |
| Breaking Changes | [API Versioning](./how-to-version-api-backend.md) |
| Axios | [Backend External API](./how-to-integrate-external-api-backend.md) |
| NestJS | [Create API](./how-to-create-api-backend.md), [Main](./how-main-file-works-backend.md) |
| Guards | [Authentication](./how-authentication-works.md#guards-proteção-de-rotas) |
| DTOs | [Validation](./how-to-use-data-validation-api-backend.md), [Create API](./how-to-create-api-backend.md#passo-3-criar-dtos-validação) |
| CRUD | [Create API](./how-to-create-api-backend.md#passo-4-implementar-o-service) |
| Dates | [Date Handling](./how-to-handle-dates-backend-frontend.md) |
| dayjs | [Date Handling](./how-to-handle-dates-backend-frontend.md) |
| UTC | [Date Handling](./how-to-handle-dates-backend-frontend.md) |
| Timezone | [Date Handling](./how-to-handle-dates-backend-frontend.md) |
| Triggers | [Migrations](./how-to-create-migration-backend.md#8-nunca-crie-triggers-ou-funções-no-banco-de-dados) |
| PostgreSQL Functions | [Migrations](./how-to-create-migration-backend.md#8-nunca-crie-triggers-ou-funções-no-banco-de-dados) |
| Stored Procedures | [Migrations](./how-to-create-migration-backend.md#8-nunca-crie-triggers-ou-funções-no-banco-de-dados) |
| External API | [External API Integration](./how-to-integrate-external-api-backend.md) |
| HTTP Client | [External API Integration](./how-to-integrate-external-api-backend.md) |
| Webhooks | [External API Integration](./how-to-integrate-external-api-backend.md#webhooks), [API Key](./how-api-key-authentication-works.md) |
| Circuit Breaker | [External API Integration](./how-to-integrate-external-api-backend.md#circuit-breaker-pattern) |
| Cache | [Redis](./how-to-use-redis-backend.md), [External API Integration](./how-to-integrate-external-api-backend.md#cache-de-respostas) |
| Redis | [How to use Redis](./how-to-use-redis-backend.md) |
| RabbitMQ | [How to use RabbitMQ](./how-to-use-rabbitmq-backend.md) |
| Topic Exchange | [RabbitMQ - Topic Exchange](./how-to-use-rabbitmq-backend.md#arquitetura-topic-exchange) |
| Queues | [RabbitMQ](./how-to-use-rabbitmq-backend.md) |
| Background Jobs | [RabbitMQ](./how-to-use-rabbitmq-backend.md#quando-usar-rabbitmq) |
| Events | [RabbitMQ - Topics](./how-to-use-rabbitmq-backend.md#padrão-de-nomenclatura-de-tópicos) |
| Retry | [RabbitMQ - Retries](./how-to-use-rabbitmq-backend.md#2-controle-de-retries-com-contador), [External API](./how-to-integrate-external-api-backend.md#timeout-e-retry) |
| Dead Letter Queue | [RabbitMQ - DLQ](./how-to-use-rabbitmq-backend.md#1-dead-letter-queue-dlq-com-topic-exchange) |
| Asynchronous Processing | [RabbitMQ](./how-to-use-rabbitmq-backend.md#quando-usar-rabbitmq) |
| Wildcards | [RabbitMQ - Pattern Matching](./how-to-use-rabbitmq-backend.md#2-consumer-com-pattern-matching-wildcards) |
| Rate Limit | [Redis - Rate Limiting](./how-to-use-redis-backend.md#2-rate-limiting), [External API](./how-to-integrate-external-api-backend.md#tratamento-de-rate-limiting) |
| Horizontal Scaling | [Redis](./how-to-use-redis-backend.md#quando-usar-redis), [RabbitMQ](./how-to-use-rabbitmq-backend.md) |
| Sessions | [Redis - Shared Sessions](./how-to-use-redis-backend.md#4-sessões-compartilhadas) |
| Counter | [Redis - Atomic Counter](./how-to-use-redis-backend.md#1-contador-compartilhado-incremento-atômico) |
| Scheduler | [Bull Scheduler](./how-to-use-scheduler-bull-redis-backend.md) |
| Cron | [Bull Scheduler - Cron Expressions](./how-to-use-scheduler-bull-redis-backend.md#exemplo-expressões-cron-comuns) |
| Bull | [Bull Scheduler](./how-to-use-scheduler-bull-redis-backend.md) |
| Scheduled Tasks | [Bull Scheduler](./how-to-use-scheduler-bull-redis-backend.md#quando-usar-scheduler-com-bull) |
| Scheduled Background Jobs | [Bull Scheduler](./how-to-use-scheduler-bull-redis-backend.md) |
| Bull Board | [Bull Scheduler - Dashboard](./how-to-use-scheduler-bull-redis-backend.md#como-adicionar-bull-board-dashboard) |
| Cron Decorator | [Bull Scheduler - @Cron](./how-to-use-scheduler-bull-redis-backend.md#criar-decorator-cron-customizado) |
| Unit Tests | [Use-Case Tests](./how-to-test-use-cases-jest-backend.md) |
| Jest | [Use-Case Tests](./how-to-test-use-cases-jest-backend.md) |
| Mocks | [Use-Case Tests](./how-to-test-use-cases-jest-backend.md#mockando-múltiplas-dependências) |
| Test Coverage | [Use-Case Tests](./how-to-test-use-cases-jest-backend.md#cobertura-de-código) |
| Use-Case | [Create Use-Case](./how-to-create-use-case-backend.md), [Tests](./how-to-test-use-cases-jest-backend.md) |

## [🗺️ Navigation by Level]()

Guides organized by complexity level: beginner, intermediate and advanced.

### [🌱 Beginner]()

1. [Project Root Structure](./project-root-structure.md) - **Start here for new projects**
2. [Backend Stack](./backend-technology-stack.md#stack-principal)
3. [Backend Setup](./how-to-setup-backend.md#visão-geral)
4. [JWT Authentication](./how-authentication-works.md#visão-geral)

### [🌿 Intermediate]()

1. [Create Backend API](./how-to-create-api-backend.md#visão-geral)
2. [API Versioning](./how-to-version-api-backend.md#por-que-versionar-apis)
3. [Create Entity](./how-to-create-typeorm-entity-backend.md#estrutura-básica)
4. [Create Migration](./how-to-create-migration-backend.md#passo-a-passo-criar-migration-manual)
5. [Document Swagger](./how-to-document-swagger-backend.md#documentar-controllers)
6. [Redis - Cache and Horizontal Scaling](./how-to-use-redis-backend.md#configuração-global-common-module)
7. [RabbitMQ - Queues and Background Jobs](./how-to-use-rabbitmq-backend.md#configuração-global-common-module)
8. [Bull Scheduler - Scheduled Tasks](./how-to-use-scheduler-bull-redis-backend.md#quando-usar-scheduler-com-bull)
9. [Integrate External API](./how-to-integrate-external-api-backend.md#configuração-do-cliente-http)
10. [Date Handling](./how-to-handle-dates-backend-frontend.md#princípios-fundamentais)

### [🌳 Advanced]()

1. [Scalable Pattern](./scalable-implementation-pattern-backend.md#princípios-fundamentais)
2. [Folder Structure](./backend-module-folder-structure.md#estrutura-padrão)
3. [Main File](./how-main-file-works-backend.md#configuração-completa-do-projeto)
4. [API Key](./how-api-key-authentication-works.md#implementação-avançada)
5. [Custom Validation](./how-to-use-data-validation-api-backend.md#validação-customizada)

## [📁 File Structure]()

Complete directory tree showing organization of all documentation files.

```
.rules/
├── SUMMARY.md                                              (this file)
│
├── Agent System
│   └── agent-review-pipeline.md                           (12 sections + complete example)
│
├── Stack and Technologies
│   ├── typescript-patterns-standards.md                   (10 rules + examples)
│   └── backend-technology-stack.md                        (11 sections)
│
├── Backend - API
│   ├── how-to-create-api-backend.md                       (11 steps + extras)
│   ├── how-to-version-api-backend.md                      (12 sections + examples)
│   ├── how-to-integrate-external-api-backend.md           (12 sections)
│   ├── how-to-document-swagger-backend.md                 (10 sections)
│   ├── how-to-use-data-validation-api-backend.md          (15 topics)
│   ├── how-to-handle-dates-backend-frontend.md            (12 sections + examples)
│   ├── how-to-use-redis-backend.md                        (15 sections + examples)
│   ├── how-to-use-rabbitmq-backend.md                     (17 sections + examples)
│   ├── how-to-implement-realtime-sse-mqtt-backend.md      (16 sections + examples)
│   └── how-to-use-scheduler-bull-redis-backend.md         (17 sections + examples)
│
├── Backend - Database
│   ├── how-to-create-typeorm-entity-backend.md            (14 topics)
│   ├── how-to-create-migration-backend.md                 (9 types + examples)
│   └── migration-commands-packagejson-backend.md          (7 commands)
│
├── Backend - Authentication
│   ├── how-authentication-works.md                        (15 sections)
│   └── how-api-key-authentication-works.md                (10 topics)
│
└── Backend - Structure
    ├── how-to-setup-backend.md                            (9 steps)
    ├── how-main-file-works-backend.md                     (8 configurations)
    ├── backend-module-folder-structure.md                 (6 sections)
    ├── scalable-implementation-pattern-backend.md         (10 patterns)
    ├── how-to-create-use-case-backend.md                  (15 sections)
    └── how-to-test-use-cases-jest-backend.md              (14 sections)
```

## [📊 Statistics]()

- **Total documents**: 24
- **Agent System**: 1 document (12 sections)
- **Backend**: 19 documents (263 sections)
- **Stack**: 2 documents (21 sections)
- **Total sections**: 306 documented sections


---

**Last update**: January 21, 2025
**Documentation maintained by**: Claude Code
**Version**: 1.1.0
