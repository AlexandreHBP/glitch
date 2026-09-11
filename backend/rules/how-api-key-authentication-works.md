# [How API Key Authentication Works]()

Comprehensive guide on implementing API Key authentication for service-to-service integrations, webhooks, and automated scripts as an alternative to JWT authentication in NestJS applications.

## [What is API Key Authentication?]()

API Key is an alternative authentication mechanism to JWT, designed for service-to-service integrations, automated scripts, webhooks, and internal services that don't use user login. Unlike JWT which carries user identity and expires automatically, API Key is a long-lived secret token shared between services, validated by comparing header value against stored secret, commonly used for backend-to-backend communication and system integrations.

### When to use?

Use API Key authentication for backend-to-backend integrations, cron jobs, webhooks, and automated scripts where there is no end-user login flow. Apply this pattern for server-to-server communication requiring simple authentication without session management or user context.

### When NOT to use?

Do not use API Key for user-facing applications including frontends and mobile apps where users login with credentials. Avoid API Keys for scenarios requiring automatic token expiration, user identity tracking, or session management. Use JWT authentication instead for these cases.

### Example

Simple API Key validation flow:
```
1. Service generates long random API Key
2. Key stored in environment variable or database
3. Client sends key in X-API-KEY header
4. Backend validates key matches expected value
5. Request proceeds if valid, 401 if invalid
```

### Checklist

- [ ] API Key generated using cryptographically secure method (minimum 32 characters)
- [ ] Key stored securely in environment variable never committed to git
- [ ] ApiKeyAuthGuard created with Reflector for metadata-based protection
- [ ] @ApiKeyAuth decorator available for marking endpoints requiring API Key
- [ ] Guard registered globally in main.ts after JwtAuthGuard
- [ ] Swagger documentation configured with @ApiSecurity decorator

### Troubleshooting

**API Key missing errors**: Check if X-API-KEY header is included in request. Verify header name matches guard implementation exactly.

**Invalid API Key errors**: Confirm environment variable X_API_KEY is set correctly. Check for trailing spaces or encoding issues in key value.

**Both JWT and API Key required unexpectedly**: Ensure @Public decorator is applied to endpoints that should only require API Key authentication.

### Best Practices

- Generate API Keys using openssl or crypto.randomBytes for cryptographic security
- Rotate API Keys periodically especially if compromise is suspected
- Store keys only in environment variables or encrypted secrets management systems
- Use HTTPS in production to prevent API Key interception during transmission
- Implement rate limiting on API Key authenticated endpoints to prevent abuse
- Log API Key usage with timestamps for security auditing and monitoring

## [API Key Authentication Implementation - NestJS Guard, Decorator and Global Registration]()

Complete implementation process including environment variable configuration with secure key generation using openssl, custom guard creation with Reflector integration for metadata-based route protection, decorator creation for marking routes that require API Key, and global guard registration in main.ts following NestJS best practices for security and coexistence with JWT authentication.

### When to use?

Follow these implementation steps when adding API Key authentication to an existing NestJS application that already has JWT authentication. Use this approach to support both user authentication and service-to-service authentication simultaneously within the same application.

### When NOT to use?

Do not follow this exact implementation if you need only API Key without JWT, as the guard registration and decorator patterns can be simplified. Adapt the implementation for different frameworks beyond NestJS as these patterns are NestJS-specific.

### Example

#### [1. Configure Environment Variable]()

**.env**:
```env
X_API_KEY=your-long-random-secret-key-here
```

Generate a secure key:
```bash
openssl rand -hex 32
```

#### [2. Create API Key Guard]()

**`auth/guards/api-key-auth.guard.ts`**:

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

