# [How to Integrate External APIs in Backend]()

Complete guide on consuming external APIs in NestJS backend using Axios including HTTP client configuration, authentication methods, retry logic, and error handling.

## [HTTP Client Service - Axios Configuration and Interceptors]()

Centralized HTTP client service using Axios providing reusable instance with timeout configuration, request and response interceptors for comprehensive logging, detailed error handling distinguishing AxiosError types, and convenience methods for all HTTP verbs enabling consistent communication across external API integrations.

### When to use?

Use this HTTP client service for all external API integrations requiring HTTP communication including REST API consumption, third-party service integration, data provider connections, or any external HTTP endpoint access where you need centralized configuration, logging, and error handling capabilities.

### When NOT to use?

Do not use for internal microservice communication where NestJS built-in HttpModule is preferred, do not use for GraphQL clients where Apollo Client is more appropriate, and avoid for WebSocket connections requiring different protocol handling outside standard HTTP scope.

### Example

**Install Axios:**

```bash
npm install axios
```

**HTTP Module:**

File: `src/common/http/http.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HttpService } from './http.service';

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
```

**Base HTTP Service:**

File: `src/common/http/http.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`[${config.method?.toUpperCase()}] ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `[${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`,
        );
        return response;
      },
      (error: AxiosError) => {
        this.logError(error);
        return Promise.reject(error);
      },
    );
  }

  private logError(error: AxiosError) {
    if (error.response) {
      this.logger.error(
        `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`,
      );
      this.logger.error('Response data:', error.response.data);
    } else if (error.request) {
      this.logger.error('No response received:', error.message);
    } else {
      this.logger.error('Request setup error:', error.message);
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}
```

### Checklist

- [ ] Install axios package with `npm install axios`
- [ ] Create HttpModule exporting HttpService for global use
- [ ] Configure axios instance with appropriate timeout (10 seconds default)
- [ ] Implement request interceptor for logging outgoing requests
- [ ] Implement response interceptor for logging responses and errors
- [ ] Create convenience methods for all HTTP verbs (GET POST PUT PATCH DELETE)
- [ ] Add error logging distinguishing response, request, and setup errors
- [ ] Export HttpModule from common folder for reuse across modules

### Troubleshooting

**Problem**: Timeout errors occurring frequently
- **Solution**: Increase timeout value in axios.create config, verify external API performance, consider implementing retry logic

**Problem**: Interceptor logs not appearing
- **Solution**: Check logger configuration in NestJS, verify setupInterceptors is called in constructor, ensure debug level logging is enabled

**Problem**: Type errors with AxiosRequestConfig
- **Solution**: Install @types/axios if not present, verify axios version compatibility with TypeScript version

### Best Practices

- Always configure timeout to prevent hanging requests indefinitely
- Use interceptors for cross-cutting concerns like logging and authentication
- Return response.data directly from convenience methods for cleaner API
- Log all errors with sufficient context for debugging production issues
- Keep HttpService focused on HTTP concerns, delegate business logic to provider services
- Consider creating multiple axios instances for APIs with different requirements

## [Provider Service Architecture - Modular External API Organization]()

Architectural pattern organizing external API integrations using dedicated provider services where each external API has its own service file in module's services folder, orchestrator service coordinates multiple providers implementing fallback patterns, and modular structure enables independent testing and easy addition of new integrations.

### When to use?

Use this modular architecture when integrating multiple external APIs for same business domain, when implementing fallback or redundancy across providers, when each API requires different authentication or configuration, or when you need independent testing and deployment of API integrations enabling clean separation of concerns.

### When NOT to use?

Do not use for single external API integration where simple service suffices, do not create unnecessary abstraction for APIs with identical interfaces, and avoid for tightly coupled integrations where separation adds complexity without benefits or when maintaining multiple providers creates operational overhead.

### Example

**Folder Structure:**

```
src/modules/providers/
├── providers.module.ts
├── providers.service.ts           # Orchestrator
├── providers.controller.ts
└── services/
    ├── yahoo-provider.service.ts  # Yahoo Finance Integration
    ├── kinvo-provider.service.ts  # Kinvo Integration
    └── b3-provider.service.ts     # B3 Integration
```

**Provider Service Example:**

File: `src/modules/providers/services/yahoo-provider.service.ts`

```typescript
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@/common/http/http.service';
import { AxiosError } from 'axios';

interface YahooFinanceQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
}

