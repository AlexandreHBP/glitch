# [How the Main Backend File Works]()

Comprehensive guide about the main.ts file, NestJS application entry point, covering configuration, middlewares, guards, Swagger, and production setup for building robust backend applications.

## [NestJS Main.ts Entry Point - Application Initialization File]()

The main.ts file is the NestJS application entry point that initializes the server, configures global middlewares, validation pipes, guards, Swagger documentation, CORS, and static file serving. This file centralizes all critical application configurations before starting the HTTP server, establishing the foundation for your entire backend architecture.

### When to use?

Use main.ts when you need to configure global application behavior such as adding middlewares, enabling CORS, setting up authentication guards, configuring API versioning, integrating Swagger documentation, or serving static frontend files. Every NestJS project requires this file as the bootstrap entry point where the application lifecycle begins and core configurations are established.

### When NOT to use?

Do not use main.ts for module-specific configurations, business logic, database configurations, or feature-specific setup. These should be handled in their respective modules, services, or configuration files. Main.ts should only contain application-level configurations that affect the entire application globally, not individual features or modules.

### Example

Minimum example of a functional main.ts file to start a NestJS application.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
}
bootstrap();
```

### Checklist

- [ ] NestFactory.create with `NestExpressApplication`
- [ ] Global prefix `/api`
- [ ] Versioning enabled (`VersioningType.URI`) with `defaultVersion: '1'`
- [ ] CORS enabled
- [ ] Serve static files (`useStaticAssets`)
- [ ] SPA fallback for React Router
- [ ] Global ValidationPipe
- [ ] Global guards (JWT)
- [ ] Swagger configured with Bearer and API Key
- [ ] Port via environment variable
- [ ] Console.log with useful URLs

### Troubleshooting

**Port already in use**: Change PORT in .env or kill the process using `lsof -ti:3000 | xargs kill -9`

**CORS errors**: Verify FRONTEND_URL in .env matches your frontend URL exactly, including protocol

**Swagger not loading**: Check that SwaggerModule.setup path doesn't conflict with API routes

**Static files not served**: Verify publicPath calculation matches your folder structure and frontend build output

**Validation not working**: Ensure ValidationPipe is configured with `transform: true` and DTOs use class-validator decorators

### Best Practices

1. Always use `NestExpressApplication` typing to access Express methods
2. Configure CORS correctly - avoid `origin: '*'` in production
3. Use environment variables - never hardcode passwords or secrets
4. Document Swagger well - makes API usage easier for consumers
5. Test SPA fallback - ensure React Router works with all routes
6. Use helmet in production - increases security headers
7. Configure rate limiting - prevents API abuse and DDoS attacks

## [Complete Production-Ready Configuration - Full Stack Application Setup]()

Complete production-ready configuration including CORS, global validation, guards, Swagger and serving frontend static files. This example demonstrates all recommended configurations for a professional NestJS application ready for deployment with JWT authentication, API versioning, comprehensive documentation, and seamless frontend integration for full-stack projects.

### When to use?

Use this complete configuration when setting up a production-ready NestJS application that requires JWT authentication, API versioning, Swagger documentation, serves a React frontend, and needs robust validation and security features. Ideal for full-stack projects where backend serves both API endpoints and frontend static files from a single deployment unit.

### When NOT to use?

Do not use this complete setup for simple microservices, API-only projects that don't serve frontend, prototypes where minimal configuration is sufficient, or when you need custom authentication strategies beyond JWT. Start simple and add configurations as needed based on your specific requirements and architecture decisions rather than copying everything blindly.

### Example

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  // 1. Create application (with NestExpressApplication typing)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Global Prefix (all routes start with /api)
  app.setGlobalPrefix('api');

  // 3. API Versioning (IMPORTANT: always use from the start)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 4. CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 5. Serve static frontend files
  // Production: /app/dist/src -> /app/public (2 levels up)
  // Development: /app/backend/dist/src -> /app/backend/public (2 levels up)
  const publicPath = join(__dirname, '..', '..', 'public');
  app.useStaticAssets(publicPath, {
    index: 'index.html',
    prefix: '/',
  });

  // 6. Fallback for SPA (React Router)
  app.use((req: any, res: any, next: any) => {
    // If NOT an API route, serve index.html
    if (!req.path.startsWith('/api')) {
      return res.sendFile(join(publicPath, 'index.html'));
    }
    next();
  });

  // 7. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                    // Remove undefined props
      forbidNonWhitelisted: true,         // Error if extra props
      transform: true,                    // Transform types
      transformOptions: {
        enableImplicitConversion: false,  // Avoid incorrect conversion
      },
    }),
  );

  // 8. Global Guards (JWT Auth)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // 9. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Complete API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'API Key for external integrations',
      },
      'X-API-KEY',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // 10. Start server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application running at: http://localhost:${port}`);
  console.log(`📚 Swagger docs at: http://localhost:${port}/api/docs`);
}