export const API_KEY_AUTH = 'api-key-auth';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route requires API Key
    const requiresApiKey = this.reflector.get<boolean>(
      API_KEY_AUTH,
      context.getHandler(),
    );

    if (!requiresApiKey) {
      return true; // Route doesn't require API Key
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('X_API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
```

#### [3. Create Decorator]()

**`auth/decorators/api-key-auth.decorator.ts`**:

```typescript
import { SetMetadata } from '@nestjs/common';

export const API_KEY_AUTH = 'api-key-auth';
export const ApiKeyAuth = () => SetMetadata(API_KEY_AUTH, true);
```

#### [4. Register Guard Globally]()

**`main.ts`**:

```typescript
import { ApiKeyAuthGuard } from './auth/guards/api-key-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);

  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new ApiKeyAuthGuard(configService, reflector),
  );

  await app.listen(3000);
}
```

### Checklist

- [ ] X_API_KEY environment variable configured in .env file
- [ ] API Key generated using secure method like openssl rand -hex 32
- [ ] ApiKeyAuthGuard created in auth/guards/ folder
- [ ] Guard checks API_KEY_AUTH metadata using Reflector
- [ ] @ApiKeyAuth decorator created in auth/decorators/ folder
- [ ] Both guards registered in main.ts in correct order
- [ ] Guard exports API_KEY_AUTH constant for decorator use

### Troubleshooting

**Guard not protecting endpoints**: Verify guard is registered globally in main.ts and decorator is applied to endpoint. Check metadata key matches between guard and decorator.

**ConfigService undefined**: Ensure ConfigModule is imported globally in app.module.ts and ConfigService is properly injected into guard constructor.

**Both guards blocking requests**: Check guard order in main.ts. JwtAuthGuard should come before ApiKeyAuthGuard to try JWT first.

### Best Practices

- Use dependency injection for ConfigService rather than hardcoding keys in guard
- Keep guard logic simple focusing only on API Key validation
- Return true early if endpoint doesn't require API Key for performance
- Use UnauthorizedException for consistent error responses
- Document guard usage and decorator application in team documentation

## [Usage Patterns - Webhook Endpoints and Flexible Authentication]()

Practical examples of how to apply API Key authentication to NestJS backend endpoints including webhook endpoints that require only API Key by combining @Public and @ApiKeyAuth decorators, and flexible endpoints that accept both JWT and API Key authentication by checking req.user presence enabling secure service-to-service communication while maintaining backward compatibility with existing JWT-authenticated clients.

### When to use?

Use the webhook pattern for third-party integrations, scheduled tasks, or external services that cannot use JWT. Use the flexible authentication pattern when endpoints need to support both end-user requests via JWT and automated service requests via API Key.

### When NOT to use?

Do not use the flexible pattern when strict user identity is required for all requests. Do not use API Key-only endpoints for user-facing features that require authentication context and authorization.

### Example

#### [Endpoint that Accepts API Key Only]()

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiKeyAuth } from '@/auth/decorators/api-key-auth.decorator';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('webhooks')
export class WebhookController {

  @Public() // Doesn't require JWT
  @ApiKeyAuth() // Requires API Key
  @Post('process')
  async processWebhook(@Body() data: any) {
    // Process webhook
    return { success: true };
  }
}
```

#### [Endpoint that Accepts JWT OR API Key]()

```typescript
@Controller('data')
export class DataController {

  @Get('sync')
  async syncData(@Request() req) {
    // This endpoint accepts both JWT and API Key
    // If JWT, req.user will be available
    // If API Key, req.user will be undefined

    if (req.user) {
      // Authenticated with JWT
      return this.service.syncForUser(req.user.userId);
    } else {
      // Authenticated with API Key (no specific user)
      return this.service.syncAll();
    }
  }
}
```

### Checklist

- [ ] @Public decorator applied when endpoint should not require JWT
- [ ] @ApiKeyAuth decorator applied when endpoint requires API Key
- [ ] Business logic checks req.user presence for conditional behavior
- [ ] Endpoints properly documented indicating which auth methods are accepted
- [ ] Error handling covers both authentication scenarios appropriately

### Troubleshooting

**Endpoint requires both JWT and API Key**: Remove @Public decorator to require JWT by default, or adjust guard logic to require only one authentication method.

**req.user undefined for JWT requests**: Verify JwtAuthGuard is registered before ApiKeyAuthGuard in main.ts and JWT token is valid.

**Webhook endpoint still requires JWT**: Ensure @Public decorator is present alongside @ApiKeyAuth decorator.

### Best Practices

- Always combine @Public with @ApiKeyAuth for webhook endpoints to skip JWT validation
- Document in controller comments which authentication methods each endpoint accepts
- Validate req.user existence when conditional logic depends on authentication type
- Use type guards to ensure proper typing when checking req.user presence
- Test both authentication paths in integration tests for flexible endpoints

## [Client Implementation - HTTP Requests with API Key Header]()

Examples of HTTP requests using API Key authentication in different tools and programming languages including cURL for command-line testing, Axios for Node.js server-to-server integrations with environment variable support, and native fetch API for modern JavaScript applications demonstrating proper X-API-KEY header configuration and JSON content-type for API communication.

### When to use?

Use these examples when implementing client code that needs to call API Key protected endpoints. Reference these patterns for webhooks, scheduled jobs, or service-to-service integration code in backend services.

### When NOT to use?

Do not use API Key in frontend applications where keys would be exposed in client-side code. These examples are for backend services and trusted environments only where API keys can be securely stored.

### Example

#### [With cURL]()

