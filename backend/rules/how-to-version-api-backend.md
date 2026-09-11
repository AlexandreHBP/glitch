# [How to Version APIs in Backend]()

Complete guide to implement REST API versioning in NestJS backend, covering strategies, implementation patterns, and best practices for maintaining backward compatibility.

## [Why Version REST APIs - Importance and Benefits]()

API versioning is critical for maintaining backward compatibility while allowing controlled evolution. It prevents breaking existing client integrations, enables gradual migration, and demonstrates professional development maturity through systematic contract management.

### When to use?

Use API versioning from the start when building production REST APIs that external clients or frontend applications will consume. Always implement versioning when you expect the API to evolve over time with potential breaking changes to contracts, data structures, or business logic.

### When NOT to use?

Don't use API versioning for internal microservices that communicate within the same deployment boundary, throwaway prototypes, or single-use scripts. Also avoid versioning for APIs that will never have external consumers or when complete control over all clients exists.

### Example

```typescript
// main.ts - Enable versioning globally
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(3000);
}
```

### Checklist

- [ ] Versioning enabled in main.ts with VersioningType.URI
- [ ] All controllers have explicit version decorators
- [ ] Swagger documentation separated by version
- [ ] CHANGELOG documenting API changes between versions

### Troubleshooting

**Issue**: Routes not accessible after enabling versioning
**Solution**: Ensure all controllers have explicit `@Version()` decorator or set defaultVersion in enableVersioning configuration.

**Issue**: Swagger documentation not showing versioned routes
**Solution**: Create separate DocumentBuilder configurations for each version and use the include option to specify controllers per version.

### Best Practices

- Always start with v1 even for the first version to establish versioning pattern from the beginning
- Use URL versioning (VersioningType.URI) for clarity and ease of debugging over header or query parameter versioning
- Maintain at least two versions simultaneously during transition periods with minimum 6-month deprecation window

## [When to Create a New Version - Breaking Change Criteria]()

Understanding when to increment the API version is crucial. Create new versions for breaking changes like removing/renaming fields or changing response structures. Avoid versioning for backward-compatible changes like adding optional fields or new endpoints.

### When to use?

Create a new API version when introducing breaking changes such as removing or renaming fields, changing response structures, modifying authentication mechanisms, or altering business logic that affects existing endpoints. Version increment is necessary when backward compatibility cannot be maintained.

### When NOT to use?

Don't increment version when adding optional fields, creating new endpoints, fixing bugs, improving performance, or making internal refactoring that doesn't affect external API contracts. These changes are backward compatible and can be safely deployed without versioning.

### Example

```typescript
// Scenario requiring new version: Changing response structure
// V1: Returns array directly
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  findAll() {
    return [{ id: 1, name: 'John' }];
  }
}

// V2: Returns with pagination (breaking change)
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  @Get()
  findAll() {
    return { data: [{ id: 1, name: 'John' }], pagination: { page: 1 } };
  }
}
```

### Checklist

- [ ] Identified breaking changes requiring new version
- [ ] Verified if changes can be made backward compatible
- [ ] Documented changes in CHANGELOG with migration guide
- [ ] Both versions tested and working simultaneously
- [ ] Deprecation notice added to old version

### Troubleshooting

**Issue**: Unsure if change requires new version
**Solution**: If existing clients will break or need code changes to work, it's a breaking change requiring new version. Test with actual client integration.

**Issue**: Too many versions accumulating
**Solution**: Establish deprecation policy with sunset dates. Remove versions after 6-12 month transition period once client migration is complete.

### Best Practices

- Document all breaking changes with before/after examples in CHANGELOG
- Provide migration guides showing how to upgrade from old version to new version
- Communicate version changes to API consumers well in advance with clear deprecation timeline

## [Versioning Strategies - URL Header Query Comparison]()

Comparison of main strategies for versioning REST APIs in NestJS: URL versioning (recommended), header versioning, and query parameter versioning. Each strategy has specific advantages and trade-offs for different use cases.

### When to use?

Use URL versioning (VersioningType.URI) for most production APIs as it provides clarity, easy debugging, and excellent tooling support. Use header versioning when URL cleanliness is critical and you follow strict REST standards. Avoid query parameter versioning in production.

### When NOT to use?

