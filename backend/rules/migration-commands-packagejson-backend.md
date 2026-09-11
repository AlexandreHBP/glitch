# [TypeORM Migration Commands in Backend package.json]()

Complete guide for configuring npm scripts to manage TypeORM migrations including generate, create, run, revert, and troubleshooting database schema changes in NestJS applications.

## [Required Scripts - TypeORM Migration Commands in package.json]()

This section presents essential npm scripts to manage TypeORM migrations including base typeorm script with ts-node and tsconfig-paths support, migration:generate for automatic generation from entity changes, migration:create for manual creation, migration:run for execution, migration:revert for rollback, migration:show for status listing, and db:drop for complete database reset with migration replay.

### When to use?

Use these migration scripts when working with TypeORM in NestJS projects that require database schema management and version control. These scripts are essential for any project that needs to track database changes through migrations instead of using auto-synchronization, enabling safe schema evolution across development, staging, and production environments.

### When NOT to use?

Don't use TypeORM migration scripts for projects using Prisma, Sequelize, or other ORMs that have their own migration systems. Also avoid for quick prototypes where schema:sync is acceptable, schema-less databases like MongoDB where migrations aren't typically needed, or simple applications without complex database schema requirements.

### Example

```bash
# Generate migration after creating/modifying entity
npm run migration:generate src/database/migrations/AddEmailToUsers

# Create empty migration for data seeding
npm run migration:create src/database/migrations/SeedInitialRoles

# Run pending migrations
npm run migration:run

# Revert last migration if error occurs
npm run migration:revert
```

### Checklist

- [ ] All migration scripts added to package.json
- [ ] ts-node and tsconfig-paths installed as devDependencies
- [ ] DataSource configuration file created at src/database/database.config.ts
- [ ] Environment variables configured for database connection
- [ ] Migration folder structure created at src/database/migrations

### Troubleshooting

**Issue**: "Cannot find module" error when running migration commands
**Solution**: Install required dependencies: `npm install -D ts-node tsconfig-paths typescript`

**Issue**: "No migrations found" error
**Solution**: Verify migrations path in database.config.ts matches actual migration folder location. Ensure glob pattern includes both .ts and .js extensions: `migrations: [__dirname + '/migrations/*{.ts,.js}']`

**Issue**: Scripts execute but TypeORM CLI not found
**Solution**: Ensure typeorm is installed in dependencies and the script path points correctly to `./node_modules/typeorm/cli`

### Best Practices

- Always review generated migrations before running them to ensure they match expected schema changes
- Use migration:generate for entity changes and migration:create for data seeds or complex operations
- Never modify executed migrations; create new ones for additional changes to maintain migration history integrity
- Keep migration names descriptive and follow consistent naming conventions (e.g., AddEmailToUsers, not Migration1234)

### Configuration