```bash
curl -X POST http://localhost:3000/api/webhooks/process \
  -H "X-API-KEY: your-key-here" \
  -H "Content-Type: application/json" \
  -d '{"event": "test"}'
```

#### [With Axios (Node.js)]()

```typescript
import axios from 'axios';

const response = await axios.post(
  'http://localhost:3000/api/webhooks/process',
  { event: 'test' },
  {
    headers: {
      'X-API-KEY': process.env.API_KEY,
      'Content-Type': 'application/json',
    },
  }
);
```

#### [With fetch]()

```typescript
const response = await fetch('http://localhost:3000/api/webhooks/process', {
  method: 'POST',
  headers: {
    'X-API-KEY': 'your-key-here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ event: 'test' }),
});
```

### Checklist

- [ ] X-API-KEY header included in all requests to protected endpoints
- [ ] API Key value matches server environment variable exactly
- [ ] Content-Type header set to application/json for JSON payloads
- [ ] HTTP method matches endpoint definition (POST, GET, etc.)
- [ ] API Key stored securely in environment variables not hardcoded

### Troubleshooting

**401 Unauthorized responses**: Verify X-API-KEY header is present and value matches server configuration. Check for typos in header name (case-sensitive).

**CORS errors**: Ensure X-API-KEY is allowed in Access-Control-Allow-Headers on server. Configure CORS properly in NestJS to allow custom headers.

**Request timeout**: Check API endpoint is reachable and server is running. Verify network connectivity between services and firewall rules.

### Best Practices

- Store API Keys in environment variables never commit to version control
- Use HTTPS for all API Key authenticated requests in production
- Implement retry logic with exponential backoff for failed requests
- Log API requests for debugging but never log the API Key value itself
- Rotate API Keys periodically and update client configurations accordingly

## [Advanced Implementation - Multiple Keys, Rate Limiting and Usage Tracking]()

Advanced scenarios including multiple API Keys per client using database storage with ApiKey entity for granular access control and usage tracking, rate limiting using NestJS Throttler module to prevent API abuse, and last-used-at timestamps for monitoring and security auditing enabling enterprise-grade API Key management with per-client key generation, revocation capabilities, and user association for multi-tenant applications.

### When to use?

Use database-backed API Keys when you need to support multiple clients with individual keys, require key revocation capabilities, or need to track usage per client. Apply rate limiting to all API Key endpoints in production to prevent abuse.

### When NOT to use?

Do not use database-backed keys for simple single-client integrations where environment variable is sufficient. Avoid complex key management for internal services where trust is established and simpler authentication suffices.

### Example

#### [API Key per Client with Database]()

**1. Create API Keys Table**:

```typescript
@Entity('api_keys')
export class ApiKey extends SuperEntity {
  @Column({ type: 'varchar', length: 64, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_used_at' })
  lastUsedAt: Date;
}
```

**2. Validate in Guard**:

```typescript
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key missing');
    }

    const keyRecord = await this.apiKeyRepository.findOne({
      where: { key: apiKey, active: true },
      relations: ['user'],
    });

    if (!keyRecord) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Update last usage
    await this.apiKeyRepository.update(keyRecord.id, {
      lastUsedAt: new Date(),
    });

    // Inject user into request
    request.user = {
      userId: keyRecord.userId,
      apiKeyId: keyRecord.id,
    };

    return true;
  }
}
```

#### [Rate Limiting Implementation]()

Limit requests per API Key:

```bash
npm install @nestjs/throttler
```

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Public()
@ApiKeyAuth()
@Post('webhook')
async webhook() {
  // Maximum requests configured in module
}
```

### Checklist

- [ ] ApiKey entity created with active flag for revocation
- [ ] Database migration created and applied for api_keys table
- [ ] Guard performs async database lookup for key validation
- [ ] lastUsedAt timestamp updated on each successful authentication
- [ ] User association established for multi-tenant scenarios
- [ ] ThrottlerModule configured globally or per-endpoint
- [ ] Rate limits appropriate for expected usage patterns

### Troubleshooting

**Database queries slowing down requests**: Implement caching layer for frequently used API Keys. Consider Redis cache with TTL for performance.

**Rate limiting not working**: Ensure ThrottlerGuard is applied and ThrottlerModule is properly configured in app module with storage adapter.

**lastUsedAt not updating**: Check database update permissions and ensure update query is not failing silently. Add error logging in guard.

### Best Practices

- Index the key column in database for fast lookups and performance
- Implement API Key generation endpoint with admin authorization only
- Cache active API Keys in Redis to reduce database load
- Use database transactions when creating or revoking keys for consistency
- Implement audit logging for API Key creation, usage, and revocation
- Set reasonable rate limits based on client tier or subscription level

## [Swagger Documentation - API Key Configuration and Testing]()

Swagger configuration to display and test API Key protected endpoints in interactive documentation using DocumentBuilder addApiKey method in main.ts for global configuration, and @ApiSecurity decorator on controller methods to indicate API Key requirement enabling developers to test API Key authentication directly in Swagger UI by entering the key in the authorization dialog, improving developer experience and API discoverability.

### When to use?

Configure Swagger for API Key when exposing webhook or integration endpoints that require API Key authentication. Use @ApiSecurity decorator on all endpoints protected with @ApiKeyAuth for complete API documentation and interactive testing.

### When NOT to use?

Do not expose API Key configuration in public-facing Swagger documentation. Keep API Key protected endpoints in internal documentation only for security purposes to prevent unauthorized access attempts.

### Example

```typescript
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';

