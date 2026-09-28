# [How to Setup Backend from Scratch]()

Complete guide to configure a NestJS TypeORM backend project from scratch with PostgreSQL database integration, JWT authentication system, path aliases, and all dependencies.

## [Step 1 - Install Node.js and PostgreSQL Prerequisites]()

System requirements and essential tools verification before initializing NestJS backend project including Node.js version 18 or higher installation, PostgreSQL database server setup and running verification, npm or yarn package manager availability, and NestJS CLI global installation for project scaffolding.

### When to use?

Use this prerequisites check before starting any new NestJS backend project, when setting up development environment on new machine, when onboarding new developers to team requiring local development setup, or when troubleshooting project initialization failures.

### When NOT to use?

Do not use for Docker-based development where dependencies are containerized, skip for cloud-based development environments with pre-configured tooling, avoid for contributing to existing project where setup is already complete.

### Example

Verify Node.js, npm, PostgreSQL installation and install NestJS CLI globally for project creation.

**Prerequisites Verification:**

```bash
# Verify Node.js version (must be 18+)
node --version
# Expected output: v18.x.x or v20.x.x

# Verify npm is available
npm --version
# Expected output: 9.x.x or higher

# Verify PostgreSQL is installed and running
psql --version
# Expected output: psql (PostgreSQL) 14.x or higher

# Test PostgreSQL connection
psql -U postgres -c "SELECT version();"
# Should return PostgreSQL version without errors
```

**Install NestJS CLI globally:**

```bash
npm install -g @nestjs/cli
```

### Checklist

- [ ] Node.js 18+ installed and verified with `node --version`
- [ ] npm or yarn package manager available
- [ ] PostgreSQL 14+ installed and server running
- [ ] Can connect to PostgreSQL with `psql -U postgres`
- [ ] NestJS CLI installed globally with `npm install -g @nestjs/cli`
- [ ] Development environment has sufficient disk space (minimum 2GB free)
- [ ] Internet connection available for npm package downloads

### Troubleshooting

**Problem**: Node.js version too old
- **Solution**: Use nvm to install Node.js 18 or higher, uninstall old version if necessary

**Problem**: PostgreSQL connection fails with authentication error
- **Solution**: Verify postgres user password, check pg_hba.conf allows local connections, restart PostgreSQL service

**Problem**: NestJS CLI command not found after installation
- **Solution**: Verify npm global bin directory is in PATH, restart terminal, use npx @nestjs/cli instead

### Best Practices

- Use Node Version Manager (nvm) for managing multiple Node.js versions across projects
- Install PostgreSQL via official package manager or Docker for consistent environment
- Keep NestJS CLI updated to latest version for newest features and bug fixes
- Document specific version requirements in team wiki or README
- Consider using Docker Compose for PostgreSQL to simplify developer onboarding

## [Step 2 - Initialize NestJS Project and Create Folder Structure]()

Complete project creation process using NestJS CLI including running nest new command for backend folder generation, selecting npm or yarn package manager, creating modular folder structure for business logic separation, establishing common shared code organization, and setting up database-related directories for migrations and entities.

### When to use?

Use NestJS CLI initialization when starting new backend project from scratch, when creating microservice within monorepo architecture, when establishing backend for full-stack application, or when prototyping new API service requiring rapid scaffolding.

### When NOT to use?

Do not use for contributing to existing NestJS project where structure is established, skip for non-Node.js backend projects, avoid for serverless functions requiring different architecture, and do not use when organization has custom project generator.

### Example

Create NestJS project and organize modular folder structure for business modules, common code, and database files.

**Create NestJS Project:**

```bash
# Install Nest CLI globally (if not already installed)
npm install -g @nestjs/cli

# Create project in backend subfolder
nest new backend

# Enter backend folder
cd backend
```

**During creation, select:**
- Package manager: `npm` or `yarn` (choose based on team preference)

**Create Modular Folder Structure:**