bootstrap();
```

> **IMPORTANT**: See [How to version API](./how-to-version-api-backend.md) to understand how versioning works.

### Checklist

- [ ] All imports are present
- [ ] AppModule and JwtAuthGuard exist
- [ ] Environment variables configured in .env
- [ ] Public folder exists at correct path
- [ ] Frontend build output is in public folder
- [ ] Swagger accessible at /api/docs
- [ ] All routes start with /api/v1

### Troubleshooting

**Cannot find module AppModule**: Verify app.module.ts exists and exports AppModule correctly

**JwtAuthGuard error**: Ensure auth module is configured and JwtAuthGuard is properly implemented

**Static files 404**: Check publicPath calculation - use console.log(publicPath) to debug the resolved path

**Swagger shows empty**: Controllers must use decorators like @ApiTags() and @ApiOperation()

### Best Practices

1. Keep main.ts focused on configuration only - no business logic
2. Use environment variables for all configurable values
3. Enable versioning from day one - prevents breaking changes later
4. Configure both JWT and API Key auth in Swagger for flexibility
5. Use proper TypeScript typing (NestExpressApplication)
6. Add console logs to confirm URLs after server starts
7. Test all configurations in both development and production environments

## [NestFactory.create Configuration - Application Instance Creation]()

Creates the NestJS application instance with optional configurations for logging, CORS, and other startup behaviors. The NestExpressApplication typing provides access to Express-specific methods like useStaticAssets and enables full control over the underlying Express server for advanced HTTP configurations and middleware management.

### When to use?

Use NestFactory.create at the start of bootstrap function to initialize your application. Use NestExpressApplication typing when you need Express methods like serving static files or custom middleware. Use options parameter to configure logging levels or enable simple CORS during development when detailed configuration is not required.

### When NOT to use?

Do not create multiple application instances in the same process as this causes port conflicts and resource issues. Do not use NestExpressApplication if using a different platform adapter like Fastify. Do not configure complex CORS here - use app.enableCors() instead for production-grade CORS configuration with detailed options and security controls.

### Example

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

**IMPORTANT**: Use `NestExpressApplication` typing to have access to Express methods like `useStaticAssets`.

**Options**:
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log'], // Log levels
  cors: true,                        // Simple CORS
});
```

### Checklist

- [ ] Use NestExpressApplication typing
- [ ] Import from @nestjs/platform-express
- [ ] Pass AppModule as first parameter
- [ ] Configure logger levels if needed
- [ ] Avoid complex configurations in options

### Troubleshooting

**Type errors with useStaticAssets**: Ensure you use NestExpressApplication typing

**Logger not working**: Check that logger levels include the level you're trying to log

**CORS still not working**: Options CORS is basic - use app.enableCors() for production

### Best Practices

1. Always use explicit typing (NestExpressApplication)
2. Configure minimal options here - use dedicated methods for complex configs
3. Use custom logger implementation for production environments
4. Keep bootstrap function clean and readable

## [Global Prefix Configuration - API Route Namespace]()

Adds a URL prefix to all routes in the application. Using /api prefix keeps API routes organized and separated from static files or frontend routes, making it easier to configure reverse proxies and routing rules while providing clear distinction between API endpoints and static content for better architecture organization.