Add to `package.json`:

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show",
    "db:drop": "npm run typeorm -- schema:drop && npm run migration:run"
  }
}
```

## [Migration Commands Reference - Detailed Command Documentation]()

Complete documentation for each migration command including migration:generate for automatic schema synchronization based on entity changes, migration:create for manual data seeds and complex alterations, migration:run for executing pending migrations, migration:revert for rollback operations, migration:show for status listing, and db:drop for complete database reset. Each command includes practical usage examples and behavior description.

### When to use?

Reference this section when you need detailed information about specific migration commands, their parameters, expected behavior, and use cases. Use when planning database schema changes, troubleshooting migration issues, or training team members on proper migration workflows with TypeORM.

### When NOT to use?

Don't refer to this section for high-level migration strategy decisions, non-TypeORM migration systems, or when you need quick reference for package.json configuration. Also skip for debugging database connection issues unrelated to migration execution.

### typeorm (Base Command)

```bash
npm run typeorm -- <command>
```

Base script that executes TypeORM CLI with support for TypeScript via ts-node and path aliases (@/*) via tsconfig-paths. All other migration commands build upon this base command.

### migration:generate (Auto-generate from Entities)

```bash
npm run migration:generate src/database/migrations/MigrationName
```

**What it does**: Generates automatic migration by comparing current entities with database schema and creating up/down methods for synchronization.

**When to use**:
- After modifying entity classes
- Adding or removing columns
- Modifying relationships and constraints
- Changing column types or properties

**Example**:
```bash
npm run migration:generate src/database/migrations/AddActiveToProducts
```

### migration:create (Manual Empty Migration)

```bash
npm run migration:create src/database/migrations/MigrationName
```

**What it does**: Creates empty migration file with skeleton up() and down() methods for manual implementation of complex database operations.

**When to use**:
- Data seeding operations
- Complex multi-table alterations
- Custom indexes and constraints
- Specific SQL queries not tied to entity changes

**Example**:
```bash
npm run migration:create src/database/migrations/SeedSectors
```

### migration:run (Execute Pending Migrations)

```bash
npm run migration:run
```

**What it does**: Executes all pending migrations in chronological order based on timestamp, updating the migrations table to track execution status.

**When to use**:
- After creating or generating new migrations
- Setting up new development or production environments
- During deployment processes to sync database schema

### migration:revert (Rollback Last Migration)

```bash
npm run migration:revert
```

**What it does**: Reverts the last executed migration by running its down() method, removing the entry from migrations tracking table.

**When to use**:
- Fix migrations with errors or unintended consequences
- Rollback changes during development
- Recover from failed deployments

**Note**: Only reverts one migration at a time; run multiple times to revert multiple migrations

### migration:show (List Migration Status)

```bash
npm run migration:show
```

**What it does**: Lists all migrations showing which have been executed ([X]) and which are pending ([ ]).

**Output example**:
```
[X] Migration1728000000000-genesis
[X] Migration1735466400000-add-quote-optimized-index
[ ] Migration1738500000000-create-alerts-table
```

### db:drop (Complete Database Reset)

```bash
npm run db:drop
```

**What it does**: Drops entire database schema and recreates it by running all migrations from scratch, effectively resetting to a clean state.

**When to use**:
- Complete database reset during local development
- Testing migration sequences from beginning
- Resolving corrupted database states

**WARNING**: Deletes all data permanently! Never use in production environments.

## [Migration Workflow - Step-by-Step Process for Schema Changes]()

Complete step-by-step workflow for creating and applying migrations covering entity creation or modification, migration generation, migration file review for correctness, execution with verification, and error handling with rollback procedures. This systematic workflow ensures safe database schema changes by reviewing generated migrations before execution and maintaining version control of database schema evolution.

### When to use?

Follow this workflow whenever you need to modify database schema by creating new entities, updating existing entities, or making structural changes to tables. This systematic approach ensures safe schema evolution with proper version control, allowing you to track all database changes, collaborate with team members, and rollback if issues occur during development or deployment.

### When NOT to use?

Don't use this workflow for one-off data updates that don't change schema structure, quick prototypes where manual SQL is faster, emergency hotfixes where direct SQL execution is necessary, or when working with NoSQL databases. Also skip for simple data seeding operations that don't require schema modifications.

### Example

```bash
# Complete workflow example: Adding age column to users
# 1. Modify entity
# Add: @Column() age: number; to User entity

# 2. Generate migration
npm run migration:generate src/database/migrations/AddAgeToUsers

# 3. Review generated file to ensure it's correct

# 4. Apply migration
npm run migration:run

