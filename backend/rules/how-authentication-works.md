# [How Authentication Works]()

Complete guide explaining JWT-based authentication system, token validation, user isolation, and secure request handling in the project.

## [JWT-Based Authentication System Overview]()

The project implements JWT-based authentication providing secure, stateless user verification with automatic token refresh, global route protection via opt-out decorators, and complete data isolation ensuring users can only access their own resources.

### When to use?

Use JWT authentication for all user-facing applications including web frontends, mobile apps, and single-page applications where users need to login with credentials. Apply this pattern when you need stateless authentication with automatic session management and user identity tracking across requests.

### When NOT to use?

Do not use JWT for service-to-service integrations, webhooks, or automated scripts where there is no end-user login flow. For these scenarios, use API Key authentication instead. Avoid JWT for public endpoints that should be accessible without authentication.

### Checklist

- [ ] User entity with email, passwordHash, and active fields properly configured
- [ ] JWT_SECRET and JWT_EXPIRATION environment variables set in .env file
- [ ] JWT Strategy validates token and checks user active status
- [ ] Local Strategy validates login credentials with bcrypt comparison
- [ ] Auth Service implements signup, login, and validateUser methods
- [ ] Auth Controller exposes public /login and /signup endpoints
- [ ] Global JwtAuthGuard registered in main.ts with Reflector
- [ ] Public decorator applied to login and signup routes

### Troubleshooting

**401 Unauthorized errors**: Check if token is being sent in Authorization header with Bearer prefix. Verify JWT_SECRET matches between signup and validation. Ensure user account is active in database.

**Token expired errors**: User needs to login again to get a new token. Consider implementing refresh token mechanism for better UX.

**Password validation failing**: Ensure bcrypt is used for both hashing during signup and comparison during login. Check password is not being hashed twice.

### Best Practices

- Use bcrypt with salt rounds of 10 or higher for password hashing security
- Set appropriate JWT expiration times balancing security and user experience
- Never expose passwordHash in API responses by using @Exclude decorator
- Implement global guards with opt-out pattern using Public decorator for better security
- Always filter database queries by userId to ensure data isolation between users

## [Authentication Flow - From Signup to Authorized Requests]()

Step-by-step authentication process from user signup through credential validation to JWT token generation and verification. The flow ensures secure password hashing, token-based session management, and automatic user data injection into request context for authorization.

### When to use?

Follow this flow for implementing complete authentication lifecycle in new applications or when adding authentication to existing projects. Use this sequence to understand request/response patterns for signup, login, and authenticated endpoint access.

### When NOT to use?

This flow does not apply to public endpoints marked with @Public decorator, API Key authenticated endpoints, or server-to-server communications that bypass user authentication entirely.

### Example

Complete authentication lifecycle from registration to resource access:

```
1. User signs up → Hash password → Save in DB
2. User logs in → Validate credentials → Generate JWT
3. Client stores token → Send in all requests
4. Backend validates token → Extract userId → Authorize access
```

### Checklist

- [ ] Signup endpoint hashes password with bcrypt before saving to database
- [ ] Login endpoint validates credentials and returns JWT token with user data
- [ ] Frontend stores JWT token in localStorage or secure cookie
- [ ] Frontend includes Authorization Bearer token in all authenticated requests
- [ ] Backend validates JWT on each request and injects user data into req.user
- [ ] Expired tokens trigger 401 response and redirect to login

### Troubleshooting

**Signup fails with duplicate key error**: Email already exists in database. Return user-friendly error message about duplicate email.

**Login returns 401 even with correct password**: Check if user.active is false in database. Inactive users should not be able to login.

**Token validation fails intermittently**: Ensure JWT_SECRET is consistent across all application instances and not changing between deployments.

### Best Practices

- Return user data along with access_token in login response for immediate use
- Implement token expiration handling on frontend with automatic redirect to login
- Use HTTPS in production to prevent token interception during transmission
- Consider implementing refresh token mechanism for improved user experience

## [Core Authentication Components - Entities, Strategies, and Services]()

Core architectural components implementing authentication including User entity, JWT strategy for token validation, Local strategy for login, Auth service for credential verification, and Auth controller exposing public endpoints. Each component has specific responsibilities following separation of concerns.