### When to use?

Use global prefix when you want all API endpoints to start with a common path like /api. This is essential when serving both API and static frontend files from the same server, or when deploying behind a reverse proxy that routes based on path prefixes, or when you need clear separation between different application concerns for better maintainability.

### When NOT to use?

Do not use global prefix if you need different prefixes for different modules (use module-level prefixes instead), or if your API is standalone and doesn't need path separation from other content. Avoid if you have legacy clients expecting root-level endpoints and cannot update them, or if migration complexity outweighs the organizational benefits.

### Example

```typescript
app.setGlobalPrefix('api');
```

**Result** (with versioning):
- `/products` → `/api/v1/products`
- `/users` → `/api/v1/users`

**Exclude routes**:
```typescript
app.setGlobalPrefix('api', {
  exclude: ['health'], // /health won't have prefix
});
```

### Checklist

- [ ] Set prefix before defining routes
- [ ] Use 'api' as standard prefix
- [ ] Exclude health check endpoints if needed
- [ ] Update frontend API calls to include prefix
- [ ] Update Swagger baseUrl if needed

### Troubleshooting

**404 on all endpoints**: Ensure frontend is calling /api/v1/resource not /resource

**Health check failing**: Add health endpoint to exclude array

**Swagger not accessible**: Swagger path should include prefix: /api/docs

### Best Practices

1. Always use /api prefix for clarity and organization
2. Exclude health/metrics endpoints for monitoring tools
3. Configure prefix before enabling versioning
4. Document the prefix clearly for API consumers

## [API Versioning Configuration - Breaking Change Management]()

Enables URL-based API versioning allowing multiple API versions to coexist. This is critical for evolving APIs without breaking existing clients, supporting gradual migration, and maintaining backward compatibility while introducing new features or breaking changes, ensuring smooth transitions for all consumers without service disruption.

### When to use?

Use API versioning from the start of every project, before the first release. It's essential when you need to make breaking changes while supporting existing clients, when building public APIs consumed by external parties, or when you have multiple client applications with different update schedules that cannot all migrate simultaneously to new API versions.

### When NOT to use?

Do not use versioning for internal microservices that communicate via events where contracts are managed differently, or for simple prototypes that won't have external consumers and will never be released. However, for production applications, always prefer to include versioning even if you only have v1 initially to avoid painful migrations later.

### Example

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

**Result**:
- Controllers with `@Controller({ path: 'users', version: '1' })` → `/api/v1/users`
- Controllers with `@Controller({ path: 'users', version: '2' })` → `/api/v2/users`

**Why always use from the start?**
- Avoids breaking integrations when you need to make breaking changes
- Allows API evolution without impacting existing clients
- It's professional and demonstrates maturity

See more at: [How to version API](./how-to-version-api-backend.md)

### Checklist

- [ ] Enable versioning before first deployment
- [ ] Set defaultVersion to '1'
- [ ] Use URI versioning type
- [ ] Update all controllers with version property
- [ ] Document version changes in changelog
- [ ] Test all versioned endpoints

### Troubleshooting

**Endpoints return 404**: Ensure controllers have version property set

**Version appears twice in URL**: Check that you're not manually adding /v1 in controller path

**Frontend can't find endpoints**: Update baseURL to include version (handled in api.ts)

### Best Practices

1. Enable versioning from day one - it's harder to add later
2. Use URI versioning (not header-based) for simplicity
3. Document breaking changes when creating new versions
4. Support previous versions for reasonable deprecation period
5. Use semantic versioning principles for version numbers

## [CORS Configuration - Enable Cross-Origin Requests]()

Enables cross-origin resource sharing allowing frontend applications from different origins to access the API. Essential for modern web applications where frontend and backend are served from different domains or ports during development and production, enabling secure communication between separate services while maintaining browser security policies.

### When to use?

Use CORS when your frontend runs on a different domain or port than your backend (e.g., frontend on localhost:5173, backend on localhost:3000). Required for almost all modern web applications, mobile app backends that serve web interfaces, and third-party API integrations where external services need to access your API from browser environments.