# 5. Verify in database
npm run typeorm -- query "SELECT column_name FROM information_schema.columns WHERE table_name='users'"
```

### Checklist

- [ ] Entity changes completed and tested
- [ ] Migration generated with descriptive name
- [ ] Generated migration file reviewed for correctness
- [ ] Down method properly implements rollback
- [ ] Migration executed successfully
- [ ] Database schema verified after execution
- [ ] Migration committed to version control

### Troubleshooting

**Issue**: Generated migration is empty or incomplete
**Solution**: Ensure entities are properly decorated with TypeORM decorators and DataSource configuration includes correct entity paths. Check if synchronize is set to false in configuration.

**Issue**: Migration fails during execution
**Solution**: Review migration SQL for syntax errors, check database permissions, verify foreign key constraints are satisfied, and ensure referenced tables exist before executing.

**Issue**: Migration generates unexpected changes
**Solution**: Verify entity decorators match intended schema. Check for unintended entity modifications. Review TypeORM documentation for decorator behavior with your database type.

### Best Practices

- Always create descriptive migration names that clearly indicate what changed (AddEmailToUsers, not Migration1234)
- Review generated migrations before executing them to catch issues early and understand schema changes
- Test migrations in development environment before applying to staging or production
- Keep migrations small and focused on single logical changes for easier troubleshooting and rollback
- Commit migrations to version control alongside entity changes in the same pull request

### Step 1: Create or Modify Entity

```typescript
// src/modules/product/entities/product.entity.ts
@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
```

### Step 2: Generate Migration

```bash
npm run migration:generate src/database/migrations/CreateProductsTable
```

### Step 3: Review Generated Migration

```typescript
// src/database/migrations/1234567890000-CreateProductsTable.ts
export class CreateProductsTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'varchar' },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
```

### Step 4: Execute Migration

```bash
npm run migration:run
```

### Step 5: Handle Errors (If Needed)

```bash
# Revert migration
npm run migration:revert