Don't use header versioning when debugging ease and discoverability are priorities, as it requires special tools to test. Don't use query parameter versioning in professional APIs as it mixes versioning with query parameters and appears unprofessional.

### Example

**URL Versioning (Recommended):**
```
GET /api/v1/users
GET /api/v2/users
```

**Header Versioning:**
```
GET /api/users
Accept: application/vnd.api.v1+json
```

**Query Parameter Versioning:**
```
GET /api/users?version=1
```

### Checklist

- [ ] URL versioning selected as primary strategy
- [ ] Version visible and testable in browser
- [ ] HTTP caching strategy defined for versioned endpoints
- [ ] Swagger documentation reflects versioning strategy
- [ ] Team trained on chosen versioning approach

### Troubleshooting

**Issue**: Cache conflicts between different versions
**Solution**: With URL versioning, each version has unique URL enabling proper cache separation. With header versioning, ensure Vary header includes version information.

**Issue**: Difficult to test different versions
**Solution**: URL versioning allows direct browser testing. For header versioning, use tools like Postman or curl with custom headers.

### Best Practices

- Prefer URL versioning for clarity and ease of use
- If using header versioning, follow standard Accept header conventions
- Never mix versioning strategies within the same API
- Document chosen strategy clearly in API documentation

## [URL Versioning Implementation - Complete NestJS Setup]()

Complete step-by-step guide to implement URL versioning in NestJS using VersioningType.URI, including global configuration, controller setup, and module registration for multiple versions.

### When to use?

Implement URL versioning when starting a new NestJS project that will serve external clients, or when refactoring an existing API to introduce versioning. This is the standard approach for most production REST APIs requiring version management.

### When NOT to use?

Skip this implementation if building simple internal tools with single consumers, proof-of-concept applications, or when using alternative versioning strategies like header-based versioning. Also skip if API will never evolve or break compatibility.

### Example

**Step 1: Enable global versioning**
```typescript
// src/main.ts
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(3000);
}
```

**Step 2: Create versioned controllers**
```typescript
// users-v1.controller.ts
@ApiTags('users-v1')
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  findAll() {
    return { users: [] };
  }
}

// users-v2.controller.ts
@ApiTags('users-v2')
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  @Get()
  findAll() {
    return { data: [], pagination: {} };
  }
}
```

**Step 3: Register in module**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersV1Controller, UsersV2Controller],
  providers: [UsersV1Service, UsersV2Service],
})
export class UsersModule {}
```

### Checklist

- [ ] Global versioning enabled in main.ts with VersioningType.URI
- [ ] Separate controller files for each version
- [ ] Each version has dedicated DTOs and services
- [ ] All versions registered in module
- [ ] Routes tested with version prefix (e.g., /api/v1/users)

### Troubleshooting

**Issue**: Routes return 404 after adding versioning
**Solution**: Ensure controllers have explicit version decorator and versioning is enabled in bootstrap. Check that routes include version prefix.

**Issue**: Multiple versions sharing same route conflict
**Solution**: Create separate controller classes for each version with identical path but different version decorator values.

### Best Practices

- Use separate controller files per version for clean separation
- Share entities across versions but duplicate DTOs when contracts differ
- Use descriptive ApiTags for each version in Swagger

## [API Evolution Example - V1 to V2 Migration]()

Practical example demonstrating how to evolve an API from version 1 to version 2 while maintaining backward compatibility. Shows real-world breaking changes including field restructuring, pagination addition, and contract modifications.

### When to use?

Use this pattern when introducing breaking changes like splitting fields (name → firstName/lastName), adding pagination to list endpoints, or restructuring response formats. Apply when existing clients must continue working while new clients adopt improved structure.

### When NOT to use?

Don't create new version when changes are backward compatible like adding optional fields, creating new endpoints, or fixing bugs. Also avoid when change can be made optional through query parameters without breaking existing clients.

### Example

**V1: Initial structure**
```typescript
// create-user-v1.dto.ts
export class CreateUserDtoV1 {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

// users-v1.controller.ts
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  findAll() {
    return this.service.findAll(); // Returns array directly
  }
}
```

**V1 Response:**
```json
[
  { "id": 1, "name": "John", "email": "john@email.com" },
  { "id": 2, "name": "Mary", "email": "mary@email.com" }
]
```

**V2: Evolved structure**
```typescript
// create-user-v2.dto.ts
export class CreateUserDtoV2 {
  @IsString()
  firstName: string; // Split name

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string; // New field
}