### When NOT to use?

Do not use CORS if your API serves only server-to-server communications where browsers are not involved, if frontend is served from the same origin using static file serving from the same server, or for internal microservices behind API gateway. However, most web applications will need CORS for development and often for production deployments.

### Example

**Simple**:
```typescript
app.enableCors();
```

**Configured**:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Checklist

- [ ] CORS enabled before routes are registered
- [ ] Frontend URL in environment variable
- [ ] credentials: true if using cookies/sessions
- [ ] Allowed methods include all needed HTTP verbs
- [ ] Authorization header in allowedHeaders
- [ ] Different config for production vs development

### Troubleshooting

**CORS errors in browser**: Check origin matches exactly (include protocol and port)

**Credentials not sent**: Set credentials: true and configure frontend axios withCredentials

**Preflight requests failing**: Ensure OPTIONS method is allowed

**Specific headers blocked**: Add headers to allowedHeaders array

### Best Practices

1. Never use `origin: '*'` in production - always specify exact origins
2. Use environment variables for different environments
3. Enable credentials only if using cookies or authentication
4. Limit allowed methods to only those your API uses
5. Monitor and log CORS errors for security incidents
6. Consider using CORS middleware for complex scenarios

## [Serving Static Files - Frontend Asset Delivery]()

Configures NestJS to serve static frontend files built by React or other frontend frameworks. This allows deploying frontend and backend as a single application, simplifying deployment architecture and reducing infrastructure complexity by eliminating the need for separate web servers or CDN configurations for small to medium applications.

### When to use?

Use static file serving when deploying a monorepo with frontend and backend together, when you want to serve React build files from the same server as the API, or when simplifying deployment to a single container or server instance. Common in small to medium applications where deployment simplicity outweighs the benefits of separate infrastructure for frontend assets.

### When NOT to use?

Do not use when frontend is deployed separately on CDN or different server for better performance, when using microservices architecture with separate frontend deployment for scalability, or when you need CDN caching and edge delivery for frontend assets. Large-scale applications typically separate concerns for better scalability and global content distribution.

### Example

```typescript
const publicPath = join(__dirname, '..', '..', 'public');
app.useStaticAssets(publicPath, {
  index: 'index.html',
  prefix: '/',
});
```

**Expected folder structure**:
```
project/
├── backend/
│   ├── dist/
│   │   └── src/
│   │       └── main.js  (here is __dirname)
│   └── src/
│       └── main.ts
└── public/              (2 levels up)
    ├── index.html
    ├── assets/
    └── ...
```

**Levels explanation**:
- `__dirname` points to `/project/backend/dist/src`
- `'..'` goes up to `/project/backend/dist`
- `'..'` goes up to `/project/backend`
- Final: `/project/public`

### Checklist

- [ ] Public folder exists at correct path
- [ ] Frontend build output copied to public folder
- [ ] Path calculation matches folder structure
- [ ] index.html exists in public folder
- [ ] Static assets (CSS, JS) load correctly
- [ ] Build script copies files to correct location

### Troubleshooting

**404 on static files**: Verify publicPath with console.log - check the resolved path

**CSS/JS not loading**: Check that assets are in public/assets folder

**Wrong path calculation**: Count the '../' based on your dist folder structure

**Images not displaying**: Ensure image paths in React are relative or use correct base path

### Best Practices

1. Always verify the path calculation with console.log during setup
2. Use build scripts to automate copying frontend build to public folder
3. Set appropriate cache headers for static assets in production
4. Consider using CDN for production if serving heavy assets
5. Document the folder structure clearly for team members

## [SPA Fallback Configuration - Client-Side Routing Support]()

Implements fallback routing to serve index.html for all non-API routes, enabling React Router and other SPA frameworks to handle client-side routing. Without this, refreshing on a React route would return 404 from the backend because the server doesn't know about client-side routes, breaking the single-page application user experience.

### When to use?

Use SPA fallback when serving a React, Vue, or Angular application that uses client-side routing libraries like React Router, Vue Router, or Angular Router. Essential when users can refresh the page on any route or share deep links to specific application pages, ensuring seamless navigation throughout the single-page application.