# Fix migration file
# Then execute again
npm run migration:run
```

## [DataSource Configuration - TypeORM CLI Database Connection]()

Essential database.config.ts configuration file that TypeORM CLI requires to connect to database and locate entities and migrations. This DataSource configuration uses ConfigService for environment variables, defines paths to entities and migrations using glob patterns, disables synchronize for production safety, and enables logging for development visibility. Without this configuration file properly set up, all migration commands will fail to execute.

### When to use?

Create this DataSource configuration file when setting up a new NestJS project with TypeORM, when migration commands fail with connection errors, or when you need to customize entity or migration paths. This configuration is required for TypeORM CLI to function independently of the NestJS application runtime, enabling migrations to run during deployment pipelines.

### When NOT to use?

Don't create a separate DataSource configuration if using Prisma or other ORMs. Skip if your project uses TypeORM's deprecated ormconfig.json approach (migrate to DataSource instead). Also unnecessary for projects not using TypeORM CLI commands or migrations.

### Example

```typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  synchronize: false,
  logging: true,
});
```

### Checklist

- [ ] database.config.ts created in src/database/ directory
- [ ] ConfigService imported for environment variable access
- [ ] Database connection parameters configured
- [ ] Entity glob pattern matches your entity file locations
- [ ] Migration glob pattern matches your migration folder
- [ ] synchronize set to false for production safety
- [ ] logging enabled for debugging visibility

### Troubleshooting

**Issue**: "Cannot find DataSource" error
**Solution**: Ensure database.config.ts exports default DataSource instance and is located in src/database/ directory

**Issue**: Environment variables not loading
**Solution**: Create .env file in project root or use dotenv to load environment variables before DataSource initialization

**Issue**: Entities or migrations not found
**Solution**: Verify glob patterns match actual file locations. Use absolute paths with __dirname. Include both .ts and .js extensions.

### Best Practices

- Always use environment variables for database credentials, never hardcode sensitive data
- Set synchronize to false in production to prevent automatic schema synchronization
- Use glob patterns that work in both development (TypeScript) and production (compiled JavaScript)
- Enable logging during development, consider disabling in production for performance
- Keep DataSource configuration in dedicated file separate from NestJS module configuration

## [Required Dependencies - NPM Packages for TypeORM Migrations]()

Required npm packages for TypeORM CLI to execute migrations including ts-node for TypeScript execution without compilation, tsconfig-paths for path alias resolution (@/ imports), typescript compiler, typeorm library for ORM functionality, and pg PostgreSQL driver. These devDependencies and dependencies must be installed for migration commands to work correctly in development and production environments supporting TypeScript entity files.

### When to use?

Install these dependencies when initializing a new NestJS project with TypeORM, when migration commands fail with module not found errors, or when setting up a development environment for an existing TypeORM project. These packages are essential for TypeORM CLI functionality and TypeScript support in migration workflows.

### When NOT to use?

Don't install these specific dependencies if using a different database ORM like Prisma or Sequelize. Skip ts-node and tsconfig-paths if your project is pure JavaScript without TypeScript. Also unnecessary if using a different database than PostgreSQL (replace pg with appropriate driver).

### Example

```json
{
  "devDependencies": {
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  },
  "dependencies": {
    "typeorm": "^0.3.20",
    "pg": "^8.11.3"
  }
}
```

### Checklist

- [ ] ts-node installed as devDependency for TypeScript execution
- [ ] tsconfig-paths installed for path alias support
- [ ] typescript compiler installed with compatible version
- [ ] typeorm library installed in dependencies
- [ ] pg (PostgreSQL driver) installed in dependencies
- [ ] @nestjs/typeorm installed for NestJS integration
- [ ] reflect-metadata installed for decorator support

### Troubleshooting

**Issue**: Version conflicts between packages
**Solution**: Use compatible versions. For TypeORM 0.3.x, use ts-node ^10.x, typescript ^5.x, and pg ^8.x. Check TypeORM documentation for compatibility matrix.

**Issue**: ts-node fails with path resolution errors
**Solution**: Ensure tsconfig-paths is installed and registered in typeorm script with -r flag: `ts-node -r tsconfig-paths/register`

**Issue**: PostgreSQL driver not working
**Solution**: Verify pg package is installed. For other databases, install appropriate driver: mysql2 for MySQL, sqlite3 for SQLite, etc.

### Best Practices

- Pin dependency versions to avoid breaking changes from automatic updates
- Keep typeorm version consistent across team members using package-lock.json
- Install ts-node and development tools as devDependencies to reduce production bundle size
- Regularly update dependencies to receive security patches and bug fixes
- Use npm ci in CI/CD pipelines for reproducible builds

## [Additional Development Scripts - Optional Helper Commands]()

Extra npm scripts for advanced database operations including seed script for populating initial data with realistic test datasets, db:check for testing database connectivity, and db:backup/db:restore for production database backup and restore using native PostgreSQL utilities pg_dump and psql. These commands facilitate development workflow efficiency, enable testing with realistic data scenarios, and provide disaster recovery procedures.

### When to use?

Add these optional scripts when you need database seeding for development or testing, want to verify database connectivity in deployment scripts, or require backup and restore capabilities for production disaster recovery. These utilities enhance developer experience and operational readiness beyond basic migration management.

### When NOT to use?

Don't add these scripts if your project doesn't require data seeding, uses managed database services with built-in backup solutions, or has dedicated DevOps tooling for database operations. Skip db:backup/restore scripts if using cloud database services like RDS that provide automated backup management.

### Example

```json
{
  "scripts": {
    "seed": "ts-node -r tsconfig-paths/register src/database/seeds/run.ts",
    "db:check": "npm run typeorm -- query 'SELECT NOW()'",
    "db:backup": "pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER $POSTGRES_DB > backup.sql",
    "db:restore": "psql -h $POSTGRES_HOST -U $POSTGRES_USER $POSTGRES_DB < backup.sql"
  }
}
```

### Checklist

- [ ] Seed script configured with proper TypeScript support
- [ ] Seed data files created in src/database/seeds/
- [ ] Database connectivity check script added
- [ ] Backup script tested with proper permissions
- [ ] Restore script documented for team usage
- [ ] Environment variables available for backup/restore commands

### Troubleshooting

**Issue**: Seed script fails to find seed files
**Solution**: Verify seed file paths match the script configuration. Ensure ts-node and tsconfig-paths are properly registered.

**Issue**: pg_dump or psql commands not found
**Solution**: Install PostgreSQL client tools on your system. On Ubuntu/Debian: `apt install postgresql-client`. On macOS: `brew install postgresql`.

**Issue**: Backup fails with permission errors
**Solution**: Ensure database user has appropriate permissions. For full backups, user needs SELECT on all tables or database ownership.

### Best Practices

- Create idempotent seed scripts that can run multiple times without duplicating data
- Use db:check in deployment scripts to verify database connectivity before migrations
- Schedule regular backups in production using cron jobs or cloud backup services
- Store backups in secure, off-site locations with encryption
- Test restore procedures regularly to ensure backup integrity

### Data Seed Script

```json
{
  "scripts": {
    "seed": "ts-node -r tsconfig-paths/register src/database/seeds/run.ts"
  }
}
```

Create seed runner at `src/database/seeds/run.ts`:
```typescript
import dataSource from '../database.config';
import { UserSeeder } from './user.seeder';