// Configure in main.ts
const config = new DocumentBuilder()
  .addApiKey(
    { type: 'apiKey', name: 'X-API-KEY', in: 'header' },
    'api-key',
  )
  .build();

// Use in controller
@ApiSecurity('api-key')
@ApiKeyAuth()
@Post('webhook')
async webhook() {}
```

### Checklist

- [ ] DocumentBuilder configured with addApiKey in main.ts setup
- [ ] Security scheme named 'api-key' for consistency
- [ ] @ApiSecurity('api-key') decorator applied to protected endpoints
- [ ] Swagger UI shows lock icon on API Key protected endpoints
- [ ] Testing API Key input field available in Swagger authorization dialog

### Troubleshooting

**Lock icon not showing**: Ensure @ApiSecurity decorator is applied along with @ApiKeyAuth on controller method.

**Authorization not working in Swagger**: Check security scheme name matches between DocumentBuilder configuration and @ApiSecurity decorator.

**Swagger not recognizing header**: Verify addApiKey configuration specifies correct header name and location (in: 'header').

### Best Practices

- Use consistent security scheme names across all API Key protected endpoints
- Document API Key requirements and how to obtain keys in Swagger description
- Provide example API Key format in Swagger documentation for developers
- Consider separate Swagger instances for internal and external documentation
- Add response examples showing both successful and 401 unauthorized responses

## [Security Best Practices - Generation, Storage, Rotation and Monitoring]()

Recommended practices for secure generation, storage and management of API Keys in production including using cryptographically secure random keys of minimum 32 characters, never committing keys to version control, storing keys only in environment variables, rotating keys periodically especially after suspected compromise, using HTTPS to prevent interception, logging API Key usage for auditing, implementing revocation mechanisms for compromised keys, and applying rate limiting to prevent abuse.

### When to use?

Apply these security practices in all production deployments using API Key authentication. Follow these guidelines when generating, storing, rotating, or revoking API Keys throughout their lifecycle to maintain security posture.

### When NOT to use?

Development and testing environments may use simplified key management for convenience, but production systems must follow all security best practices without exception to protect against unauthorized access and data breaches.

### Example

#### [Security Best Practices]()

1. **Use long random keys**: Minimum 32 characters
2. **Never commit keys to git**: Use .env
3. **Rotate keys periodically**: Especially if leaked
4. **Use HTTPS in production**: Prevents interception
5. **Usage logging**: Record who used and when
6. **Revocation**: Allow disabling compromised keys
7. **Rate limiting**: Prevent abuse

#### [Generate Secure Keys]()

```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Checklist

- [ ] API Keys generated with cryptographically secure random method
- [ ] Keys minimum 32 characters long for adequate entropy
- [ ] Keys stored only in environment variables never in code
- [ ] .env file added to .gitignore to prevent accidental commits
- [ ] HTTPS enforced in production for all API Key authenticated requests
- [ ] API Key usage logged with timestamps for security auditing
- [ ] Rate limiting implemented on API Key endpoints
- [ ] Key rotation procedure documented and tested

### Troubleshooting

**API Key leaked in git history**: Immediately rotate the compromised key. Use git-secrets or similar tools to prevent future leaks and scan repository history.

**Unauthorized API usage**: Check usage logs to identify compromised keys. Revoke affected keys and issue new ones to legitimate clients immediately.

**Rate limit exceeded**: Review rate limit thresholds. Consider per-client rate limiting if using multiple API Keys or implement tiered limits.

### Best Practices

- Rotate API Keys quarterly or immediately upon suspected compromise
- Use separate API Keys for different integration clients for granular revocation
- Implement API Key expiration dates for enhanced security posture
- Monitor API Key usage patterns to detect anomalous behavior
- Document API Key rotation procedures for operational continuity
- Use secrets management systems like HashiCorp Vault in enterprise environments