```bash
# Inside backend/src directory
mkdir -p modules/user
mkdir -p modules/auth
mkdir -p config
mkdir -p common/decorators
mkdir -p common/guards
mkdir -p common/filters
mkdir -p database/migrations
mkdir -p database/entities
```

**Resulting Project Structure:**

```
backend/
├── src/
│   ├── modules/          # Business modules
│   │   ├── user/
│   │   └── auth/
│   ├── config/           # Configuration files
│   ├── common/           # Shared code
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── filters/
│   ├── database/
│   │   ├── migrations/   # TypeORM migrations
│   │   └── entities/     # SuperEntity (centralized)
│   ├── app.module.ts
│   └── main.ts
├── test/
├── tsconfig.json
├── package.json
└── nest-cli.json
```

**Entity Organization Pattern:**
- **SuperEntity**: `src/database/entities/super.entity.ts` (centralized base entity)
- **Module Entities**: `src/modules/[name]/entities/` (feature-specific entities)

**Note**: This structure shows the backend folder organization. For complete project root structure including where backend/, frontend/, and build/ folders should be located, see [Project Root Structure](./project-root-structure.md).

### Checklist

- [ ] Execute `nest new backend` command successfully
- [ ] Select appropriate package manager (npm recommended)
- [ ] Verify node_modules and package-lock.json created
- [ ] Create modules folder for business logic organization
- [ ] Create config folder for configuration files
- [ ] Create common folder for shared decorators guards filters
- [ ] Create database folder with migrations and entities subfolders
- [ ] Verify app.module.ts and main.ts exist in src root

### Troubleshooting

**Problem**: nest new command fails with permission error
- **Solution**: Run with appropriate permissions, check NestJS CLI installed globally correctly, verify write permissions in target directory

**Problem**: Project creation hangs during package installation
- **Solution**: Check internet connection, try clearing npm cache with `npm cache clean --force`, use yarn instead if npm fails

**Problem**: Unclear which package manager to choose
- **Solution**: Use npm for consistency with most NestJS documentation, use yarn if team already standardized on it

### Best Practices

- Follow modular architecture separating business domains into modules folder
- Centralize common code (decorators, guards, filters) in common folder for reusability
- Keep migrations separate from entities for clear database versioning
- Use descriptive module names reflecting business domain (e.g., user, auth, products)
- Document folder structure purpose in README for new team members
- Maintain flat module structure initially, refactor to nested when complexity increases

## [Step 3 - Configure TypeScript with Path Aliases]()

TypeScript compiler configuration optimizing for NestJS development including ES2021 target compilation, decorator metadata emission, strict null checks disabled for flexibility, and path alias setup enabling clean imports using @ symbol avoiding relative path complexity.

### When to use?

Configure path aliases in every NestJS project to simplify imports, when project has deep folder nesting making relative paths cumbersome, when establishing coding standards requiring consistent import patterns, or when improving code readability and maintainability.

### When NOT to use?

Do not skip path alias configuration as it significantly improves developer experience, avoid complex path mapping schemes confusing developers, skip custom aliases for small projects with flat structure where relative paths are simple.

### Example

Configure tsconfig.json with path aliases to enable clean imports using @ symbol instead of relative paths.

**Configure tsconfig.json with Path Aliases:**