// users-v2.controller.ts
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.findAll(page, limit); // Returns with pagination
  }
}
```

**V2 Response:**
```json
{
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Silva",
      "email": "john@email.com",
      "phone": "+5511999999999"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Checklist

- [ ] V1 controller and service remain unchanged
- [ ] V2 introduces breaking changes in separate files
- [ ] DTOs differ between versions reflecting contract changes
- [ ] Both versions return data in their respective formats
- [ ] Migration guide documents how to upgrade from V1 to V2
- [ ] Tests cover both versions independently

### Troubleshooting

**Issue**: Clients confused about which version to use
**Solution**: Provide clear migration guide in CHANGELOG documenting differences and benefits of V2. Mark V1 as deprecated with sunset date.

**Issue**: Code duplication between V1 and V2
**Solution**: Extract shared logic to base service class. Use adapter pattern to convert between version-specific DTOs and shared entities.

### Best Practices

- Document breaking changes with before/after examples
- Provide clear migration timeline and support window
- Keep both versions fully functional during transition period
- Use semantic field names that reflect business meaning

## [Code Sharing Between Versions - Adapter and Inheritance Patterns]()

Techniques to reuse code between API versions without duplication using adapter pattern for DTO conversion and shared base services with inheritance. Reduces maintenance burden while keeping version-specific logic isolated.

### When to use?

Use adapter pattern when DTOs differ between versions but underlying entities remain the same. Use inheritance with base services when core business logic is identical but response formatting differs. Apply when multiple versions need to coexist long-term.

### When NOT to use?

Don't share code when business logic fundamentally differs between versions or when shared code creates tight coupling. Avoid when versions are temporary and old version will be removed soon. Skip when code sharing adds complexity without clear maintenance benefits.

### Example

**Adapter Pattern for DTO conversion:**
```typescript
// users-v2.service.ts
@Injectable()
export class UsersV2Service {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async create(dto: CreateUserDtoV2) {
    // Convert V2 to internal structure
    const userV1: CreateUserDtoV1 = {
      name: `${dto.firstName} ${dto.lastName}`,
      email: dto.email,
    };

    const user = this.repository.create(userV1);
    return await this.repository.save(user);
  }
}
```

**Inheritance with base service:**
```typescript
// shared/users-base.service.ts
@Injectable()
export class UsersBaseService {
  constructor(
    @InjectRepository(User)
    protected repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    return await this.repository.findOneBy({ id });
  }
}

// users-v1.service.ts
@Injectable()
export class UsersV1Service extends UsersBaseService {
  async findAll() {
    return await this.repository.find(); // Returns array
  }
}

// users-v2.service.ts
@Injectable()
export class UsersV2Service extends UsersBaseService {
  async findAll(page: number, limit: number) {
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
```

### Checklist

- [ ] Base service contains only version-agnostic logic
- [ ] Adapter functions handle DTO conversions cleanly
- [ ] Version-specific services extend base for shared functionality
- [ ] No circular dependencies between version services
- [ ] Tests validate both shared and version-specific behavior
- [ ] Code sharing reduces duplication without sacrificing clarity

### Troubleshooting

**Issue**: Base service changes break old versions
**Solution**: Make base service methods protected and stable. Create new methods for new behavior instead of modifying existing ones.

**Issue**: Adapter conversions become complex
**Solution**: If adapter has extensive logic, consider separate mapper classes. Keep adapters focused on simple structural transformations.

### Best Practices

- Keep base services minimal and stable
- Use adapters for simple transformations, separate mappers for complex logic
- Version-specific services should override base methods when behavior differs
- Document shared code clearly to prevent unintended version coupling

## [Swagger Documentation - Separate API Version Docs]()

Configure multiple Swagger instances to provide isolated documentation for each API version. Enables clear versioned API reference with separate endpoints, schemas, and examples per version for better developer experience.

### When to use?

Implement separate Swagger documentation when maintaining multiple API versions simultaneously. Use when API consumers need clear documentation showing differences between versions or when versions have significantly different contracts and endpoints.

### When NOT to use?

Skip separate Swagger instances for internal APIs with single consumers, when versions are nearly identical, or during short transition periods. Also avoid when maintaining multiple Swagger instances adds significant overhead without clear documentation benefits.

### Example

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger V1
  const configV1 = new DocumentBuilder()
    .setTitle('API V1')
    .setDescription('API V1 - Legacy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentV1 = SwaggerModule.createDocument(app, configV1, {
    include: [UsersV1Controller], // Only V1 controllers
  });
  SwaggerModule.setup('api/docs/v1', app, documentV1);

  // Swagger V2
  const configV2 = new DocumentBuilder()
    .setTitle('API V2')
    .setDescription('API V2 - Current')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const documentV2 = SwaggerModule.createDocument(app, configV2, {
    include: [UsersV2Controller], // Only V2 controllers
  });
  SwaggerModule.setup('api/docs/v2', app, documentV2);

  await app.listen(3000);
}
```

**Access:**
- Swagger V1: `http://localhost:3000/api/docs/v1`
- Swagger V2: `http://localhost:3000/api/docs/v2`