## [JWT vs API Key - Comparison and Decision Guide]()

Detailed comparison between JWT and API Key authentication methods covering usage scenarios, expiration policies, rotation mechanisms, payload capabilities, revocation complexity, and performance characteristics. JWT is designed for end-user authentication with automatic expiration and user data payload but difficult revocation, while API Key is optimized for service integrations with no expiration, easy revocation through database updates, and faster validation but requiring database lookup for each request.

### When to use?

Reference this comparison when deciding which authentication method to implement for a new feature or integration. Use this table to explain authentication choices to team members or stakeholders during architecture discussions.

### When NOT to use?

This comparison assumes standard implementations. Custom requirements may necessitate different trade-offs not reflected in this general comparison or hybrid approaches combining both methods.

### Example

| Aspect | JWT | API Key |
|---------|-----|---------|
| **Usage** | End users | Integrations |
| **Expiration** | Yes (e.g., 24h) | No |
| **Rotation** | Automatic (relogin) | Manual |
| **Payload** | User data | Just key |
| **Revocation** | Difficult | Easy |
| **Performance** | Validates signature | DB lookup |

### Checklist

- [ ] User-facing features use JWT for authentication with login flow
- [ ] Service integrations use API Key for authentication without user context
- [ ] Webhooks endpoints protected with API Key not JWT
- [ ] Mobile and web apps use JWT for session management
- [ ] Automated scripts and cron jobs use API Key for simplicity

### Troubleshooting

**Choosing between JWT and API Key**: If there is user login flow, use JWT. If service-to-service or automated, use API Key.

**Need both on same endpoint**: Configure endpoint to accept either JWT or API Key by checking req.user presence and adjusting business logic accordingly.

**Performance concerns with API Key**: Implement caching layer for API Key validation to reduce database lookups and improve response times.

### Best Practices

- Use JWT for all user authentication scenarios requiring identity and sessions
- Use API Key for all service-to-service scenarios without user context
- Never use API Key in frontend applications due to exposure risk
- Implement both authentication methods in API for maximum flexibility
- Document clearly which endpoints require which authentication type

## [Common Issues - Debugging API Key Authentication Problems]()

Solutions for common problems when implementing and using API Key authentication including API Key missing error caused by missing X-API-KEY header in request, Invalid API Key error due to incorrect key value or misconfigured environment variable, and conflicts with JWT authentication resolved by proper guard ordering in main.ts. Each problem includes root cause analysis and specific solutions for quick resolution.

### When to use?

Reference this section when debugging API Key authentication errors or investigating integration failures. Use these solutions as first-line troubleshooting steps before deeper investigation into custom business logic.

### When NOT to use?

These solutions address common implementation issues. Complex custom authentication logic may require different debugging approaches not covered here or advanced troubleshooting with logging and monitoring tools.

### Example

#### [Error: "API Key missing"]()

**Cause**: Header `X-API-KEY` not sent

**Solution**: Add header to request

#### [Error: "Invalid API Key"]()

**Cause**: Incorrect key or not configured

**Solution**: Check `.env` and sent value

#### [Conflict with JWT]()

If endpoint accepts both, configure guard order:

```typescript
// Try JWT first, then API Key
app.useGlobalGuards(
  new JwtAuthGuard(reflector),
  new ApiKeyAuthGuard(configService, reflector),
);
```

### Checklist

- [ ] X-API-KEY header spelled exactly correctly in requests
- [ ] Environment variable X_API_KEY set in server .env file
- [ ] API Key value has no leading or trailing whitespace
- [ ] Guard order in main.ts allows both JWT and API Key authentication
- [ ] @Public decorator applied to endpoints requiring only API Key

### Troubleshooting

**Intermittent authentication failures**: Check if environment variables are loaded correctly in all application instances. Verify load balancer configuration for header forwarding.

**Works locally but fails in production**: Ensure production environment variables are configured correctly. Check deployment scripts copy .env file properly or use secrets management.

**Authentication passes but business logic fails**: Verify req.user is checked for undefined when using API Key authentication without user context.

### Best Practices

- Test API Key authentication in isolation before combining with JWT
- Use consistent error messages for security (don't reveal if key exists)
- Implement comprehensive logging for authentication failures with context
- Create integration tests covering both JWT and API Key authentication paths
- Document expected behavior when both authentication methods are present

## [References]()

- [API Key Best Practices](https://cloud.google.com/endpoints/docs/openapi/when-why-api-key)
- [NestJS Guards](https://docs.nestjs.com/guards)