### When NOT to use?

Do not use if you're not serving a frontend application, if using server-side rendering (SSR) where the server handles routing, or if all routing is handled by the backend with traditional multi-page application architecture. Skip this for API-only applications or when frontend is deployed separately from the backend.

### Example

```typescript
app.use((req: any, res: any, next: any) => {
  if (!req.path.startsWith('/api')) {
    return res.sendFile(join(publicPath, 'index.html'));
  }
  next();
});
```

**How it works**:
- Route `/api/*` → Process in backend
- Route `/products` → Serve `index.html` (React Router takes over)
- Route `/users/123` → Serve `index.html` (React Router takes over)

### Checklist

- [ ] Middleware added after static assets
- [ ] Check excludes /api routes
- [ ] index.html path is correct
- [ ] React Router configured with BrowserRouter
- [ ] All frontend routes work on refresh
- [ ] Deep links work correctly

### Troubleshooting

**API routes returning HTML**: Ensure check uses startsWith('/api') not includes

**React routes 404**: Verify middleware is added and index.html exists

**Infinite redirects**: Check that index.html itself is being served correctly

**Assets 404 on nested routes**: Use absolute paths or basename in React Router

### Best Practices

1. Add this middleware after static assets configuration
2. Always use startsWith for path checking to avoid partial matches
3. Test by refreshing on deep routes (e.g., /users/123/edit)
4. Configure React Router with BrowserRouter not HashRouter
5. Document this pattern for team members unfamiliar with SPAs

## [Global Validation Pipe - Automatic Request Validation]()

Configures automatic validation for all incoming requests using class-validator decorators on DTOs. This centralizes validation logic, ensures data integrity, prevents invalid data from reaching business logic, and provides consistent error responses to clients with clear validation messages that improve API usability and developer experience.

### When to use?

Use global validation pipe in every NestJS application that accepts user input via DTOs and HTTP requests. Essential for data integrity, security by preventing injection attacks, and providing clear validation error messages to clients. Should be configured before any routes handle requests to ensure all incoming data is validated consistently across the application.

### When NOT to use?

Do not disable global validation unless you have specific routes that need custom validation logic beyond class-validator capabilities. However, in practice, global validation should be used in nearly all applications - use validation groups or conditional validation for exceptions instead of disabling it globally, maintaining consistent validation approach throughout the application.

### Example

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,                    // Remove undefined properties
    forbidNonWhitelisted: true,         // Error if extra props
    transform: true,                    // Transform types automatically
    transformOptions: {
      enableImplicitConversion: false,  // Avoid incorrect conversion
    },
  }),
);
```

**Options**:
- `whitelist: true` - Removes fields not defined in DTO
- `forbidNonWhitelisted: true` - Returns 400 error if extra field
- `transform: true` - Converts types (string → number)
- `enableImplicitConversion: false` - Disables automatic conversion to avoid bugs

### Checklist

- [ ] ValidationPipe configured globally
- [ ] whitelist: true to strip unknown properties
- [ ] forbidNonWhitelisted: true for strict validation
- [ ] transform: true for automatic type conversion
- [ ] All DTOs use class-validator decorators
- [ ] Validation errors return clear messages

### Troubleshooting

**Validation not triggering**: Ensure DTOs use class-validator decorators (@IsString, @IsNumber, etc.)

**Type conversion not working**: Check transform: true is set

**Unknown properties not stripped**: Verify whitelist: true is configured

**Validation accepts invalid data**: Check that appropriate validators are used on DTO properties

### Best Practices

1. Always enable whitelist to prevent unknown properties
2. Use forbidNonWhitelisted in production for security
3. Combine with transform for automatic type conversion
4. Create custom validators for complex business rules
5. Return clear, user-friendly validation error messages
6. Test validation thoroughly with invalid inputs

## [Global Guards Configuration - Default Authentication Protection]()

Configures global authentication guards that protect all routes by default, requiring JWT tokens for access unless explicitly marked with @Public() decorator. This implements security-by-default pattern, reducing the risk of accidentally exposing protected endpoints and ensuring consistent authentication enforcement across the entire application.

### When to use?

Use global guards when most of your application requires authentication and you want to protect all routes by default with explicit opt-out for public endpoints. Ideal for applications where public endpoints are the exception rather than the rule. Reduces boilerplate code and improves security by making authentication the default behavior.

### When NOT to use?

Do not use global guards if most endpoints are public and authentication is the exception, if you need different authentication strategies per module requiring multiple guard types, or if you're building a public API where most endpoints should be accessible without authentication. In these cases, apply guards at controller or route level instead.

### Example

```typescript
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