### When to use?

Use these components as architectural foundation when implementing JWT authentication in NestJS applications. Follow this structure to maintain clean separation between authentication concerns and enforce security best practices through proper layering.

### When NOT to use?

Do not use this exact structure for applications requiring different authentication mechanisms like OAuth, SAML, or custom token systems. These components are specifically designed for JWT-based password authentication with Passport.js integration.

### Example

User Entity - Database representation with security measures:

```typescript
@Entity('users')
export class User extends SuperEntity {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  @Exclude() // Never return to client
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;
}
```

JWT Strategy - Token validation on each authenticated request:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Validate if user still exists and is active
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, active: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Return data that will be injected into req.user
    return {
      userId: user.id,
      email: user.email
    };
  }
}
```

Local Strategy - Login credential validation:

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
```

Auth Service - Business logic for authentication operations:

```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Validate credentials
  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !user.active) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  // Generate JWT token
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // Register new user
  async signup(signupDto: SignupDto) {
    // Hash password
    const passwordHash = await bcrypt.hash(signupDto.password, 10);

    const user = this.userRepository.create({
      email: signupDto.email,
      name: signupDto.fullName,
      passwordHash,
    });

    await this.userRepository.save(user);

    const { passwordHash: _, ...result } = user;
    return result;
  }
}
```

Auth Controller - Public endpoints for authentication:

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Public route
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('me')
  async getProfile(@Request() req) {
    return req.user; // Logged user data
  }
}
```

### Checklist

- [ ] User entity extends SuperEntity for common fields like id and timestamps
- [ ] passwordHash column uses @Exclude decorator to prevent exposure in API responses
- [ ] JWT Strategy validates user exists and is active before injecting into request
- [ ] Local Strategy delegates credential validation to Auth Service
- [ ] Auth Service separates concerns: validateUser, login, and signup
- [ ] Auth Controller marks public endpoints with @Public decorator
- [ ] All password operations use bcrypt with appropriate salt rounds

### Troubleshooting

**JwtStrategy not found error**: Ensure JWT Strategy is registered in auth module providers and JWT module is properly configured with secret and expiration.

**Circular dependency between AuthService and UserService**: Keep user validation logic in Auth Service and avoid importing user business logic. Use repository directly in Auth Service.

**PasswordHash exposed in API response**: Verify @Exclude decorator is applied and ClassSerializerInterceptor is enabled globally or on controller.

### Best Practices

- Keep strategies focused on authentication logic only, delegate business rules to services
- Use ConfigService to inject environment variables instead of hardcoding secrets
- Implement separate DTOs for signup and login with appropriate validation rules
- Store lastLoginAt timestamp for security auditing and inactive user detection
- Use TypeORM transactions for signup operations to ensure data consistency

## [Global Route Protection with JWT Guards and Public Decorator]()

Global guard implementation using NestJS guard system with JWT validation and Public decorator for opt-out pattern. Guards intercept every request to verify authentication tokens before allowing access to protected routes, ensuring application-wide security by default.

### When to use?

Implement global JWT guard when you want secure-by-default architecture where all routes require authentication unless explicitly marked public. This pattern is ideal for applications where most endpoints need protection and only a few are public.

### When NOT to use?

Do not use global guards for applications where most endpoints are public or when you need different authentication strategies for different route groups. For these cases, apply guards selectively at controller or route level instead.

### Example

JWT Auth Guard with Public decorator support:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true; // Allow access
    }

    // Validate JWT
    return super.canActivate(context);
  }
}
```

Global registration in main.ts:

```typescript
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

Public decorator for opt-out pattern:

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Usage on public routes:

```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // Public route, doesn't require JWT
}
```

### Checklist

- [ ] JwtAuthGuard extends AuthGuard('jwt') from @nestjs/passport
- [ ] Guard constructor injects Reflector for metadata checking
- [ ] canActivate method checks for IS_PUBLIC_KEY metadata before validation
- [ ] Global guard registered in main.ts using app.useGlobalGuards
- [ ] Public decorator defined using SetMetadata with consistent key
- [ ] Login and signup endpoints marked with @Public decorator

### Troubleshooting

**All routes return 401 including login**: Ensure login and signup routes have @Public decorator applied. Verify global guard is checking metadata correctly.

**Public decorator not working**: Check that Reflector is injected into guard constructor and getAllAndOverride is called with both handler and class contexts.

**Guard not executing for some routes**: Verify global guard is registered in main.ts after NestJS application instance is created but before listening.

### Best Practices

- Use secure-by-default pattern with global guards for better security posture
- Apply @Public decorator sparingly and review public endpoints regularly
- Register global guards in main.ts for consistent application-wide enforcement
- Consider creating custom decorators like @Roles for additional authorization layers
- Use Reflector.getAllAndOverride to check metadata at both method and class levels

## [Accessing Authenticated User Data in Controllers and Services]()

Practical patterns for accessing authenticated user data in controllers and services using Request object injection. The framework automatically injects user information after successful JWT validation, enabling secure data isolation and user-specific operations throughout the application.

### When to use?

Access req.user in controllers whenever you need to identify which user is making the request for data isolation, authorization checks, or audit logging. Use this pattern in all protected endpoints that require user-specific operations.

### When NOT to use?

Do not access req.user in public endpoints marked with @Public decorator as it will be undefined. Do not use req.user for API Key authenticated endpoints where user context may not exist.

### Example

Accessing logged user in controller methods:

```typescript
@Controller('products')
export class ProductController {
  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId; // Logged user ID
    return this.productService.findAll(userId);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @Request() req) {
    return this.productService.create(dto, req.user.userId);
  }
}
```

Request user object structure after JWT validation:

```typescript
{
  userId: number,
  email: string
}
```

### Checklist

- [ ] Controller method includes @Request() req parameter to access user data
- [ ] Pass req.user.userId to service methods for data filtering
- [ ] Validate user ownership before update or delete operations
- [ ] Use req.user for audit logging of user actions

### Troubleshooting

**req.user is undefined**: Endpoint may be marked as @Public or JWT validation failed. Check if token is being sent correctly.

**TypeScript errors with req.user**: Create a proper type definition extending Request interface with user property.

### Best Practices

- Always pass userId to service methods explicitly rather than passing entire req object
- Create custom decorators like @CurrentUser() to extract user data cleanly
- Validate resource ownership in service layer before performing operations
- Use req.user.userId for all database queries to enforce data isolation

## [Multi-Tenant Data Isolation - Filtering All Queries by User]()

Critical security pattern ensuring all database queries are filtered by authenticated userId to prevent unauthorized data access. This isolation layer guarantees users can only view, modify, or delete their own resources, implementing proper multi-tenant security architecture.

### When to use?

Implement data isolation in all service methods that access user-specific resources to prevent unauthorized cross-user data access. Apply this pattern in multi-tenant applications where each user should only see their own data.

### When NOT to use?

Do not apply user filtering to admin endpoints that need to access all users' data, or to shared resources that are intentionally accessible across users. Public data that is not user-specific does not require userId filtering.

### Example

Service implementation with comprehensive userId filtering:

```typescript
@Injectable()
export class ProductService {
  async findAll(userId: number) {
    return await this.repository.find({
      where: { userId }, // Filter by user
    });
  }