### Checklist

- [ ] Separate DocumentBuilder configuration for each version
- [ ] Include option specifies version-specific controllers
- [ ] Different paths for each Swagger instance (docs/v1, docs/v2)
- [ ] Version information clear in title and description
- [ ] Deprecated versions marked appropriately
- [ ] Authentication schemes documented per version

### Troubleshooting

**Issue**: Controllers appear in wrong version documentation
**Solution**: Ensure include array in createDocument specifies only controllers for that version. Check controller version decorators match.

**Issue**: Shared DTOs cause confusion across versions
**Solution**: Use version-specific DTO names and ApiTags. Consider duplicating DTOs when contracts differ significantly between versions.

### Best Practices

- Use descriptive titles indicating version status (Current, Legacy, Beta)
- Mark deprecated versions clearly in description
- Keep Swagger paths organized by version (docs/v1, docs/v2)
- Document migration paths between versions in descriptions

## [Version Deprecation Strategy - Professional Sunset Process]()

Professional approach to deprecate old API versions using HTTP headers, timeline communication, and graceful removal. Ensures clients have adequate time to migrate while maintaining clear communication about version lifecycle.

### When to use?

Implement deprecation strategy when preparing to sunset an old API version after introducing a new version. Use when you need to communicate version end-of-life to clients and provide migration timeline. Essential for public APIs with external consumers.

### When NOT to use?

Skip formal deprecation for internal APIs with full client control, prototype APIs, or when immediate breaking changes are acceptable. Also skip when version will continue indefinitely or when no alternative version exists yet.

### Example

**Deprecation headers in controller:**
```typescript
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  @ApiOperation({
    summary: 'List users',
    deprecated: true, // Mark as deprecated in Swagger
  })
  @ApiResponse({
    status: 200,
    description: 'DEPRECATED: Use /api/v2/users',
    headers: {
      'X-API-Warn': {
        description: 'API will be discontinued on 2026-01-01',
        schema: { type: 'string' }
      }
    }
  })
  findAll(@Res() res: Response) {
    // Warning headers
    res.setHeader('X-API-Warn', 'API v1 will be discontinued on 2026-01-01. Migrate to v2.');
    res.setHeader('X-API-Deprecation-Date', '2026-01-01');
    res.setHeader('X-API-Sunset', '2026-06-01'); // Removal date

    return res.json(this.service.findAll());
  }
}
```

**Disable after transition period:**
```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '2', // New default
});

// Remove UsersV1Controller from module after transition
```

### Checklist

- [ ] Deprecation headers added to all old version endpoints
- [ ] Sunset date communicated at least 6 months in advance
- [ ] Migration guide available in documentation
- [ ] Clients notified through multiple channels
- [ ] Monitoring in place to track old version usage
- [ ] Removal date scheduled and communicated

### Troubleshooting

**Issue**: Clients still using old version after sunset date
**Solution**: Extend deadline if usage is significant. Reach out to remaining clients directly. Consider rate limiting instead of immediate removal.

**Issue**: Deprecation headers not visible to clients
**Solution**: Document header usage in API documentation. Log deprecation warnings on server side. Send email notifications to registered API consumers.

### Best Practices

- Provide minimum 6-month transition period between deprecation announcement and removal
- Use standard HTTP headers (X-API-Warn, X-API-Sunset) for deprecation notices
- Monitor old version usage to validate safe removal
- Maintain clear communication timeline with all stakeholders