@Injectable()
export class YahooProviderService {
  private readonly logger = new Logger(YahooProviderService.name);
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>('YAHOO_FINANCE_API_URL');
    this.apiKey = this.configService.get<string>('YAHOO_FINANCE_API_KEY');
  }

  async getQuote(symbol: string): Promise<YahooFinanceQuote> {
    try {
      const url = `${this.baseURL}/quote`;

      const data = await this.httpService.get<{ quoteResponse: { result: YahooFinanceQuote[] } }>(
        url,
        {
          params: { symbols: symbol },
          headers: { 'X-API-Key': this.apiKey },
        },
      );

      if (!data.quoteResponse.result.length) {
        throw new HttpException(
          `Symbol ${symbol} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return data.quoteResponse.result[0];
    } catch (error) {
      this.handleError(error, 'getQuote');
    }
  }

  private handleError(error: any, method: string): never {
    this.logger.error(`Error in ${method}:`, error.message);

    if (error instanceof AxiosError) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        if (status === 401) {
          throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
        }

        if (status === 429) {
          throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        }

        throw new HttpException(`Yahoo Finance API error: ${message}`, status);
      }

      if (error.code === 'ECONNABORTED') {
        throw new HttpException('Request timeout', HttpStatus.REQUEST_TIMEOUT);
      }

      throw new HttpException(
        'Failed to connect to Yahoo Finance',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
```

**Orchestrator Service:**

File: `src/modules/providers/providers.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { YahooProviderService } from './services/yahoo-provider.service';
import { B3ProviderService } from './services/b3-provider.service';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    private readonly yahooProvider: YahooProviderService,
    private readonly b3Provider: B3ProviderService,
  ) {}

  async getQuote(symbol: string): Promise<any> {
    this.logger.log(`Fetching quote for ${symbol}`);

    // Try to fetch from multiple sources (fallback)
    try {
      return await this.yahooProvider.getQuote(symbol);
    } catch (error) {
      this.logger.warn(`Yahoo failed, trying B3...`);

      try {
        return await this.b3Provider.getQuote(symbol);
      } catch (error) {
        this.logger.error(`All providers failed for ${symbol}`);
        throw error;
      }
    }
  }
}
```

### Checklist

- [ ] Create dedicated service file for each external API in services folder
- [ ] Implement provider-specific error handling in each service
- [ ] Use ConfigService to inject API URLs and credentials
- [ ] Create orchestrator service to coordinate multiple providers
- [ ] Implement fallback logic in orchestrator for redundancy
- [ ] Register all provider services in module providers array
- [ ] Export orchestrator service for use by controllers
- [ ] Add comprehensive logging in both provider and orchestrator services

### Troubleshooting

**Problem**: Circular dependency between orchestrator and providers
- **Solution**: Ensure providers don't inject orchestrator, keep dependency flow unidirectional from orchestrator to providers

**Problem**: ConfigService returns undefined for API credentials
- **Solution**: Verify .env file has required variables, check ConfigModule is imported globally, confirm variable names match exactly

**Problem**: Fallback logic never triggers secondary provider
- **Solution**: Ensure try-catch properly surrounds primary provider call, verify error is thrown not swallowed, check logger warns show fallback attempt

### Best Practices

- Keep provider services focused on single external API without cross-provider dependencies
- Use TypeScript interfaces to define expected response structures from each API
- Implement specific error handling for each API's error response format
- Use orchestrator pattern for complex logic coordinating multiple providers
- Log provider selection and fallback attempts for debugging and monitoring
- Consider caching responses at orchestrator level to reduce redundant API calls

## [Authentication Methods - API Key Bearer Token OAuth]()

Implementation of common authentication patterns for external APIs including API Key in custom header, Bearer Token in Authorization header, Basic Authentication with username and password, and complete OAuth 2.0 flow with automatic token refresh and expiration handling ensuring secure authenticated requests.

### When to use?

Use API Key authentication for simple APIs requiring static credentials, Bearer Token for APIs providing JWT or access tokens, Basic Auth for legacy systems requiring username/password, and OAuth 2.0 for APIs requiring dynamic token lifecycle management with refresh capabilities and user context.

### When NOT to use?

Do not use for internal service-to-service communication where mTLS is more appropriate, do not use API keys for user-specific actions requiring user context, and avoid Basic Auth for new integrations as it is less secure than token-based methods lacking encryption without HTTPS.

### Example

**API Key in Header:**

```typescript
await this.httpService.get(url, {
  headers: {
    'X-API-Key': this.apiKey,
  },
});
```

**Bearer Token:**

```typescript
await this.httpService.get(url, {
  headers: {
    Authorization: `Bearer ${this.accessToken}`,
  },
});
```

**Basic Authentication:**

```typescript
await this.httpService.get(url, {
  auth: {
    username: this.username,
    password: this.password,
  },
});
```

**OAuth 2.0 Flow:**

File: `src/modules/integrations/services/oauth-provider.service.ts`

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@/common/http/http.service';

interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class OAuthProviderService {
  private accessToken: string;
  private refreshToken: string;
  private tokenExpiresAt: Date;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(): Promise<void> {
    const tokenUrl = this.configService.get<string>('OAUTH_TOKEN_URL');
    const clientId = this.configService.get<string>('OAUTH_CLIENT_ID');
    const clientSecret = this.configService.get<string>('OAUTH_CLIENT_SECRET');

    try {
      const response = await this.httpService.post<OAuthTokenResponse>(
        tokenUrl,
        {
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.access_token;
      this.refreshToken = response.refresh_token;
      this.tokenExpiresAt = new Date(Date.now() + response.expires_in * 1000);
    } catch (error) {
      throw new HttpException(
        'Failed to authenticate with OAuth provider',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getAccessToken(): Promise<string> {
    // Check if token is expired
    if (!this.accessToken || new Date() >= this.tokenExpiresAt) {
      await this.authenticate();
    }

    return this.accessToken;
  }

  async makeAuthenticatedRequest<T>(url: string): Promise<T> {
    const token = await this.getAccessToken();

    return await this.httpService.get<T>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
```

### Checklist

- [ ] Store API credentials in .env file never in code
- [ ] Use ConfigService to inject credentials into services
- [ ] Implement automatic token refresh for OAuth 2.0 before expiration
- [ ] Handle 401 Unauthorized responses with re-authentication
- [ ] Log authentication attempts and failures for security monitoring
- [ ] Use appropriate Content-Type header for token requests
- [ ] Validate token response structure before storing
- [ ] Implement token storage strategy (in-memory for stateless services)

### Troubleshooting

**Problem**: OAuth token refresh fails continuously
- **Solution**: Verify refresh_token is stored correctly, check token endpoint supports refresh grant type, ensure credentials are valid

**Problem**: API returns 401 even with valid API key
- **Solution**: Verify header name matches API documentation exactly (case-sensitive), check API key is not expired, confirm key has required permissions

**Problem**: Basic Auth not working
- **Solution**: Ensure username and password are URL-encoded if containing special characters, verify API supports Basic Auth scheme

### Best Practices

- Never commit API keys or credentials to version control, always use environment variables
- Implement token pre-emptive refresh before expiration to avoid request failures
- Use separate API keys for development staging and production environments
- Rotate API keys regularly following security best practices
- Log authentication failures for security monitoring and alerting
- Consider using secrets management service like AWS Secrets Manager for production

## [Timeout and Retry - Exponential Backoff Configuration]()

Resilience patterns for HTTP requests including configurable timeout per request preventing hanging connections, automatic retry mechanism using axios-retry library with exponential backoff delay, retry conditions targeting network errors and 5xx server errors, and comprehensive retry logging for monitoring and debugging external API failures.

### When to use?

Use timeout configuration for all external API calls to prevent resource exhaustion, implement retry logic for idempotent operations like GET requests or operations with idempotency keys, and apply exponential backoff for APIs experiencing intermittent failures or rate limiting to give failing servers time to recover.

### When NOT to use?

Do not use retry for non-idempotent operations without idempotency keys, avoid retry for 4xx client errors indicating invalid requests, and do not set timeout too low for APIs with expected slow response times like file uploads or batch processing operations requiring extended processing time.

### Example

**Configure Per-Request Timeout:**

```typescript
await this.httpService.get(url, {
  timeout: 5000, // 5 seconds
});
```

**Implement Retry with axios-retry:**

Install axios-retry:

```bash
npm install axios-retry
```

Update HttpService:

File: `src/common/http/http.service.ts`

```typescript
import axiosRetry from 'axios-retry';

constructor() {
  this.axiosInstance = axios.create({
    timeout: 10000,
  });

  // Configure retry
  axiosRetry(this.axiosInstance, {
    retries: 3, // Number of attempts
    retryDelay: axiosRetry.exponentialDelay, // Exponential delay
    retryCondition: (error) => {
      // Retry on network errors or 5xx
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response?.status >= 500 && error.response?.status < 600)
      );
    },
    onRetry: (retryCount, error, requestConfig) => {
      this.logger.warn(
        `Retry attempt ${retryCount} for ${requestConfig.url}`,
      );
    },
  });

  this.setupInterceptors();
}
```

**Manual Retry with Decorator:**

```typescript
function Retry(maxRetries: number = 3, delayMs: number = 1000) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, delayMs * attempt),
            );
          }
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}

// Usage
@Injectable()
export class ExternalApiService {
  @Retry(3, 1000)
  async fetchData(): Promise<any> {
    return await this.httpService.get('https://api.example.com/data');
  }
}
```

### Checklist

- [ ] Install axios-retry package with `npm install axios-retry`
- [ ] Configure retry in HttpService constructor before interceptors
- [ ] Set appropriate retry count (3 is reasonable default)
- [ ] Use exponential delay to avoid overwhelming failing servers
- [ ] Configure retry condition to target network and 5xx errors only
- [ ] Implement onRetry callback for logging retry attempts
- [ ] Set timeout appropriate for API's expected response time
- [ ] Document retry behavior in service documentation

### Troubleshooting

**Problem**: Requests take too long even with timeout configured
- **Solution**: Verify axios-retry is not multiplying timeout by retry count, check total time = timeout × retries, consider reducing either value

**Problem**: Retry happens for 4xx client errors
- **Solution**: Review retryCondition logic to exclude 4xx status codes, use isNetworkOrIdempotentRequestError for safe defaults

**Problem**: Exponential backoff delay too aggressive
- **Solution**: Implement custom retry delay function with maximum backoff cap, consider linear or polynomial backoff for gentler progression

### Best Practices

- Set timeout based on API SLA and expected response times from documentation
- Use exponential backoff to give failing servers time to recover
- Only retry idempotent operations or operations with idempotency keys
- Log retry attempts with request details for debugging production issues
- Monitor retry rates to detect degraded external API performance early
- Consider implementing maximum backoff cap to prevent excessive delays

## [Circuit Breaker Pattern - Preventing Cascading Failures]()

Circuit breaker implementation protecting application from cascading failures by tracking consecutive failures, transitioning between CLOSED OPEN and HALF_OPEN states, preventing requests during open state timeout period, allowing limited test requests in half-open state, and automatically recovering when external API health improves.

### When to use?

Use circuit breaker for critical external APIs where failures impact application availability, when external API has history of instability or downtime, when you need to fail fast instead of waiting for timeouts, or when preventing resource exhaustion during external dependency failures protecting system resources.

### When NOT to use?

Do not use for non-critical integrations where failures are acceptable, avoid for APIs with consistent high availability exceeding 99.9%, and skip for one-off integration tests or development environments where complexity outweighs benefits and simpler error handling suffices.

### Example

```typescript
import { Injectable, Logger } from '@nestjs/common';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt: Date = new Date();

  private readonly threshold = 5; // Failures before opening
  private readonly timeout = 60000; // 1 minute
  private readonly halfOpenRequests = 3; // Requests in half-open

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (new Date() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }

      this.state = CircuitState.HALF_OPEN;
      this.logger.warn('Circuit breaker is now HALF_OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.halfOpenRequests) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        this.logger.log('Circuit breaker is now CLOSED');
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = new Date(Date.now() + this.timeout);
      this.logger.error(
        `Circuit breaker is now OPEN until ${this.nextAttempt.toISOString()}`,
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Usage
@Injectable()
export class ExternalApiService {
  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<any> {
    return await this.circuitBreaker.execute(() =>
      this.httpService.get('https://api.example.com/data'),
    );
  }
}
```

### Checklist

- [ ] Create CircuitBreakerService as injectable provider
- [ ] Configure failure threshold appropriate for API stability (5 is reasonable)
- [ ] Set timeout duration for open state (60 seconds typical)
- [ ] Define half-open test request count (3 recommended)
- [ ] Implement state transition logging for monitoring
- [ ] Wrap external API calls with circuit breaker execute method
- [ ] Expose getState method for health check endpoints
- [ ] Consider per-API circuit breaker instances for isolation

### Troubleshooting

**Problem**: Circuit opens too frequently
- **Solution**: Increase failure threshold or timeout duration, verify external API is genuinely unstable not misconfigured client

**Problem**: Circuit never transitions to half-open
- **Solution**: Check timeout duration is not too long, verify nextAttempt timestamp is set correctly, ensure no timezone issues

**Problem**: Application hangs when circuit is open
- **Solution**: Ensure circuit throws error immediately when open, implement graceful degradation or fallback logic for open state

### Best Practices

- Configure threshold based on acceptable failure rate for specific API
- Set timeout to balance recovery time against user impact
- Log all state transitions for monitoring and alerting
- Expose circuit state in health check endpoints for observability
- Implement fallback logic for when circuit is open (cached data, default values)
- Consider using separate circuit breaker instances for different APIs
- Monitor circuit breaker state changes as leading indicator of external API health

## [Caching External API Responses - Redis Integration]()

Cache strategies for reducing latency and external API costs using cache-aside pattern checking cache before making requests, in-memory caching for simple scenarios, Redis integration for production distributed cache, configurable TTL for different data staleness requirements, and automatic cache population on miss.

### When to use?

Use caching for expensive external API calls with predictable data, when API has rate limits or usage costs, for data that changes infrequently and can tolerate some staleness, or when reducing response latency is critical for user experience enabling faster responses and reduced external dependency.

### When NOT to use?

Do not cache for real-time data requiring absolute freshness, avoid for user-specific sensitive data unless properly isolated, skip for APIs with aggressive rate limits where caching is insufficient, and do not cache for one-off requests with unique parameters where cache hit rate would be extremely low.

### Example

**Simple In-Memory Cache:**

```typescript
import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
    this.logger.debug(`Cached data for key: ${key}`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired for key: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit for key: ${key}`);
    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }
}

// Usage
@Injectable()
export class YahooProviderService {
  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
  ) {}

  async getQuote(symbol: string): Promise<any> {
    const cacheKey = `quote:${symbol}`;

    // Try to fetch from cache
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.httpService.get(`/quote?symbol=${symbol}`);

    // Save to cache for 5 minutes
    this.cacheService.set(cacheKey, data, 300);

    return data;
  }
}
```

**Redis Cache (Recommended for Production):**

See [how-to-use-redis-backend.md](./how-to-use-redis-backend.md) for complete Redis configuration.

Quick example:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class YahooProviderService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async getQuote(symbol: string): Promise<any> {
    const cacheKey = `cache:api:yahoo:quote:${symbol}`;

    // Fetch from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const data = await this.httpService.get(`/quote?symbol=${symbol}`);

    // Save to cache (TTL: 5 minutes)
    await this.cacheManager.set(cacheKey, data, 300);

    return data;
  }
}
```

### Checklist

- [ ] Identify cacheable endpoints with infrequent data changes
- [ ] Define appropriate TTL based on data staleness tolerance
- [ ] Implement cache key strategy with namespacing (e.g., `cache:api:provider:method:param`)
- [ ] Check cache before making external API call
- [ ] Populate cache after successful API response
- [ ] Handle cache misses gracefully without errors
- [ ] Consider cache invalidation strategy for data updates
- [ ] Monitor cache hit rate to optimize TTL and coverage

### Troubleshooting

**Problem**: Cache hit rate very low
- **Solution**: Increase TTL if data staleness acceptable, verify cache keys are consistent, check cache is not filling up and evicting entries

**Problem**: Stale data served from cache
- **Solution**: Reduce TTL for fresher data, implement cache invalidation on data updates, consider using cache headers from API response

**Problem**: Memory usage grows indefinitely with in-memory cache
- **Solution**: Implement LRU eviction policy, switch to Redis for bounded memory usage, add maximum cache size limit

### Best Practices

- Use Redis for production distributed caching across multiple instances
- Namespace cache keys to avoid collisions between different data types
- Set TTL appropriate for data freshness requirements balancing staleness and API calls
- Implement cache warming for frequently accessed data
- Monitor cache hit rate and adjust strategy based on metrics
- Consider using ETag or Last-Modified headers for conditional requests
- Document cache behavior including TTL and invalidation strategy

## [Rate Limiting Detection - Throttling and Backoff Strategies]()

Strategies for respecting external API rate limits including detecting 429 Too Many Requests responses, parsing Retry-After header for backoff timing, tracking rate limit reset timestamp, implementing local throttle service limiting concurrent requests and adding delay between requests, preventing rate limit violations through proactive throttling.

### When to use?

Use rate limit detection when external API returns 429 errors, implement throttling when API documentation specifies request rate limits, apply local limiting when making bulk requests to external APIs, or when you need to stay within API quotas to avoid service degradation or cost penalties.

### When NOT to use?

Do not implement throttling for APIs without documented rate limits, avoid for APIs with generous limits far exceeding your usage, skip local throttling when external API handles queuing server-side, and do not add artificial delays without measuring actual rate limit issues causing unnecessary performance degradation.

### Example

**Detect and Handle 429 Too Many Requests:**

```typescript
@Injectable()
export class ExternalApiService {
  private rateLimitResetAt: Date | null = null;

  async makeRequest<T>(url: string): Promise<T> {
    // Check if in rate limit
    if (this.rateLimitResetAt && new Date() < this.rateLimitResetAt) {
      const waitSeconds = Math.ceil(
        (this.rateLimitResetAt.getTime() - Date.now()) / 1000,
      );
      throw new HttpException(
        `Rate limit active. Retry after ${waitSeconds} seconds`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      return await this.httpService.get<T>(url);
    } catch (error) {
      if (error.response?.status === 429) {
        // Read retry header
        const retryAfter = error.response.headers['retry-after'];

        if (retryAfter) {
          const retrySeconds = parseInt(retryAfter, 10);
          this.rateLimitResetAt = new Date(Date.now() + retrySeconds * 1000);
        }
      }

      throw error;
    }
  }
}
```

**Local Rate Limiting (Throttle Service):**

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottleService {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private readonly maxConcurrent = 5;
  private readonly delayMs = 1000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.running++;

    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
  }
}

// Usage
@Injectable()
export class ExternalApiService {
  constructor(
    private readonly throttle: ThrottleService,
    private readonly httpService: HttpService,
  ) {}

  async fetchMultipleSymbols(symbols: string[]): Promise<any[]> {
    const promises = symbols.map((symbol) =>
      this.throttle.execute(() =>
        this.httpService.get(`/quote?symbol=${symbol}`),
      ),
    );

    return await Promise.all(promises);
  }
}
```

### Checklist

- [ ] Parse 429 status code responses from external API
- [ ] Extract Retry-After header value for backoff timing
- [ ] Store rate limit reset timestamp to avoid subsequent failures
- [ ] Return informative error to client indicating wait time
- [ ] Implement ThrottleService for proactive rate limit compliance
- [ ] Configure maxConcurrent based on API rate limit documentation
- [ ] Add delay between requests appropriate for API quotas
- [ ] Monitor rate limit errors to tune throttle configuration

### Troubleshooting

**Problem**: Still getting 429 errors despite throttling
- **Solution**: Reduce maxConcurrent or increase delay, verify calculation of rate limit window (per second/minute/hour), check for other application instances sharing same API key

**Problem**: Retry-After header not present in 429 response
- **Solution**: Use conservative default backoff (60 seconds), check API documentation for rate limit window, implement exponential backoff

**Problem**: Throughput too low with current throttle settings
- **Solution**: Review API rate limit documentation for accurate limits, increase maxConcurrent if within limits, consider request batching if API supports

### Best Practices

- Always respect Retry-After header when present in 429 responses
- Implement exponential backoff when Retry-After is not provided
- Monitor rate limit errors as metric for tuning throttle configuration
- Consider using separate API keys for different application components
- Document rate limit handling behavior for API consumers
- Implement request queuing for graceful handling of burst traffic
- Use distributed rate limiting with Redis for multi-instance deployments

## [Webhook Implementation - Receiving External API Events]()

Endpoint configuration for receiving webhook callbacks from external APIs including controller with signature validation using HMAC SHA256 comparing request signature against computed signature, API Key authentication protecting webhook endpoints, and asynchronous event processing service handling webhook payloads preventing spoofed requests.

### When to use?

Use webhooks for receiving real-time event notifications from external APIs like payment confirmations, order status updates, data synchronization events, or any scenario where polling is inefficient and external API supports push notifications enabling immediate event-driven processing.

### When NOT to use?

Do not use when external API does not provide webhook functionality, avoid for high-frequency events where webhook volume exceeds processing capacity, skip when polling is more reliable due to network constraints, and do not expose webhook endpoints without authentication and signature validation.

### Example

**Webhook Controller with Signature Validation:**

File: `src/modules/webhooks/webhooks.controller.ts`

```typescript
import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiKeyAuth } from '@/common/decorators/api-key-auth.decorator';
import { WebhooksService } from './webhooks.service';
import * as crypto from 'crypto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  @ApiKeyAuth() // Protect with API Key
  async stripeWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
  ) {
    // Validate signature
    const isValid = this.validateStripeSignature(payload, signature);

    if (!isValid) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    // Process webhook
    await this.webhooksService.handleStripeEvent(payload);

    return { received: true };
  }

  private validateStripeSignature(payload: any, signature: string): boolean {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  }
}
```

### Checklist

- [ ] Create webhook controller endpoint accepting POST requests
- [ ] Implement signature validation using provider's algorithm (HMAC SHA256 common)
- [ ] Store webhook secret in environment variables
- [ ] Protect endpoint with API Key authentication if required
- [ ] Return 200 OK response quickly to prevent retries
- [ ] Process webhook payload asynchronously in background
- [ ] Log all webhook deliveries for audit trail
- [ ] Implement idempotency handling for duplicate webhook deliveries

### Troubleshooting

**Problem**: Signature validation always fails
- **Solution**: Verify webhook secret matches provider configuration exactly, check signature header name is correct, ensure payload is not modified before validation (body-parser raw)

**Problem**: External API retrying webhooks repeatedly
- **Solution**: Return 200 status code within timeout window (usually 5-10 seconds), move processing to background job, verify endpoint is publicly accessible

**Problem**: Duplicate webhook events processed multiple times
- **Solution**: Implement idempotency using event ID, store processed event IDs in database, skip processing if event already handled

### Best Practices

- Always validate webhook signatures to prevent spoofed requests
- Use raw body parser for signature validation to match exact bytes
- Return success response quickly before processing to prevent retries
- Process webhook events asynchronously in background jobs
- Implement idempotency to handle duplicate deliveries safely
- Log all webhook deliveries including validation failures for security monitoring
- Use HTTPS endpoints for webhook URLs to prevent man-in-the-middle attacks
- Configure webhook URLs in provider dashboard using environment-specific endpoints

## [Environment Variables - Secure API Configuration Management]()

Organization of external API configuration using environment variables including base URLs, API keys and credentials, OAuth client configuration, webhook secrets, and typed configuration validation using NestJS ConfigService registerAs pattern ensuring secure credential management across development staging production environments.

### When to use?

Use environment variables for all external API credentials and configuration, when managing different credentials across development staging production environments, when deploying to containerized environments requiring runtime configuration, or when following twelve-factor app principles for configuration management enabling portability.

### When NOT to use?

Do not use for non-sensitive static configuration that can be committed to repository, avoid for frequently changing values better suited for database or configuration service, skip for local development overrides where .env.local is more appropriate than shared environment variables.

### Example

**Environment Variables:**

File: `.env`

```env
# External API - Yahoo Finance
YAHOO_FINANCE_API_URL=https://api.yahoo.com/v1
YAHOO_FINANCE_API_KEY=your-api-key-here

# External API - Kinvo
KINVO_API_URL=https://api.kinvo.com.br
KINVO_API_KEY=your-api-key-here

# External API - B3
B3_API_URL=https://api.b3.com.br
B3_USERNAME=your-username
B3_PASSWORD=your-password

# OAuth Provider
OAUTH_TOKEN_URL=https://oauth.provider.com/token
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret

# Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Typed Configuration:**

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('external-apis', () => ({
  yahoo: {
    apiUrl: process.env.YAHOO_FINANCE_API_URL,
    apiKey: process.env.YAHOO_FINANCE_API_KEY,
  },
  kinvo: {
    apiUrl: process.env.KINVO_API_URL,
    apiKey: process.env.KINVO_API_KEY,
  },
  oauth: {
    tokenUrl: process.env.OAUTH_TOKEN_URL,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },
}));
```

### Checklist

- [ ] Create .env file with all external API configuration
- [ ] Add .env to .gitignore to prevent committing secrets
- [ ] Create .env.example with placeholder values for documentation
- [ ] Use ConfigService to inject configuration into services
- [ ] Implement typed configuration using registerAs for validation
- [ ] Separate configuration by environment (development, staging, production)
- [ ] Validate required environment variables at application startup
- [ ] Document all environment variables in README or wiki

### Troubleshooting

**Problem**: ConfigService returns undefined for variables
- **Solution**: Verify .env file exists and is in correct location, check ConfigModule is imported with isGlobal: true, confirm variable names match exactly

**Problem**: Environment variables not updating after changes
- **Solution**: Restart application after .env changes, verify no cached environment in IDE or container, check no conflicting system environment variables

**Problem**: Different behavior across environments
- **Solution**: Compare .env files across environments, verify all required variables are set, check for typos in variable names

### Best Practices

- Never commit .env files to version control, always use .gitignore
- Maintain separate .env files for each environment with appropriate values
- Use .env.example as documentation template showing all required variables
- Validate all required environment variables at application startup failing fast
- Use typed configuration with registerAs for autocomplete and validation
- Rotate API keys and credentials regularly following security policies
- Consider using secrets management service (AWS Secrets Manager, HashiCorp Vault) for production
- Document environment variable purpose and format in team wiki or README

## [Complete Integration Example - Multi-Provider Architecture]()

Real-world implementation demonstrating modular providers architecture integrating multiple external APIs including Yahoo Finance Kinvo and B3 with dedicated provider services, orchestrator service implementing fallback pattern trying providers sequentially, controller exposing unified endpoints, and module configuration showing dependency injection setup.

### When to use?

Reference this example when building multi-provider integration with fallback logic, when implementing production-ready external API integration with error resilience, when setting up new module requiring multiple external data sources, or when training developers on proper integration architecture patterns.

### When NOT to use?

Do not copy blindly without adapting to specific API requirements, avoid overengineering for simple single-provider integrations, skip fallback logic when provider redundancy is unnecessary, and do not use as template for non-HTTP integrations like message queues WebSocket or gRPC services.

### Example

**Module Configuration:**

File: `src/modules/providers/providers.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@/common/http/http.module';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { YahooProviderService } from './services/yahoo-provider.service';
import { KinvoProviderService } from './services/kinvo-provider.service';
import { B3ProviderService } from './services/b3-provider.service';

@Module({
  imports: [HttpModule],
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    YahooProviderService,
    KinvoProviderService,
    B3ProviderService,
  ],
  exports: [ProvidersService],
})
export class ProvidersModule {}
```

**Controller:**

File: `src/modules/providers/providers.controller.ts`

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';

@ApiTags('Providers')
@ApiBearerAuth()
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get('quote/:symbol')
  @ApiOperation({ summary: 'Fetch quote for a symbol' })
  async getQuote(@Param('symbol') symbol: string) {
    return await this.providersService.getQuote(symbol);
  }

  @Get('history/:symbol')
  @ApiOperation({ summary: 'Fetch quote history' })
  async getHistory(
    @Param('symbol') symbol: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.providersService.getHistory(
      symbol,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
```

### Checklist

- [ ] Create dedicated module for external API integrations
- [ ] Import HttpModule for HTTP client access
- [ ] Create controller exposing unified API endpoints
- [ ] Implement orchestrator service coordinating providers
- [ ] Create dedicated provider service for each external API
- [ ] Register all services in module providers array
- [ ] Export orchestrator service for use by other modules
- [ ] Add Swagger documentation to controller endpoints

### Troubleshooting

**Problem**: Dependency injection fails for provider services
- **Solution**: Verify all provider services are in module providers array, check imports include HttpModule, ensure services use @Injectable decorator

**Problem**: Controller endpoints return 404
- **Solution**: Verify module is imported in AppModule, check controller decorator has correct route prefix, ensure methods have proper HTTP method decorators

**Problem**: Fallback logic not working as expected
- **Solution**: Review try-catch blocks in orchestrator service, verify errors are thrown not swallowed, check logger output shows fallback attempts

### Best Practices

- Organize external integrations in dedicated module for clear separation
- Use controller layer only for HTTP concerns delegating logic to services
- Implement comprehensive error handling in provider services
- Add Swagger documentation for all exposed endpoints
- Export only orchestrator service to hide provider implementation details
- Use dependency injection for testability and modularity
- Follow consistent naming patterns across provider services
- Document fallback behavior and provider priority in code comments

## [Best Practices Summary - Production-Ready Integrations]()

Consolidated recommendations for robust reliable integrations covering timeout configuration, retry implementation, logging strategies, error handling, caching, circuit breaker usage, rate limiting compliance, security, monitoring, and testing ensuring production-ready external API integrations with high availability and resilience.

### When to use?

Reference these best practices during code review of integration implementations, when designing new external API integration architecture, when troubleshooting production issues with external APIs, or when establishing team standards for external integrations promoting consistency and quality across codebase.

### When NOT to use?

Do not apply all practices blindly without considering specific API requirements, avoid over-engineering simple integrations with unnecessary patterns, skip practices genuinely not applicable to specific use case with documented justification preventing unnecessary complexity and maintenance burden.

### Example

**Essential Practices:**

1. **Always configure timeout**: Set timeout to 10 seconds or based on API SLA
2. **Implement retry for transient failures**: Use axios-retry for 5xx and network errors
3. **Detailed logging**: Log all requests at debug level and errors at error level
4. **Specific error handling**: Handle 401 Unauthorized, 429 Rate Limit, 5xx Server Error, timeout ECONNABORTED
5. **Smart caching**: Use Redis for production with appropriate TTL
6. **Circuit breaker**: Protect application from unstable APIs preventing cascade failures
7. **Local rate limiting**: Respect external API quotas with throttle service
8. **Security**: Never commit API keys, use environment variables, validate webhook signatures
9. **Monitoring**: Track latency, success/error rate, circuit breaker state
10. **Testing**: Mock all HTTP calls, test error scenarios, test timeout and retry

### Checklist

- [ ] Configure timeout for all external API requests
- [ ] Implement retry logic targeting transient failures only
- [ ] Add comprehensive logging at appropriate levels
- [ ] Handle specific HTTP error codes with meaningful messages
- [ ] Implement caching for expensive or frequently accessed data
- [ ] Use circuit breaker for critical unstable APIs
- [ ] Respect rate limits with local throttling
- [ ] Store credentials securely in environment variables
- [ ] Monitor integration health with metrics and alerting
- [ ] Write tests covering success and error scenarios

### Troubleshooting

**Problem**: Following all best practices makes code too complex
- **Solution**: Apply practices incrementally based on actual issues encountered, start with timeout and error handling then add resilience patterns as needed

**Problem**: Unclear which practices are mandatory
- **Solution**: Timeout, error handling, security are mandatory, retry and circuit breaker depend on API stability, caching depends on usage patterns

**Problem**: Testing external integrations is difficult
- **Solution**: Use mocking libraries like nock or axios-mock-adapter, test provider services in isolation from HTTP layer

### Best Practices

- Start with fundamentals (timeout, error handling, logging) then add resilience patterns
- Measure before optimizing, add caching and circuit breaker based on actual metrics
- Document deviations from standard practices with clear justification
- Use monitoring to validate effectiveness of resilience patterns
- Share learnings across team to improve collective integration quality
- Regularly review and update practices based on production experience

## [Implementation Checklist - Production Readiness Verification]()

Comprehensive verification list ensuring complete integration implementation covering base HttpService creation, provider services, timeout and retry configuration, error handling, caching, resilience patterns, security, logging, testing, and documentation for production-ready external API integrations.

### When to use?

Use this checklist before merging external API integration pull requests, during code review to verify completeness, when auditing existing integrations for missing components, or when onboarding new developers to communicate integration requirements ensuring consistency across team.

### When NOT to use?

Do not use for proof-of-concept or experimental integrations, skip for internal service communication not using HTTP, avoid rigid application when specific items genuinely don't apply with documented reasoning preventing checklist becoming bureaucratic obstacle.

### Example

**Implementation Checklist:**

- [ ] Base HttpService created with timeout and interceptors
- [ ] Specific provider service created for each external API
- [ ] Timeout configured appropriately per request
- [ ] Retry implemented with exponential backoff
- [ ] Specific error handling for different status codes
- [ ] Cache implemented using Redis with appropriate TTL
- [ ] Circuit breaker configured for unstable APIs
- [ ] Rate limiting detection and throttling implemented
- [ ] Environment variables configured for credentials
- [ ] API keys and secrets stored securely never in code
- [ ] Comprehensive logging at debug and error levels
- [ ] Unit tests with mocked HTTP calls
- [ ] Integration tests covering error scenarios
- [ ] Swagger documentation for exposed endpoints
- [ ] README documentation explaining integration architecture

### Checklist

- [ ] Review all checklist items and mark completed ones
- [ ] Document any skipped items with justification
- [ ] Verify tests cover happy path and error scenarios
- [ ] Confirm environment variables documented in .env.example
- [ ] Validate error handling for network timeout rate limit errors

### Troubleshooting

**Problem**: Some checklist items don't apply to integration
- **Solution**: Document why item doesn't apply (e.g., no caching needed for real-time data), get code review approval for skipped items

**Problem**: Unclear what level of testing is sufficient
- **Solution**: Minimum is unit tests for provider services with mocked HTTP, add integration tests for critical flows, measure code coverage aiming for 80%+

**Problem**: Checklist too long and overwhelming
- **Solution**: Focus on mandatory items first (service, timeout, error handling, security), add resilience patterns iteratively based on requirements

### Best Practices

- Integrate checklist into pull request template for external integration changes
- Require explicit confirmation of checklist completion before merge approval
- Update checklist based on lessons learned from production incidents
- Use automated tools (linters, tests) to verify checklist items where possible
- Treat checklist as living document improving with team experience

## [References - Official Documentation and Resources]()

Links to official documentation and resources for Axios HTTP client library, NestJS HTTP Module techniques, axios-retry for automatic retries, Circuit Breaker pattern explanation, and API Security best practices supporting comprehensive understanding of external API integration patterns.

### When to use?

Reference these links when needing detailed documentation beyond this guide, when troubleshooting edge cases not covered here, when learning advanced Axios features like custom adapters, or when validating security practices against industry standards ensuring alignment with official recommendations.

### When NOT to use?

Do not use as primary implementation guide always follow patterns in this document first, do not assume external documentation reflects project-specific standards, do not spend excessive time reading documentation before attempting implementation focusing on practical application over theoretical understanding.

### Example

**Primary References:**

- [Axios Documentation](https://axios-http.com/docs/intro) - Complete HTTP client API reference
- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module) - Official NestJS HTTP techniques
- [axios-retry](https://github.com/softonic/axios-retry) - Automatic retry library documentation
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html) - Martin Fowler's pattern explanation
- [API Security Best Practices](https://owasp.org/www-project-api-security/) - OWASP security guidelines

### Checklist

- [ ] Bookmark Axios documentation for API reference
- [ ] Review NestJS HTTP Module for framework-specific patterns
- [ ] Understand axios-retry configuration options
- [ ] Study Circuit Breaker pattern for resilience architecture
- [ ] Follow OWASP API Security guidelines for credential management

### Troubleshooting

**Problem**: External documentation conflicts with this guide
- **Solution**: This guide takes precedence for project-specific standards, external docs provide additional context and advanced features

**Problem**: Need information not covered in these references
- **Solution**: Consult MDN for HTTP protocol details, check RFCs for standards compliance, ask team for project-specific guidance

### Best Practices

- Keep reference links updated with latest documentation versions
- Add new references as team discovers helpful resources during implementation
- Share relevant documentation sections during code review for educational purposes
- Contribute back to open source projects when discovering bugs or improvements
- Build internal knowledge base capturing project-specific learnings beyond external documentation

## [Related Documentation]()

See also:
- [How to Implement Real-Time with SSE and MQTT](./how-to-implement-realtime-sse-mqtt-backend.md#publishing-events-to-mqtt-topics) - Real-time notification patterns for webhook events
- [How to use RabbitMQ in Backend](./how-to-use-rabbitmq-backend.md) - Alternative event-driven architecture with message queuing
- [How to Create an API in the Backend](./how-to-create-api-backend.md) - REST API structure and controller patterns

---

**Last updated**: January 16, 2025