### Checklist

- [ ] JwtAuthGuard implemented with Reflector support
- [ ] @Public() decorator created for public routes
- [ ] Login/signup routes marked with @Public()
- [ ] JWT strategy configured in auth module
- [ ] All protected routes return 401 without token
- [ ] Public routes accessible without authentication

### Troubleshooting

**All routes return 401**: Ensure public routes have @Public() decorator

**Guards not working**: Verify JwtAuthGuard is properly implemented and registered

**Reflector errors**: Check that Reflector is injected from app.get(Reflector)

**Token not recognized**: Verify JWT strategy configuration and token format

### Best Practices

1. Use global guards for security-by-default approach
2. Create clear @Public() decorator for exceptions
3. Document which routes are public in API documentation
4. Implement proper JWT validation in the guard
5. Return consistent 401 responses for unauthorized access
6. Test both authenticated and public routes thoroughly

## [Swagger Documentation Configuration - Interactive API Documentation]()

Configures automated API documentation using Swagger/OpenAPI, providing interactive documentation interface for developers to explore and test endpoints directly in the browser. Supports both JWT Bearer authentication and API Key authentication methods, enabling comprehensive testing and exploration of all API endpoints with security controls.

### When to use?

Use Swagger in every API project to document endpoints, request/response schemas, and authentication methods for all consumers. Essential for public APIs consumed by external developers, team collaboration across frontend and backend teams, reducing support overhead by providing self-service documentation, and improving onboarding for new developers joining the project.

### When NOT to use?

Do not skip Swagger unless building internal microservices with private communication only where service-to-service contracts are managed through code, or prototypes that won't be consumed by others and have no external integrations. However, even internal APIs benefit from documentation for maintenance and knowledge transfer, so skipping Swagger should be rare.

### Example

```typescript
const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('Complete API documentation')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addApiKey(
    {
      type: 'apiKey',
      name: 'X-API-KEY',
      in: 'header',
      description: 'API Key for external integrations',
      },
    'X-API-KEY',
  )
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,  // Keeps token after refresh
    tagsSorter: 'alpha',         // Sort tags alphabetically
    operationsSorter: 'alpha',   // Sort operations alphabetically
  },
});
```

**Access**: `http://localhost:3000/api/docs`

### Checklist

- [ ] Swagger module installed (@nestjs/swagger)
- [ ] DocumentBuilder configuration complete
- [ ] Both JWT and API Key auth configured
- [ ] Swagger UI accessible at /api/docs
- [ ] All controllers use @ApiTags decorator
- [ ] Endpoints use @ApiOperation and @ApiResponse
- [ ] DTOs use @ApiProperty decorators
- [ ] persistAuthorization enabled

### Troubleshooting

**Swagger page empty**: Ensure controllers use Swagger decorators (@ApiTags, @ApiOperation)

**Authorization not working**: Verify auth configuration name matches decorator usage

**DTOs not showing**: Add @ApiProperty() decorators to all DTO properties

**Routes not appearing**: Check that controllers are properly registered in modules

### Best Practices

1. Document all endpoints with clear descriptions
2. Use @ApiProperty() on all DTO fields with examples
3. Configure both authentication methods for flexibility
4. Enable persistAuthorization for better developer experience
5. Group endpoints logically using @ApiTags
6. Include example responses with @ApiResponse decorator
7. Keep Swagger documentation synchronized with code changes

## [Environment Variables - Configuration Management]()