## [Frontend Integration - Consuming Versioned APIs with Axios]()

Configure React frontend to consume versioned backend APIs using centralized Axios configuration. Enables consistent version management across frontend application with easy version switching and environment-based configuration.

### When to use?

Implement centralized API version configuration when frontend consumes versioned backend APIs. Use when building React applications that need to switch between API versions or support multiple environments with different API versions.

### When NOT to use?

Skip centralized configuration for simple applications consuming single API version, when using GraphQL instead of REST, or when each module needs different API versions. Also skip for static sites without dynamic API consumption.

### Example

```typescript
// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept deprecation warnings
api.interceptors.response.use(
  (response) => {
    if (response.headers['x-api-warn']) {
      console.warn('API Deprecation:', response.headers['x-api-warn']);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
```

```typescript
// src/services/user.service.ts
import api from './api';

export const UserService = {
  // Using v2 endpoint (migrated)
  async findAll() {
    const response = await api.get('/v2/users');
    return response.data;
  },

  async create(userData: any) {
    const response = await api.post('/v2/users', userData);
    return response.data;
  },
};
```

```typescript
// src/services/product.service.ts
import api from './api';

export const ProductService = {
  // Still using v1 endpoint (not migrated yet)
  async findAll() {
    const response = await api.get('/v1/products');
    return response.data;
  },
};
```

> **🚨 CRITICAL**: API version must be specified in each service method, NOT in `api.ts` baseURL. This allows gradual migration where some services use `/v2/...` while others remain on `/v1/...`.

### Checklist

- [ ] Centralized Axios instance WITHOUT version in baseURL
- [ ] Environment variable for API base URL
- [ ] Version specified in each service method endpoint path
- [ ] Deprecation header interceptor configured
- [ ] Services can use different versions simultaneously
- [ ] Error handling for version mismatches

### Troubleshooting

**Issue**: API version not applied to requests
**Solution**: Ensure each service method includes version in the path (`/v1/products`, `/v2/users`). Check that services import and use the centralized axios instance. Verify baseURL does NOT include version.

**Issue**: Deprecation warnings not visible
**Solution**: Implement response interceptor to log deprecation headers. Display warnings to developers in console or UI during development.

**Issue**: Cannot migrate endpoints gradually
**Solution**: Never centralize version in baseURL. Always specify version per service method to allow mixed versions during migration period.

### Best Practices

- Specify API version in each service method path, not in baseURL
- Use environment variables for base URL only (dev, staging, prod)
- Implement interceptors to handle deprecation warnings
- Log deprecation warnings prominently during development
- Allow different services to use different versions during migration
- Update service methods individually as endpoints migrate to new versions

## [Complete Versioning Checklist - Implementation Verification]()

Comprehensive checklist to verify complete and correct API versioning implementation in NestJS. Covers all aspects from backend configuration to frontend integration, documentation, and deprecation strategy.

### When to use?

Use this checklist when setting up new API versioning, conducting code reviews for versioned APIs, or auditing existing implementations. Apply during project onboarding to ensure team follows versioning standards consistently.

### When NOT to use?

Skip detailed checklist for simple internal tools, prototype applications, or when versioning requirements are intentionally minimal. Also skip when API is in early development and contracts are still highly fluid.

### Example

**Backend Checklist:**
- [ ] Versioning enabled in main.ts with VersioningType.URI
- [ ] Controllers always with explicit version (start with v1)
- [ ] All versions registered in module
- [ ] Swagger separated by version
- [ ] CHANGELOG-API.md documenting changes

**Lifecycle Management:**
- [ ] Deprecation headers configured for old versions
- [ ] Transition period defined (minimum 6 months)
- [ ] Migration guides available

**Frontend Integration:**
- [ ] Frontend services include version in each endpoint path
- [ ] Services can use different API versions simultaneously
- [ ] Deprecation warnings logged and monitored

**Quality Assurance:**
- [ ] Tests for each version independently
- [ ] Version-specific DTOs validated
- [ ] Both versions tested simultaneously

### Checklist

- [ ] All backend requirements met
- [ ] All lifecycle management steps completed
- [ ] Frontend properly integrated
- [ ] Quality assurance passed
- [ ] Documentation complete
- [ ] Team trained on versioning process

### Troubleshooting