Edit `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Benefits of Path Aliases:**

Before (relative paths):
```typescript
import { User } from '../../../modules/user/entities/user.entity';
import { AuthService } from '../../auth/auth.service';
```

After (path aliases):
```typescript
import { User } from '@/modules/user/entities/user.entity';
import { AuthService } from '@/modules/auth/auth.service';
```

### Checklist

- [ ] Add `"baseUrl": "./"` to tsconfig.json compilerOptions
- [ ] Add `"paths": { "@/*": ["src/*"] }` to compilerOptions
- [ ] Verify target is set to ES2021 or higher
- [ ] Ensure experimentalDecorators is true for NestJS decorators
- [ ] Ensure emitDecoratorMetadata is true for dependency injection
- [ ] Set strictNullChecks to false for NestJS compatibility
- [ ] Test path alias works by importing from @/modules in any file

### Troubleshooting

**Problem**: Path alias imports showing module not found errors
- **Solution**: Verify baseUrl is set to "./", check paths mapping is correct, restart TypeScript server in IDE

**Problem**: Jest tests fail with path alias imports
- **Solution**: Install ts-jest and configure moduleNameMapper in jest config mapping @ to src directory

**Problem**: Build succeeds but runtime fails to resolve @ imports
- **Solution**: Install tsconfig-paths package, require it in main.ts before bootstrap

### Best Practices

- Use single @ prefix for all path aliases for consistency across codebase
- Keep path alias mapping simple, prefer flat structure over complex hierarchies
- Document path alias usage in README for new developers
- Configure IDE to recognize path aliases for autocomplete and navigation
- Add path alias mapping to Jest config for test compatibility
- Use path aliases consistently across entire codebase, avoid mixing with relative imports

## [Step 4 - Configure Environment Variables with dotenv]()

Environment-based configuration management using dotenv pattern including .env file creation for local development, defining server port database credentials JWT secrets, .gitignore configuration preventing secret commit, and .env.example template for documentation purposes.

### When to use?

Use environment variables for all configuration varying across environments including database credentials, API keys, JWT secrets, external service URLs, feature flags, or any sensitive data requiring protection from version control.

### When NOT to use?

Do not use for static configuration that never changes across environments, avoid for non-sensitive public data that can be committed to repository, skip for configuration better suited for database or configuration service.

### Example

Create .env file with database credentials and JWT secrets, configure .gitignore, and create .env.example template.

**Create .env File:**

File: `backend/.env`

```env
# Server
PORT=3000
NODE_ENV=development

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sdd_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# API Key (optional)
X_API_KEY=your-api-key-for-integrations
```

**Create .env.example Template:**

File: `backend/.env.example`

```env
# Server
PORT=3000
NODE_ENV=development

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=your_database_name

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d

# API Key
X_API_KEY=your-api-key-here
```

**Update .gitignore:**

Ensure `backend/.gitignore` includes:

```
.env
.env.local
.env.*.local
```

### Checklist

- [ ] Create .env file in backend root directory
- [ ] Define PORT for server (3000 default)
- [ ] Define NODE_ENV for environment (development/production)
- [ ] Define all database connection variables (host, port, username, password, database)
- [ ] Define JWT_SECRET with strong random value
- [ ] Define JWT_EXPIRATION (7d typical)
- [ ] Add .env to .gitignore to prevent commit
- [ ] Create .env.example with placeholder values for documentation
- [ ] Never commit actual credentials to version control

### Troubleshooting

**Problem**: Application cannot find .env file
- **Solution**: Verify .env is in backend root directory same level as package.json, check ConfigModule isGlobal true

**Problem**: Environment variables returning undefined
- **Solution**: Verify variable names match exactly (case-sensitive), ensure dotenv loaded before usage, check no typos in .env file

**Problem**: .env file accidentally committed to git
- **Solution**: Remove from git history using git filter-branch or BFG Repo-Cleaner, rotate all exposed credentials immediately, update .gitignore

### Best Practices

- Never commit .env files to version control, always add to .gitignore
- Use strong random values for JWT_SECRET in production (minimum 32 characters)
- Create separate .env files for development, staging, production with appropriate values
- Use .env.example as documentation showing all required variables without sensitive values
- Rotate credentials regularly following security best practices
- Consider using secrets management service (AWS Secrets Manager, HashiCorp Vault) for production
- Validate all required environment variables at application startup failing fast if missing
- Document environment variable purpose and expected format in README

## [Step 5 - Configure Database Connection with TypeORM]()

TypeORM database configuration setup including database.config.ts file creation with ConfigService integration, PostgreSQL connection parameters from environment variables, entities auto-loading pattern, migrations configuration, synchronize disabled for production safety, and DataSource export for CLI operations.

### When to use?

Configure TypeORM connection for every NestJS project using PostgreSQL database, when setting up database integration for first time, when migrating from different ORM to TypeORM, or when establishing connection for multiple database instances.

### When NOT to use?

Do not use for NoSQL databases like MongoDB requiring different drivers, skip for projects using raw SQL without ORM, avoid for read-only applications not requiring database write access.

### Example

Create database.config.ts with TypeORM configuration loading credentials from environment variables and exporting DataSource for CLI.

**Create Database Configuration:**

File: `backend/src/config/database.config.ts`

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: +configService.get('POSTGRES_PORT'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // NEVER true in production
  logging: configService.get('NODE_ENV') === 'development',
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: false,
});

// DataSource for migrations CLI
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'sdd_dev',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
};

export const dataSource = new DataSource(dataSourceOptions);
```