Environment variables configuration for the NestJS application including server settings, database connection, JWT configuration, and external service credentials. Using environment variables enables different configurations per environment without code changes, following twelve-factor app methodology for portable and secure deployments.

### When to use?

Use environment variables for all configuration that changes between environments (development, staging, production), for sensitive data like secrets and passwords that must not be committed to repositories, for feature flags enabling conditional behavior, and for any value that should not be hardcoded or committed to source control for security and portability.

### When NOT to use?

Do not use environment variables for static configuration that never changes across environments, for complex object configurations that are better suited for config files with structure, or for values that need to be computed dynamically at runtime based on application state. Use configuration files or constants for truly static values.

### Example

Create a `.env` file in the backend root:

```env
# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres # use postgres database
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/postgres

# JWT
JWT_SECRET=your_super_secure_secret
JWT_EXPIRATION=7d

# API Key
X_API_KEY=your_secret_api_key
```

### Checklist

- [ ] .env file created in backend root
- [ ] .env added to .gitignore
- [ ] .env.example committed to repository
- [ ] All sensitive values use environment variables
- [ ] Different .env files for each environment
- [ ] Variables loaded using @nestjs/config or dotenv
- [ ] Documentation includes required variables

### Troubleshooting

**Variables undefined**: Ensure .env file is in correct directory and loaded before use

**Wrong values in production**: Verify production environment has correct .env or environment variables set

**Secrets exposed**: Check that .env is in .gitignore and not committed

**Missing variables on startup**: Add validation using @nestjs/config validation schema

### Best Practices

1. Never commit .env files to version control
2. Always commit .env.example with dummy values
3. Use strong, random values for secrets in production
4. Validate required environment variables on startup
5. Use different .env files per environment (.env.development, .env.production)
6. Document all environment variables in README
7. Use uppercase with underscores for variable names

## [Optional Security and Performance Configurations - Production Hardening]()

Additional middlewares and features to increase security, performance and application monitoring including Helmet for security headers, compression for response optimization, rate limiting for abuse prevention, and custom logging solutions for better observability in production environments.

### When to use?

Use these optional configurations in production environments to enhance security and performance where they provide clear value. Helmet should be used in all production APIs for security headers, compression for APIs with large responses to reduce bandwidth, rate limiting for public APIs to prevent abuse, and custom loggers for better observability and debugging in production.

### When NOT to use?

Do not add all optional features to simple prototypes or development environments where they add complexity without benefit and slow down development. Add them incrementally based on actual needs - use rate limiting only if abuse is a concern, compression only if response sizes are large, and custom loggers only when default logging is insufficient.

### Example

### Helmet (Security)

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet());
```

### Compression

```bash
npm install compression
```

```typescript
import compression from 'compression';

app.use(compression());
```

### Rate Limiting

```bash
npm install @nestjs/throttler
```

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

// In AppModule
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
})
```

### Custom Logger

```typescript
import { Logger } from '@nestjs/common';

const app = await NestFactory.create(AppModule, {
  logger: new Logger(),
});
```

### Checklist

- [ ] Helmet installed and configured for production
- [ ] Compression enabled for large responses
- [ ] Rate limiting configured appropriately
- [ ] Custom logger configured if needed
- [ ] Security headers verified in browser
- [ ] Rate limits tested with actual usage patterns
- [ ] Logging strategy documented

### Troubleshooting

**Helmet blocks resources**: Configure CSP directives to allow your specific resources

**Compression not working**: Check response size threshold and content-type

**Rate limiting too strict**: Adjust TTL and limit based on actual usage patterns

**Logger not outputting**: Verify log levels and transport configuration

### Best Practices

1. Always use Helmet in production environments
2. Configure compression threshold based on response sizes
3. Set rate limits based on actual API usage analytics
4. Use structured logging with correlation IDs
5. Monitor and adjust rate limits based on abuse patterns
6. Test security headers with security scanning tools
7. Document all security and performance configurations

## [References]()

- [NestJS Application](https://docs.nestjs.com/first-steps)
- [NestJS CORS](https://docs.nestjs.com/security/cors)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