  async findOne(id: number, userId: number) {
    const product = await this.repository.findOne({
      where: { id, userId }, // Ensure it belongs to user
    });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  async update(id: number, dto: any, userId: number) {
    // Validate ownership first
    const product = await this.findOne(id, userId);

    Object.assign(product, dto);
    return await this.repository.save(product);
  }
}
```

### Checklist

- [ ] All find operations include userId in where clause
- [ ] Update operations validate ownership before modifying data
- [ ] Delete operations confirm user owns the resource being deleted
- [ ] Service methods accept userId as parameter from controller
- [ ] Related entities are filtered by userId through proper joins

### Troubleshooting

**User can see other users' data**: Missing userId filter in repository query. Always include userId in where clause.

**404 errors for valid resources**: User trying to access resource that belongs to another user. This is correct behavior for data isolation.

**Performance issues with userId filtering**: Ensure database index exists on userId column for efficient queries.

### Best Practices

- Always validate ownership before update or delete operations to prevent unauthorized modifications
- Include userId in all database indexes for columns frequently queried together
- Create custom repository methods that automatically include userId filtering
- Use TypeORM query builder with andWhere for complex queries requiring userId filtering
- Throw NotFoundException instead of Unauthorized when resource not found for user to avoid information disclosure

## [Complete HTTP Request Examples - Signup, Login, and Authenticated Access]()

End-to-end HTTP request examples demonstrating signup, login, and authenticated requests with real payloads and responses. These examples show proper header formatting, token usage, and expected response structures for successful authentication workflows.

### When to use?

Use these request examples as reference when implementing frontend authentication, testing API endpoints with cURL or Postman, or documenting API authentication for external developers. Follow these patterns for consistent authentication implementation.

### When NOT to use?

These examples are specific to username/password authentication. Do not use these exact patterns for OAuth flows, API key authentication, or other authentication mechanisms that require different request structures.

### Example

Signup request creating new user account:

**Request**:
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Silva"
}
```

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Silva"
}
```

Login request obtaining JWT access token:

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Silva"
  }
}
```

Authenticated request using JWT bearer token:

**Request**:
```http
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Product 1",
    "userId": 1
  }
]
```

### Checklist

- [ ] Signup request includes email, password, and fullName fields
- [ ] Login response returns both access_token and user object
- [ ] Authenticated requests include Authorization header with Bearer prefix
- [ ] Token is placed after "Bearer " with single space separator
- [ ] Password is never returned in any response payloads

### Troubleshooting

**401 Unauthorized on authenticated requests**: Verify Authorization header includes "Bearer " prefix with space. Check token is not expired and JWT_SECRET is correct.

**Token string contains "undefined"**: Frontend is not correctly extracting access_token from login response. Verify response structure and token storage logic.

**CORS errors when sending Authorization header**: Ensure backend CORS configuration allows Authorization header in allowed headers list.

### Best Practices

- Always use HTTPS in production to protect tokens during transmission
- Store access_token separately from user data for easier token management
- Set appropriate Content-Type headers for JSON payloads
- Implement token refresh before expiration to maintain seamless user experience
- Never log or expose full JWT tokens in application logs or error messages

## [Frontend JWT Implementation - Token Storage and Request Interceptors]()

Frontend integration guide covering token storage, automatic token injection via Axios interceptors, error handling for expired tokens, and protected route implementation with React Router. These patterns ensure seamless client-side authentication experience.

### When to use?

Implement these frontend patterns in React applications consuming JWT-authenticated APIs. Use Axios interceptors for automatic token injection in all requests and protected routes for securing authenticated pages.

### When NOT to use?

Do not store JWT tokens in localStorage for highly sensitive applications requiring enhanced security. Consider secure HTTP-only cookies instead. These patterns are specific to React Router and Axios; adapt for other frameworks.

### Example

Storing token after successful login:

```typescript
// Save to localStorage
localStorage.setItem('token', response.access_token);
localStorage.setItem('user', JSON.stringify(response.user));
```

Axios configuration with automatic token injection:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Invalid/expired token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

> **🚨 CRITICAL - API VERSIONING**: The `baseURL` should NOT include the API version. The version (`v1`, `v2`, etc.) must be specified in each service method individually. Example: `api.get('/v1/auth/login')`. See [how-to-consume-api-frontend.md](./how-to-consume-api-frontend.md) for details.

Protected route component for React Router:

```typescript
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Usage
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

### Checklist

- [ ] Axios instance configured with baseURL from environment variable (WITHOUT version)
- [ ] Request interceptor adds Authorization Bearer token to all requests
- [ ] Response interceptor handles 401 errors by clearing token and redirecting
- [ ] Login response stores both access_token and user data in localStorage
- [ ] PrivateRoute component checks for token before rendering protected pages
- [ ] Logout function clears token from localStorage and redirects to login
- [ ] Services include version in each endpoint path (`/v1/auth/login`, etc.)

### Troubleshooting

**Token not being sent in requests**: Check if Axios interceptor is registered before making API calls. Verify token is stored correctly in localStorage.

**Infinite redirect loop on login page**: PrivateRoute should not wrap the login page itself. Only protect authenticated routes.

**401 errors after token expires**: Implement token refresh mechanism or show user-friendly message to login again.

### Best Practices

- Clear token and user data immediately on 401 response to prevent stale authentication state
- Use environment variables for API URL to support different environments
- Implement loading state while checking authentication in PrivateRoute
- Consider using React Context for sharing authentication state across components
- Add token expiration check on frontend before making requests to improve UX

## [Environment Variables Configuration for JWT Authentication]()

Required environment configuration for JWT authentication including secret key generation, token expiration settings, and security best practices. Proper environment variable management is critical for production security and token validation consistency.

### When to use?

Configure these environment variables in all environments (development, staging, production) where the application runs. Set different JWT_SECRET values per environment to prevent token reuse across environments.

### When NOT to use?

Do not use the same JWT_SECRET across multiple environments. Do not commit .env files containing real secrets to version control. These settings are specific to JWT authentication and not needed for API key or OAuth flows.

### Example

Environment variables configuration in .env file:

```env
JWT_SECRET=your-secret-key-here-minimum-32-characters
JWT_EXPIRATION=24h
```

### Checklist

- [ ] JWT_SECRET is at least 32 characters long using random alphanumeric characters
- [ ] JWT_EXPIRATION is set to appropriate duration balancing security and UX
- [ ] .env file is added to .gitignore to prevent committing secrets
- [ ] Production environment uses different JWT_SECRET than development
- [ ] Environment variables are properly loaded in ConfigModule

### Troubleshooting

**Token validation fails across environments**: Ensure JWT_SECRET is consistent within each environment but different between environments.

**Environment variables not loading**: Verify .env file is in correct location and ConfigModule is properly configured in app.module.ts.

### Best Practices

- Use long and random key in production generated by cryptographically secure random generator
- Never commit .env to git or share secrets in documentation or chat
- Rotate JWT_SECRET periodically and implement graceful token migration strategy
- Use shorter expiration times for sensitive applications requiring higher security
- Store secrets in secure vault services like AWS Secrets Manager for production environments

## [Security Best Practices and Potential Improvements]()

Comprehensive security measures implemented including bcrypt password hashing, token expiration, active user validation, data isolation by userId, and password exclusion from responses. Additional improvements like refresh tokens and rate limiting are discussed for enhanced protection.

### When to use?

Apply these security practices in all authentication implementations to protect user data and prevent common attack vectors. Implement additional improvements based on application security requirements and threat model.

### When NOT to use?

These practices are specific to JWT-based password authentication. Different authentication mechanisms may require different security measures. Not all improvements are necessary for every application; prioritize based on risk assessment.

### Example

Implemented security best practices:

1. **Password hashed with bcrypt**: Never save plain text password
2. **Token with expiration**: 24h by default
3. **Active user validation**: Check on each request
4. **Data isolation**: Filtering by userId
5. **@Exclude on passwordHash**: Never return password to client
6. **Global guard**: All routes protected by default

Potential security improvements:

- [ ] Refresh tokens for automatic renewal
- [ ] Rate limiting on /login
- [ ] Token blacklist (real logout)
- [ ] 2FA (two-factor authentication)
- [ ] OAuth (Google, GitHub, etc)

### Checklist

- [ ] All passwords hashed with bcrypt using salt rounds of 10 or higher
- [ ] JWT tokens include expiration claim and are validated on each request
- [ ] User active status checked during both login and token validation
- [ ] All database queries filtered by userId to prevent data leakage
- [ ] passwordHash field excluded from all API responses using @Exclude
- [ ] Global JwtAuthGuard ensures all routes require authentication by default

### Troubleshooting

**Security audit flags weak password hashing**: Verify bcrypt is used with appropriate salt rounds. Do not use MD5, SHA1, or other weak hashing algorithms.

**Token reuse after logout**: Implement token blacklist or short expiration times to minimize impact of logout without invalidation.

**Brute force attacks on login endpoint**: Add rate limiting middleware to restrict login attempts per IP address.

### Best Practices

- Use bcrypt for password hashing with salt rounds appropriate for current hardware capabilities
- Implement short JWT expiration times combined with refresh token mechanism
- Validate user account status on every request to enable immediate access revocation
- Apply @Exclude decorator on sensitive fields and use ClassSerializerInterceptor globally
- Monitor failed login attempts and implement account lockout after threshold exceeded
- Consider implementing 2FA for sensitive applications requiring additional security layer

## [Common Troubleshooting Scenarios and Solutions]()

Common authentication error scenarios and solutions including invalid tokens, disabled users, missing authorization headers, and proper token format. These troubleshooting patterns help diagnose and resolve authentication failures quickly.

### When to use?

Reference these troubleshooting scenarios when debugging authentication failures, investigating 401 errors, or helping users resolve login issues. Use these patterns to quickly identify common configuration mistakes.

### When NOT to use?

These scenarios cover standard JWT authentication errors. For custom authentication implementations or different error codes (403, 500), additional troubleshooting steps may be required beyond these common patterns.

### Example

Invalid or expired token error:

**Error**: `401 Unauthorized`
**Solution**: Login again to obtain fresh token

Disabled user account:

**Error**: `401 Unauthorized`
**Cause**: Field `active = false` in database
**Solution**: Verify user account status and reactivate if needed

Token not sent in request:

**Error**: `401 Unauthorized`
**Cause**: Authorization header missing or malformed
**Correct format**: `Authorization: Bearer <token>`

### Checklist

- [ ] Verify Authorization header includes "Bearer " prefix with proper spacing
- [ ] Check if user account has active status set to true in database
- [ ] Confirm JWT_SECRET matches between token generation and validation
- [ ] Validate token has not exceeded expiration time configured in JWT_EXPIRATION
- [ ] Ensure token is being sent from frontend in correct header format

### Troubleshooting

**Intermittent 401 errors**: Check for JWT_SECRET inconsistency across application instances or deployment environments.

**401 immediately after successful login**: Frontend may not be storing or sending token correctly. Verify localStorage and Axios interceptor configuration.

**401 for specific users only**: Check if those users have active field set to false or were deleted from database.

### Best Practices

- Return user-friendly error messages that don't expose internal system details
- Log authentication failures with sufficient context for security auditing
- Implement monitoring alerts for unusual patterns of authentication failures
- Provide clear error responses distinguishing between invalid credentials and expired tokens
- Use consistent error response structure across all authentication endpoints

## [External References and Documentation]()

External documentation links for JWT specification, Passport.js authentication middleware, and NestJS security guidelines. These resources provide deeper understanding of authentication concepts and implementation patterns used in the project.

### When to use?

Consult these references when you need deeper understanding of JWT concepts, Passport.js strategy implementation details, or NestJS authentication best practices. Use these resources for troubleshooting complex authentication issues.

### When NOT to use?

These external references provide general authentication knowledge. For project-specific implementation details, consult this documentation file instead. External documentation may show different patterns than those adopted in this project.

### Example

Key documentation resources:

- [JWT.io](https://jwt.io) - JWT specification, debugger, and library recommendations
- [Passport.js Documentation](https://www.passportjs.org) - Authentication middleware and strategy guides
- [NestJS Authentication](https://docs.nestjs.com/security/authentication) - Official NestJS security and authentication guide

### Checklist

- [ ] Review JWT.io for understanding token structure and payload claims
- [ ] Consult Passport.js docs when implementing custom authentication strategies
- [ ] Reference NestJS authentication guide for framework-specific best practices
- [ ] Verify library versions match documentation being referenced

### Troubleshooting

**Passport strategy not working as documented**: Check Passport.js and @nestjs/passport version compatibility. Some features may require specific versions.

**NestJS authentication guide shows different patterns**: Official docs may be updated for newer versions. Verify you're viewing docs for the NestJS version used in project.

### Best Practices

- Bookmark official documentation for quick reference during development
- Check documentation version to ensure it matches libraries used in project
- Use JWT.io debugger to decode and verify token structure during development
- Follow NestJS security recommendations for production deployments
- Stay updated on security advisories for Passport.js and JWT libraries used