### Checklist

- [ ] Create database.config.ts in src/config folder
- [ ] Import TypeOrmModuleOptions and DataSourceOptions from typeorm
- [ ] Create getDatabaseConfig function accepting ConfigService parameter
- [ ] Configure type as 'postgres' for PostgreSQL database
- [ ] Load all connection parameters from ConfigService environment variables
- [ ] Set entities path to auto-load all .entity.ts files
- [ ] Set synchronize to false to prevent auto schema changes
- [ ] Enable logging only in development environment
- [ ] Configure migrations path for TypeORM migration files
- [ ] Export DataSource for CLI migration operations

### Troubleshooting

**Problem**: TypeORM cannot connect to PostgreSQL database
- **Solution**: Verify PostgreSQL is running, check credentials in .env file are correct, ensure database exists

**Problem**: Entities not being loaded automatically
- **Solution**: Verify entity files end with .entity.ts extension, check entities path pattern is correct, ensure files are in src directory

**Problem**: Migration commands not finding database config
- **Solution**: Verify dataSource is exported from database.config.ts, check migration scripts reference correct config file path

### Best Practices

- Always set synchronize to false in production to prevent accidental schema changes
- Use ConfigService to load database credentials from environment variables
- Enable logging in development for debugging SQL queries
- Use glob pattern for entities to auto-load from any module
- Export separate DataSource for CLI migration operations
- Document database connection requirements in README
- Use connection pooling for production deployments to handle concurrent requests
- Implement health check endpoint verifying database connectivity

## [Step 6 - Install Package Dependencies for NestJS Backend]()

Comprehensive dependency installation including TypeORM and PostgreSQL driver for database integration, Passport and JWT for authentication system, class-validator and class-transformer for DTO validation, ConfigService for environment management, Swagger for API documentation, and utility libraries like axios and dayjs.

### When to use?

Install these dependencies immediately after NestJS project creation when setting up production-ready backend, when implementing authentication and database features, when adding API documentation, or when establishing validation and configuration infrastructure.

### When NOT to use?

Do not install all dependencies if not needed for specific project, skip authentication packages for public read-only APIs, avoid Swagger if not documenting public API, and skip specific packages based on actual project requirements.

### Example

Install core dependencies for TypeORM, authentication, validation, configuration, documentation, and utilities.

**Install Core Dependencies:**

```bash
# TypeORM and PostgreSQL
npm install @nestjs/typeorm typeorm pg

# Authentication
npm install @nestjs/passport passport @nestjs/jwt passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt

# Validation
npm install class-validator class-transformer

# Configuration
npm install @nestjs/config

# Swagger (documentation)
npm install @nestjs/swagger

# Utilities
npm install axios dayjs
```

**Install Development Dependencies:**

```bash
# TypeScript path resolution for migrations
npm install -D ts-node tsconfig-paths
```

**Verify Installation:**

```bash
# Check package.json has all dependencies
cat package.json | grep -A 20 "dependencies"

# Verify node_modules created
ls node_modules | head -20
```

### Checklist