**Issue**: Checklist too long and overwhelming
**Solution**: Break into phases - focus on core setup first, then add lifecycle management, finally optimize with best practices.

**Issue**: Some checklist items don't apply to project
**Solution**: Customize checklist for your context. Mark N/A for items that genuinely don't apply but document reasoning.

### Best Practices

- Review checklist during code review process
- Update checklist as versioning practices evolve
- Use checklist as onboarding tool for new team members
- Automate checklist items where possible with linting and tests

## [Common Problems and Solutions - Troubleshooting Guide]()

Solutions for frequent errors when implementing API versioning in NestJS including route accessibility issues, Swagger configuration problems, and default version behavior. Helps developers quickly resolve common implementation challenges.

### When to use?

Consult this troubleshooting guide when encountering errors during versioning implementation, routes not working as expected, or Swagger documentation issues. Use as reference during development and debugging of versioned APIs.

### When NOT to use?

Don't use for business logic bugs unrelated to versioning, database issues, or authentication problems. Also skip for general NestJS issues not specific to versioning implementation.

### Example

**Problem: Cannot GET /api/users**
```typescript
// Solution: Add version to controller
@Controller({ path: 'users', version: '1' })
export class UsersController {}

// And enable versioning in main.ts
app.enableVersioning({
  type: VersioningType.URI,
});
```

**Problem: Swagger not showing versions**
```typescript
// Solution: Use include in createDocument
const document = SwaggerModule.createDocument(app, config, {
  include: [UsersV1Controller], // Explicitly include controllers
});
```

**Problem: defaultVersion not working**
```typescript
// Explanation: defaultVersion only applies when controller has no @Version
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1', // Used only if controller lacks @Version decorator
});
```

### Checklist

- [ ] Route 404 errors investigated and resolved
- [ ] Swagger configuration verified for each version
- [ ] Default version behavior understood
- [ ] Controller version decorators present
- [ ] Global versioning enabled in bootstrap
- [ ] All routes tested with correct version prefix

### Troubleshooting

**Issue**: Routes intermittently fail
**Solution**: Check for route conflicts between versions. Ensure version decorators are consistent. Verify module imports include all version controllers.

**Issue**: Tests fail after adding versioning
**Solution**: Update test requests to include version prefix. Mock versioning configuration in test setup. Use correct baseURL with version.

### Best Practices

- Test routes immediately after adding versioning
- Keep Swagger documentation in sync with controllers
- Document common issues in team knowledge base
- Use explicit version decorators rather than relying on defaults

## [References and Documentation - Official Resources]()

Links to official NestJS documentation and API versioning best practices from authoritative sources. Provides foundation for understanding versioning concepts and implementation patterns.

### When to use?

Reference official documentation when learning versioning concepts, resolving implementation questions, or validating best practices. Use when teaching versioning to team members or making architectural decisions about versioning strategy.

### When NOT to use?

Don't rely solely on general documentation for project-specific requirements. Also avoid when you need immediate solutions - use troubleshooting guide first, then consult official docs for deeper understanding.

### Example

**Key Resources:**

- [NestJS Versioning](https://docs.nestjs.com/techniques/versioning) - Official NestJS versioning documentation
- [API Versioning Best Practices](https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/) - REST API design patterns
- [HTTP Sunset Header](https://datatracker.ietf.org/doc/html/rfc8594) - Standard for API deprecation

**Golden Rule:** Always use versioning from the start (v1), even if you don't plan to create v2 in the future. It's better to have v1 and never need v2, than to have no versioning and need to make a breaking change.

### Checklist

- [ ] Team familiar with NestJS versioning documentation
- [ ] REST API best practices reviewed
- [ ] HTTP standards for deprecation understood
- [ ] Reference documentation bookmarked
- [ ] Latest documentation versions consulted
- [ ] Community resources identified for support

### Troubleshooting

**Issue**: Documentation outdated or unclear
**Solution**: Check NestJS GitHub issues and discussions for latest guidance. Consult community examples and real-world implementations.

**Issue**: Conflicting advice from different sources
**Solution**: Prioritize official NestJS documentation. Validate recommendations against project requirements and constraints.

### Best Practices

- Bookmark official documentation for quick reference
- Stay updated with NestJS release notes for versioning changes
- Contribute back to documentation when finding gaps
- Share key learnings with team through internal documentation