async function run() {
  await dataSource.initialize();
  await new UserSeeder().run(dataSource);
  await dataSource.destroy();
}

run();
```

### Database Connection Check

```json
{
  "scripts": {
    "db:check": "npm run typeorm -- query 'SELECT NOW()'"
  }
}
```

Use in CI/CD pipelines before running migrations to ensure database is accessible.

### Backup and Restore (Production)

```json
{
  "scripts": {
    "db:backup": "pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER $POSTGRES_DB > backup.sql",
    "db:restore": "psql -h $POSTGRES_HOST -U $POSTGRES_USER $POSTGRES_DB < backup.sql"
  }
}
```

**WARNING**: Test restore procedures in non-production environments first!

## [CI/CD Integration - Automated Migration Execution in Deployments]()

Integration examples for running migrations automatically in deployment pipelines including GitHub Actions workflow with environment variables from repository secrets, and Docker container startup script that executes pending migrations before starting the NestJS application. These patterns ensure database schema is always synchronized with application code in staging and production environments, enabling continuous deployment with zero-downtime database updates and preventing deployment failures.

### When to use?

Implement CI/CD migration integration when deploying NestJS applications to staging or production environments, when you need automated schema synchronization with application deployments, or when building continuous deployment pipelines. This automation ensures migrations run consistently before application startup, reducing manual deployment steps and preventing schema version mismatches.

### When NOT to use?

Don't automate migrations in CI/CD for applications requiring manual database change approval processes, highly regulated environments where schema changes need human oversight, or systems with complex migration dependencies requiring manual intervention. Also skip for development environments where developers manually control migration execution.

### Example

```yaml
# GitHub Actions workflow
- name: Run Migrations
  run: npm run migration:run
  env:
    POSTGRES_HOST: ${{ secrets.POSTGRES_HOST }}
    POSTGRES_USER: ${{ secrets.POSTGRES_USER }}
    POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
    POSTGRES_DB: ${{ secrets.POSTGRES_DB }}
```

### Checklist

- [ ] Database credentials stored in CI/CD secrets
- [ ] Migration execution added to deployment workflow
- [ ] Migration failures configured to stop deployment
- [ ] Database backup created before migration execution
- [ ] Rollback procedure documented for failed migrations
- [ ] Environment-specific database connections configured
- [ ] Migration logs captured for audit trail

### Troubleshooting

**Issue**: Migrations fail in CI/CD but work locally
**Solution**: Verify environment variables are correctly set in CI/CD secrets. Check database connectivity from CI/CD environment. Ensure network access to database.

**Issue**: Deployment succeeds but migrations didn't run
**Solution**: Check CI/CD logs for migration step execution. Verify script exits with error code on migration failure. Ensure workflow doesn't continue on migration errors.

**Issue**: Database connection timeout in CI/CD
**Solution**: Check database firewall rules allow CI/CD runner IPs. Increase connection timeout in DataSource configuration. Verify database is accessible from deployment environment.

### Best Practices

- Always create database backup before running automated migrations in production
- Configure migration failures to halt deployment process preventing partial deployments
- Use database migration locks to prevent concurrent migration execution in distributed deployments
- Log migration execution results for audit trail and debugging
- Test migration CI/CD integration in staging environment before production deployment
- Consider blue-green deployments for complex migrations requiring downtime

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm ci

      - name: Run Migrations
        run: npm run migration:run
        env:
          POSTGRES_HOST: ${{ secrets.POSTGRES_HOST }}
          POSTGRES_PORT: ${{ secrets.POSTGRES_PORT }}
          POSTGRES_USER: ${{ secrets.POSTGRES_USER }}
          POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
          POSTGRES_DB: ${{ secrets.POSTGRES_DB }}

      - name: Build Application
        run: npm run build

      - name: Deploy to Production
        run: npm run deploy
```