- [ ] Install @nestjs/typeorm typeorm pg for database integration
- [ ] Install @nestjs/passport passport @nestjs/jwt passport-jwt bcrypt for authentication
- [ ] Install @types/passport-jwt @types/bcrypt as dev dependencies for TypeScript types
- [ ] Install class-validator class-transformer for DTO validation
- [ ] Install @nestjs/config for environment variable management
- [ ] Install @nestjs/swagger for API documentation
- [ ] Install axios for HTTP client functionality
- [ ] Install dayjs for date manipulation
- [ ] Install ts-node tsconfig-paths as dev dependencies for migration CLI
- [ ] Verify all packages installed successfully without errors

### Troubleshooting

**Problem**: npm install fails with network errors
- **Solution**: Check internet connection, try clearing npm cache with `npm cache clean --force`, use alternative registry if corporate firewall blocks npm

**Problem**: Peer dependency warnings during installation
- **Solution**: Update @nestjs/core and @nestjs/common to latest compatible versions, install suggested peer dependencies

**Problem**: Type definitions not found for installed packages
- **Solution**: Install @types packages for libraries missing TypeScript definitions, check DefinitelyTyped repository

### Best Practices

- Install dependencies incrementally as needed rather than all at once initially
- Keep package versions compatible with NestJS version to avoid conflicts
- Use exact versions in package.json for production deployments to prevent unexpected updates
- Regularly update dependencies checking for security vulnerabilities with `npm audit`
- Document required dependencies and their purpose in README
- Use package-lock.json to ensure consistent installations across environments
- Consider using npm ci in CI/CD pipelines for deterministic installations

## [Step 7 - Configure Migration Scripts in package.json]()

TypeORM migration command shortcuts setup in package.json scripts section including typeorm CLI wrapper with ts-node and tsconfig-paths, migration generation from entity changes, manual migration creation, migration execution and rollback, and migration status display commands.

### When to use?

Configure migration scripts in every project using TypeORM for database schema management, when establishing database versioning workflow, when team needs consistent commands for database operations, or when automating deployment pipelines with database migrations.

### When NOT to use?

Do not use for projects with synchronize enabled in development only, skip for read-only applications not managing database schema, avoid for NoSQL databases not requiring migrations.

### Example

Add TypeORM migration scripts to package.json enabling generate, create, run, revert, and show commands.

**Add Migration Scripts to package.json:**

Edit `backend/package.json`:

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli -d src/config/database.config.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show"
  }
}
```

**Usage Examples:**

```bash
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/CreateUsersTable

# Create blank migration file
npm run migration:create -- src/database/migrations/AddIndexToUsers

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Checklist

- [ ] Add typeorm base script with ts-node and tsconfig-paths registration
- [ ] Add migration:generate script for auto-generating migrations from entity changes
- [ ] Add migration:create script for creating blank migration files
- [ ] Add migration:run script for executing pending migrations
- [ ] Add migration:revert script for rolling back last migration
- [ ] Add migration:show script for displaying migration status
- [ ] Verify ts-node and tsconfig-paths installed as dev dependencies
- [ ] Test migration:generate creates migration file successfully

### Troubleshooting

**Problem**: typeorm command not found
- **Solution**: Verify typeorm package installed, check script references correct node_modules path

**Problem**: Cannot find module when running migrations
- **Solution**: Ensure tsconfig-paths/register is included in typeorm script, verify path aliases configured in tsconfig.json

**Problem**: Migration generate fails to detect changes
- **Solution**: Verify entities properly decorated with TypeORM decorators, check database connection is configured correctly

### Best Practices

- Always use migration:generate to create migrations from entity changes for accuracy
- Use descriptive migration names following pattern: VerbNounTable (e.g., CreateUsersTable, AddEmailIndexToUsers)
- Run migration:show before migration:run to verify pending migrations
- Test migrations in development before applying to production
- Keep migrations reversible implementing both up and down methods
- Version control all migration files for database schema history
- Document migration execution order and dependencies
- Run migrations as part of deployment pipeline before starting application