### Docker Container Integration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN npm run build

# Run migrations then start application
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
```

### Docker Compose with Separate Migration Service

```yaml
# docker-compose.yml
version: '3.8'

services:
  migrate:
    build: .
    command: npm run migration:run
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    depends_on:
      - postgres

  app:
    build: .
    command: npm run start:prod
    depends_on:
      - migrate
      - postgres
    ports:
      - "3000:3000"

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_PASSWORD=secret
```

## [Common Migration Errors - Troubleshooting Guide]()

Solutions for frequent problems when running TypeORM migrations including module resolution errors requiring ts-node and tsconfig-paths installation, missing migrations due to incorrect path configuration in database.config.ts, connection failures caused by invalid or missing environment variables, and permission issues preventing migration execution. Each error includes diagnostic steps, root cause explanation, and specific solutions for quick resolution.

### When to use?

Refer to this troubleshooting section when migration commands fail with errors, when setting up migrations in new environments, or when debugging migration execution issues reported by team members. Use these solutions to quickly diagnose and resolve common TypeORM CLI problems without extensive debugging sessions.

### When NOT to use?

Don't use this section for application runtime errors unrelated to migrations, schema design decisions, or performance optimization issues. Also skip for errors specific to database-level problems like disk space, permission issues, or networking problems not related to TypeORM configuration.

### Example

```bash
# Common error sequence and resolution
$ npm run migration:run
Error: Cannot find module 'ts-node'

# Solution
$ npm install -D ts-node tsconfig-paths
$ npm run migration:run
# Migration executes successfully
```

### Checklist

- [ ] All required dependencies installed (ts-node, tsconfig-paths, typescript)
- [ ] DataSource configuration file exists and exports correctly
- [ ] Database environment variables set correctly
- [ ] Migration file paths configured in DataSource
- [ ] Database connection established and accessible
- [ ] User has necessary database permissions

### Troubleshooting

**Issue**: Cannot find module 'ts-node' or 'tsconfig-paths'
**Solution**: Install missing development dependencies: `npm install -D ts-node tsconfig-paths typescript`

**Issue**: No migrations found in database
**Solution**: Check migrations array in database.config.ts matches actual migration folder path. Verify glob pattern includes `{.ts,.js}` extensions.

**Issue**: Migrations execute but schema not updated
**Solution**: Check database connection is pointing to correct database. Verify migrations table exists and tracks executed migrations. Review migration SQL in up() method.

### Best Practices

- Keep detailed error logs during migration execution for debugging
- Test migration commands in development before running in production
- Verify database connectivity before attempting migration execution
- Use version control to track migration file changes and correlate with errors
- Document custom solutions for project-specific migration issues

### Error: "Cannot find module 'ts-node'"

**Cause**: Missing TypeScript execution dependencies

**Solution**: Install required development dependencies
```bash
npm install -D ts-node tsconfig-paths typescript
```

**Verification**:
```bash
npm run typeorm -- --version
```

### Error: "No migrations found"

**Cause**: Incorrect migration path configuration in DataSource

**Solution**: Check and fix path in `database.config.ts`:
```typescript
export default new DataSource({
  // ... other config
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Ensure path is correct relative to database.config.ts location
});
```

**Verification**:
```bash
npm run migration:show
# Should list migrations if path is correct
```

### Error: "Connection timeout" or Migrations don't execute

**Cause**: Invalid or missing database environment variables

**Solution**: Verify environment variables are set correctly:
```bash
echo $POSTGRES_HOST
echo $POSTGRES_USER
echo $POSTGRES_PASSWORD
echo $POSTGRES_DB
```

Create `.env` file if missing:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=yourdb
```