## [Step 8 - Configure AppModule with TypeORM and ConfigModule]()

Root module configuration integrating ConfigModule for environment variables globally, TypeORM connection with async factory pattern using database configuration, and preparing module imports array for future business modules enabling centralized application bootstrap.

### When to use?

Configure AppModule in every NestJS project as central orchestration point, when integrating database connection with environment-based configuration, when establishing global module availability, or when preparing application for modular architecture growth.

### When NOT to use?

Do not modify AppModule for feature-specific logic belonging in feature modules, avoid placing business logic directly in AppModule, skip complex orchestration better suited for dedicated modules.

### Example

Configure AppModule with ConfigModule and TypeORM integration using async factory pattern for dynamic configuration.

**Configure AppModule:**

Edit `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@/config/database.config';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Your modules here
    // UserModule,
    // AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

**Configuration Breakdown:**

1. **ConfigModule.forRoot**: Loads environment variables from .env file globally
2. **TypeOrmModule.forRootAsync**: Establishes database connection using async factory pattern
3. **useFactory**: Calls getDatabaseConfig with injected ConfigService
4. **inject**: Provides ConfigService to factory function for environment variable access

### Checklist

- [ ] Import ConfigModule and ConfigService from @nestjs/config
- [ ] Import TypeOrmModule from @nestjs/typeorm
- [ ] Import getDatabaseConfig from config/database.config
- [ ] Configure ConfigModule.forRoot with isGlobal true
- [ ] Set envFilePath to '.env' for local development
- [ ] Configure TypeOrmModule.forRootAsync with async factory pattern
- [ ] Use getDatabaseConfig as useFactory function
- [ ] Inject ConfigService into factory function
- [ ] Prepare imports array for future module additions
- [ ] Verify application starts without database connection errors

### Troubleshooting

**Problem**: ConfigModule not loading environment variables
- **Solution**: Verify .env file exists in backend root, check envFilePath is correct, ensure NODE_ENV not overriding

**Problem**: TypeORM connection fails on application start
- **Solution**: Check database credentials in .env are correct, verify PostgreSQL is running, test connection with psql

**Problem**: Circular dependency errors
- **Solution**: Review module imports ensuring no circular references, use forwardRef if necessary for specific cases

### Best Practices

- Always set ConfigModule isGlobal to true for environment variable access across all modules
- Use TypeOrmModule.forRootAsync with factory pattern for dynamic configuration
- Keep AppModule focused on orchestration, delegate business logic to feature modules
- Import feature modules in logical order (infrastructure first, then business modules)
- Document module dependencies and initialization order in comments
- Use ConfigService validation to fail fast if required environment variables missing
- Consider creating separate configuration modules for complex configurations

## [Next Steps - Complete Backend Setup with Additional Features]()

Recommended follow-up guides for completing backend setup including main.ts configuration with Swagger and validation pipes, user module creation with CRUD operations, authentication system implementation with JWT, and migration execution workflow.

### When to use?

Reference these next steps after completing basic backend setup when ready to implement features, when training new developers on complete setup workflow, when planning development roadmap for new project, or when troubleshooting by following guides in sequence.

### When NOT to use?

Do not skip to advanced guides without completing basic setup, avoid following all guides if only subset of features needed, skip guides not applicable to specific project requirements.

### Example

Follow recommended development workflow progression from basic setup through feature implementation.

**Development Workflow Progression:**

1. **Basic Setup** (Current Guide)
   - ✅ Prerequisites verification
   - ✅ NestJS project initialization
   - ✅ TypeScript configuration
   - ✅ Environment variables setup
   - ✅ Database configuration
   - ✅ Dependencies installation
   - ✅ AppModule configuration

2. **Main Application Configuration**
   - ➡️ [Configure main.ts](./how-to-create-api-backend.md)
   - Enable CORS
   - Configure Swagger documentation
   - Setup global validation pipe
   - Configure port and host

3. **User Module Implementation**
   - ➡️ [Create User Module](./how-to-create-api-backend.md)
   - User entity with TypeORM
   - User repository pattern
   - User service with CRUD operations
   - User controller with REST endpoints

4. **Authentication System**
   - ➡️ [Authentication System](./how-authentication-works.md)
   - JWT strategy implementation
   - Login and register endpoints
   - Password hashing with bcrypt
   - Auth guards for protected routes

5. **Database Migrations**
   - ➡️ [Migration Guide](./how-to-create-migration-backend.md)
   - Create initial migration
   - Run migrations
   - Verify schema changes

### Checklist

- [ ] Complete basic setup with this guide
- [ ] Proceed to main.ts configuration guide
- [ ] Implement user module with CRUD operations
- [ ] Set up authentication system with JWT
- [ ] Create and run initial database migrations
- [ ] Test all endpoints with Swagger documentation
- [ ] Verify application runs in development mode successfully

### Troubleshooting

**Problem**: Unclear which guide to follow next
- **Solution**: Follow recommended order above, start with main.ts configuration before feature modules

**Problem**: Guides reference features not yet implemented
- **Solution**: Complete guides in sequence, skip optional sections if feature not needed

**Problem**: Conflicting information between guides
- **Solution**: Newer guides take precedence, check last updated date, ask team for clarifications

### Best Practices

- Follow guides in recommended sequence for smooth development experience
- Complete each section fully before proceeding to next guide
- Test application after each major configuration change
- Document deviations from guides with justification in team wiki
- Share completed setup with team as reference implementation
- Create project template from completed setup for future projects
- Maintain guide index documenting when to use each guide

## [References - Official Documentation and Related Guides]()

Links to official documentation and related internal guides for NestJS framework, TypeORM database integration, and project-specific implementation patterns supporting comprehensive understanding of backend setup process.

### When to use?

Reference official documentation when needing detailed explanation beyond this guide, when troubleshooting errors not covered here, when learning advanced features, or when validating configuration against framework recommendations.

### When NOT to use?

Do not use as primary setup guide always follow this document first, do not assume external documentation reflects project-specific standards, avoid spending excessive time reading docs before attempting setup.

### Example

Reference essential official documentation and project-specific guides for comprehensive understanding.

**Essential References:**

- [NestJS Documentation](https://docs.nestjs.com) - Official framework documentation covering all NestJS features
- [TypeORM Documentation](https://typeorm.io) - Complete database ORM guide including entity configuration and migrations
- [How to create Backend API](./how-to-create-api-backend.md) - Project-specific guide for creating REST APIs
- [How authentication works](./how-authentication-works.md) - Project-specific authentication system implementation
- [How to create migrations](./how-to-create-migration-backend.md) - Database migration workflow guide

**Additional Resources:**

- [NestJS GitHub Repository](https://github.com/nestjs/nest) - Source code and issue tracking
- [TypeORM GitHub Repository](https://github.com/typeorm/typeorm) - ORM source and examples
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database reference

### Checklist

- [ ] Bookmark NestJS documentation for framework reference
- [ ] Review TypeORM documentation for entity and migration patterns
- [ ] Read project-specific guides for implementation standards
- [ ] Check GitHub repositories for latest updates and issues
- [ ] Join NestJS Discord or community forums for support

### Troubleshooting

**Problem**: Official documentation shows different configuration
- **Solution**: This guide takes precedence for project-specific setup, external docs provide additional context

**Problem**: Cannot find information about specific feature
- **Solution**: Search NestJS docs first, check GitHub issues, ask team for project-specific guidance

**Problem**: Documentation version mismatch
- **Solution**: Ensure reading docs matching installed NestJS and TypeORM versions from package.json

### Best Practices

- Keep reference links updated with latest documentation versions
- Contribute improvements to official docs when discovering issues
- Share helpful documentation sections with team during code review
- Build internal knowledge base capturing project-specific learnings
- Document deviations from official patterns with justification

---

**Last updated**: January 16, 2025