### Error: "QueryFailedError: permission denied"

**Cause**: Database user lacks necessary permissions

**Solution**: Grant required permissions to database user:
```sql
GRANT ALL PRIVILEGES ON DATABASE yourdb TO youruser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO youruser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO youruser;
```

### Error: "Migration has already been executed"

**Cause**: Attempting to run already executed migration

**Solution**: Check migration status and skip or create new migration:
```bash
npm run migration:show
# [X] indicates already executed
# Create new migration instead of re-running
```

## [Complete Configuration Example - Full package.json Reference]()

Complete working package.json example including all migration commands properly configured alongside standard NestJS scripts for build, start, test, and lint. This reference configuration demonstrates correct script organization, typeorm base command with ts-node and tsconfig-paths registration, and all migration operations ready to use in development workflow for generating, creating, running, reverting, inspecting database migrations, and managing schema.

### When to use?

Use this complete example as a reference when setting up a new NestJS project with TypeORM, when auditing existing package.json for missing migration scripts, or when onboarding new team members who need to understand the full script configuration. This serves as a template for standardizing migration commands across multiple projects.

### When NOT to use?

Don't use this example if your project uses a different ORM, has custom build processes incompatible with standard NestJS commands, or requires significantly different script organization. Also skip if using monorepo structures where scripts are organized differently across packages.

### Example

```json
{
  "name": "backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",

    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show",
    "db:drop": "npm run typeorm -- schema:drop && npm run migration:run",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  }
}
```

### Checklist

- [ ] All standard NestJS build and start scripts present
- [ ] Base typeorm script configured with ts-node and tsconfig-paths
- [ ] All essential migration scripts included (generate, create, run, revert, show)
- [ ] db:drop script added for development database reset
- [ ] Test scripts configured for unit and coverage testing
- [ ] Lint script configured for code quality checks
- [ ] Script naming follows consistent conventions

### Troubleshooting

**Issue**: Scripts fail with "command not found" errors
**Solution**: Ensure all required packages are installed via `npm install`. Check that node_modules directory exists and contains necessary binaries.

**Issue**: Script shortcuts don't work across team
**Solution**: Ensure all team members run `npm install` after pulling package.json changes. Use `npm ci` for consistent dependency installation.

### Best Practices

- Organize scripts logically with related commands grouped together (build, migration, test)
- Use consistent naming conventions across scripts (migration:* for all migration commands)
- Document complex or custom scripts with comments in package.json
- Keep script commands simple and readable, extracting complexity to separate files when needed
- Version control package.json and package-lock.json together for reproducible builds

## [Official Documentation - TypeORM and NestJS References]()

Links to official TypeORM CLI documentation for migrations and NestJS TypeORM integration guide. These resources provide comprehensive information about advanced migration features, configuration options, command parameters, best practices for managing database schema evolution in TypeScript applications, and integration patterns for using TypeORM with NestJS framework dependency injection and module system.

### When to use?

Refer to official documentation when implementing advanced migration features not covered in this guide, troubleshooting complex TypeORM issues, understanding migration internals, or staying updated with latest TypeORM and NestJS best practices. Use these resources for authoritative information on configuration options and supported features.

### When NOT to use?

Don't refer to official documentation for quick command reference or basic migration workflows covered in this guide. Also skip for project-specific issues or custom implementations not related to core TypeORM functionality.

### References

- [TypeORM Migrations CLI](https://typeorm.io/migrations#creating-a-new-migration) - Official TypeORM migration documentation
- [NestJS TypeORM Integration](https://docs.nestjs.com/recipes/sql-typeorm) - NestJS guide for TypeORM setup and configuration
- [TypeORM DataSource API](https://typeorm.io/data-source) - DataSource configuration reference
- [TypeORM Migration API](https://typeorm.io/migrations) - Complete migration API documentation
