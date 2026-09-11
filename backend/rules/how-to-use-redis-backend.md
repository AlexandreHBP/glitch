# [How to use Redis in Backend]()

Complete guide for using Redis as cache and shared memory for horizontal scalability in distributed NestJS applications.

## [Setting up Redis as Cache in NestJS]()

This section covers the complete integration process for Redis in NestJS using cache-manager, including package installation, global module configuration, environment setup, and basic cache operations for improving application performance and enabling distributed caching across multiple instances.

### When to use?

Use Redis when you need:
- ✅ Data caching to reduce database load and improve response times
- ✅ Shared sessions across multiple application instances
- ✅ Shared counters with atomic increments for distributed systems
- ✅ Rate limiting to control API request rates per user or IP
- ✅ External API response caching to avoid repeated expensive requests
- ✅ Temporary data storage shared between multiple instances
- ✅ Fast in-memory data access for frequently used information

### When NOT to use?

Avoid Redis when:
- ❌ You need permanent storage (use PostgreSQL for persistent data)
- ❌ You need task queues with retry mechanisms (use RabbitMQ for background jobs)
- ❌ You need pub/sub communication between instances (use RabbitMQ)
- ❌ You need complex queries and relationships (use PostgreSQL)

### Example

Package installation and global module configuration for Redis integration.

**Installation:**

```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis
```

**Global Redis Module Configuration:**

`src/common/redis/redis.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

@Global() // Makes it available to all modules
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: configService.get('REDIS_TTL', 300), // 5 minutes default
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
```

**Register in AppModule:**

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    RedisModule, // Import once
    // ... other modules
  ],
})
export class AppModule {}
```

**Environment Variables:**

`.env`

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=       # Optional
REDIS_DB=0
REDIS_TTL=300         # 5 minutes in seconds
```

### Checklist

- [ ] Redis installed (Docker or local)
- [ ] Packages installed (`@nestjs/cache-manager`, `cache-manager-redis-store`, `redis`)
- [ ] `RedisModule` created in `src/common/redis/`
- [ ] `@Global()` decorator applied to module
- [ ] Environment variables configured (`.env`)
- [ ] Module imported in `AppModule`
- [ ] Connection tested successfully

### Troubleshooting

**Resolve Redis connection refused error:**

```bash
# Check if Redis is running
docker ps | grep redis

# View logs
docker logs sdd-redis

# Restart
docker-compose restart redis
```

**Debug when Redis cache is not working:**

```typescript
// Debug - check if it's saving
const saved = await this.cacheManager.set('test', 'value', 60);
console.log('Saved:', saved);

const retrieved = await this.cacheManager.get('test');
console.log('Retrieved:', retrieved);
```

### Best Practices

- ✅ Configure Redis as a global module to reuse across all modules
- ✅ Use environment variables for connection settings
- ✅ Import RedisModule only once in AppModule
- ✅ Set default TTL to prevent infinite memory usage
- ✅ Test connection during application startup
- ❌ Never expose Redis credentials in code
- ❌ Don't store sensitive data without encryption

## [Basic Redis Cache Operations]()

This section demonstrates how to inject and use Redis cache manager in services for query and data caching using standard cache-manager operations like SET, GET, DEL and FLUSH. Learn patterns for caching database queries, invalidating stale data, and improving API response times.

### When to use?

Use basic cache operations when:
- ✅ You need to cache database query results
- ✅ You want to reduce API response times
- ✅ You need to store temporary computed values
- ✅ You want to minimize database load

### When NOT to use?

Avoid basic cache when:
- ❌ Data changes frequently (cache will be invalidated constantly)
- ❌ Data is small and queries are fast (overhead not worth it)
- ❌ You need complex atomic operations (use advanced patterns)

### Example

Comprehensive service implementation showing cache injection, query caching, and cache invalidation strategies.

**Inject CACHE_MANAGER in Services:**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    const cacheKey = 'products:all';

    // Try to get from cache
    const cached = await this.cacheManager.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // If it doesn't exist, fetch from database
    const products = await this.productRepository.find();

    // Save in cache for 5 minutes
    await this.cacheManager.set(cacheKey, products, 300);

    return products;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;

    const cached = await this.cacheManager.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.productRepository.findOneOrFail({
      where: { id },
    });

    await this.cacheManager.set(cacheKey, product, 300);

    return product;
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.save({
      id,
      ...updateDto,
    });

    // Invalidate related caches
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:all');

    return product;
  }

  async remove(id: string): Promise<void> {
    await this.productRepository.softDelete(id);

    // Invalidate caches
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:all');
  }
}
```

**Available Redis Operations:**

**1. Save data to Redis using SET:**

```typescript
// Simple
await this.cacheManager.set('key', 'value');

// With TTL (in seconds)
await this.cacheManager.set('key', 'value', 300); // 5 minutes

// Complex object (automatically serialized)
await this.cacheManager.set('user:123', { id: 123, name: 'John' }, 600);
```

**2. Fetch data from Redis using GET:**

```typescript
// Returns null if doesn't exist
const value = await this.cacheManager.get('key');

// With typing
const user = await this.cacheManager.get<User>('user:123');
```

**3. Delete keys from Redis using DEL:**

```typescript
// Delete one key
await this.cacheManager.del('key');

// Delete multiple keys
await this.cacheManager.del('key1');
await this.cacheManager.del('key2');
```

**4. Reset all Redis data using FLUSH:**

```typescript
// ⚠️ Careful: removes ALL keys
await this.cacheManager.reset();
```

### Checklist

- [ ] `CACHE_MANAGER` injected via constructor
- [ ] Cache key naming pattern defined
- [ ] TTL set for all cache operations
- [ ] Cache invalidation on updates/deletes
- [ ] Error handling for Redis failures
- [ ] Type safety with generics

### Troubleshooting

**Cache always returning null:**

1. Verify Redis is running
2. Check if key exists: `redis-cli KEYS *`
3. Verify TTL hasn't expired
4. Check for typos in cache keys

**Stale data in cache:**

1. Verify cache invalidation logic
2. Check if TTL is too long
3. Manually delete key: `await this.cacheManager.del(key)`

### Best Practices

- ✅ Always define TTL to avoid data accumulation
- ✅ Invalidate cache when updating or deleting data
- ✅ Use consistent prefixes in Redis keys
- ✅ Handle Redis connection errors gracefully
- ✅ Use generic types for type safety
- ✅ Don't cache sensitive data in Redis
- ❌ Never set cache without TTL
- ❌ Don't ignore cache invalidation

## [Redis Key Naming Patterns]()

This section explains hierarchical key naming conventions to organize Redis data effectively and enable efficient pattern-based operations for cache invalidation and management. Proper naming prevents key collisions and makes debugging easier across distributed systems.

### When to use?

Use naming patterns when:
- ✅ You need to organize cache keys logically
- ✅ You want to invalidate related keys easily
- ✅ You need to identify key purpose at a glance
- ✅ You want to prevent key collisions

### When NOT to use?

This pattern is always recommended; there's no case where you shouldn't use structured naming.

### Example

Hierarchical naming pattern with prefix, identifier, and subresource components for organized cache management.

**Hierarchical Naming Pattern:**

```typescript
// ✅ Good - hierarchical and descriptive
'user:123'
'user:123:profile'
'product:456'
'products:category:electronics'
'stats:pageview:home'
'ratelimit:user:123'
'session:abc-def-123'
'cache:api:external:user:789'

// ❌ Bad - no structure
'u123'
'data'
'temp'
```

**Pattern Components:**

1. **Prefix**: Resource type (user, product, session)
2. **Identifier**: Unique ID or key
3. **Subresource**: Additional context (profile, stats)

**Benefits:**

- Easy to find related keys: `KEYS user:*`
- Clear purpose and ownership
- Prevents naming conflicts
- Enables bulk operations

### Checklist

- [ ] Naming pattern documented
- [ ] All keys follow consistent pattern
- [ ] Prefixes match resource types
- [ ] IDs properly separated with colons
- [ ] Team agrees on convention

### Troubleshooting

**Cannot find keys:**

1. Use `KEYS pattern` to search
2. Verify naming pattern consistency
3. Check for typos in prefix

### Best Practices

- ✅ Use colon (`:`) as separator
- ✅ Use descriptive prefixes
- ✅ Include resource type and ID
- ✅ Keep patterns consistent across application
- ✅ Document your naming conventions
- ❌ Don't use random or cryptic names
- ❌ Don't mix naming patterns

## [Advanced Redis Use Cases]()

This section demonstrates advanced implementations including atomic counters for distributed systems, rate limiting with Redis, external API response caching, and shared session management for horizontal scaling. These patterns leverage Redis's atomic operations and distributed nature.

### When to use?

Use advanced patterns when:
- ✅ You need atomic operations for distributed counters
- ✅ You require rate limiting for API protection
- ✅ You want to cache expensive external API calls
- ✅ You need shared sessions across multiple instances

### When NOT to use?

Avoid advanced patterns when:
- ❌ Basic cache operations suffice
- ❌ You don't need atomic operations
- ❌ Single instance deployment doesn't need sharing

### Example

Complete implementations of atomic counters, rate limiting, external API caching, and session management patterns.

**1. Atomic Counter with Redis:**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class StatsService {
  private redisClient: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    // Access native Redis client for advanced operations
    this.redisClient = (this.cacheManager.store as any).getClient();
  }

  async incrementPageView(pageId: string): Promise<number> {
    const key = `stats:pageview:${pageId}`;

    // INCR is atomic - safe for multiple instances
    const newCount = await this.redisClient.incr(key);

    // Set 24 hour expiration
    await this.redisClient.expire(key, 86400);

    return newCount;
  }

  async getPageViews(pageId: string): Promise<number> {
    const key = `stats:pageview:${pageId}`;
    const count = await this.redisClient.get(key);
    return parseInt(count || '0', 10);
  }
}
```

**2. Rate Limiting with Redis:**

```typescript
@Injectable()
export class RateLimitService {
  private redisClient: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.redisClient = (this.cacheManager.store as any).getClient();
  }

  async checkRateLimit(
    identifier: string, // userId, IP, etc
    limit: number = 100, // maximum requests
    windowSeconds: number = 60, // time window
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${identifier}`;

    const current = await this.redisClient.incr(key);

    // First request - set expiration
    if (current === 1) {
      await this.redisClient.expire(key, windowSeconds);
    }

    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);

    return { allowed, remaining };
  }
}
```

**Rate Limit Guard:**

```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const identifier = request.user?.id || request.ip;

    const { allowed, remaining } = await this.rateLimitService.checkRateLimit(
      identifier,
      100, // 100 requests
      60,  // per minute
    );

    if (!allowed) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Remaining', remaining);

    return true;
  }
}
```

**3. External API Cache:**

```typescript
@Injectable()
export class ExternalApiService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
  ) {}

  async fetchUserData(userId: string): Promise<any> {
    const cacheKey = `external:user:${userId}`;

    // Try cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from external API
    const response = await this.httpService.axiosRef.get(
      `https://api.example.com/users/${userId}`,
    );

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, response.data, 3600);

    return response.data;
  }
}
```

**4. Shared Sessions:**

```typescript
@Injectable()
export class SessionService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async createSession(userId: string, data: any): Promise<string> {
    const sessionId = randomUUID();
    const key = `session:${sessionId}`;

    await this.cacheManager.set(
      key,
      { userId, ...data },
      3600, // 1 hour
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    return await this.cacheManager.get(key);
  }

  async destroySession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.cacheManager.del(key);
  }

  async refreshSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.cacheManager.set(`session:${sessionId}`, session, 3600);
    }
  }
}
```

### Checklist

- [ ] Atomic operations implemented correctly
- [ ] Rate limits configured appropriately
- [ ] External API cache with reasonable TTL
- [ ] Session management with proper TTL
- [ ] Error handling for Redis failures
- [ ] Monitoring for cache hit rates

### Troubleshooting

**Investigate and resolve high Redis memory problem:**

```bash
# Connect to Redis CLI
docker exec -it sdd-redis redis-cli

# View memory information
INFO memory

# View all keys (careful in production)
KEYS *

# Clear everything (CAREFUL!)
FLUSHALL
```

**Counter inconsistencies:**

1. Verify atomic operations are used (INCR, not GET+SET)
2. Check for race conditions
3. Verify TTL is set correctly

### Best Practices

- ✅ Use atomic operations for counters (INCR)
- ✅ Set appropriate rate limits per use case
- ✅ Cache expensive external API calls
- ✅ Use TTL for all temporary data
- ✅ Monitor memory usage regularly
- ❌ Don't implement counters with GET+SET
- ❌ Don't cache without expiration

## [Bulk Redis Key Invalidation by Pattern]()

This section provides utilities to delete multiple Redis keys using wildcard patterns, enabling efficient cache invalidation for related data across the application. Pattern-based deletion is essential for maintaining cache consistency when data relationships change.

### When to use?

Use pattern-based deletion when:
- ✅ You need to invalidate all related cache keys at once
- ✅ You want to clear cache for a specific resource type
- ✅ You need to remove all data for a user or entity
- ✅ You want to implement cache invalidation strategies

### When NOT to use?

Avoid pattern deletion when:
- ❌ You need to delete a single specific key
- ❌ Pattern matches too many keys (performance impact)
- ❌ You're in production with millions of keys (use SCAN instead)

### Example

Cache service implementation with pattern-based key deletion using Redis KEYS command and bulk delete operations.

**Cache Service with Pattern Deletion:**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private redisClient: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.redisClient = (this.cacheManager.store as any).getClient();
  }

  async deleteByPattern(pattern: string): Promise<void> {
    // Find all keys matching the pattern
    const keys = await this.redisClient.keys(pattern);

    if (keys.length > 0) {
      // Delete all
      await this.redisClient.del(...keys);
    }
  }
}
```

**Usage Examples:**

```typescript
// Delete all products
await cacheService.deleteByPattern('product:*');

// Delete everything from user 123
await cacheService.deleteByPattern('user:123:*');

// Delete all API cache
await cacheService.deleteByPattern('cache:api:*');

// Delete all rate limit counters
await cacheService.deleteByPattern('ratelimit:*');
```

### Checklist

- [ ] Pattern deletion service implemented
- [ ] Patterns tested in development
- [ ] Performance tested with large datasets
- [ ] Error handling for missing keys
- [ ] Logging for deletion operations

### Troubleshooting

**Pattern matching too many keys:**

1. Use more specific patterns
2. Consider SCAN instead of KEYS in production
3. Delete in batches

**Deletion failing:**

1. Check if pattern is correct
2. Verify keys exist: `redis-cli KEYS pattern`
3. Check permissions

### Best Practices

- ✅ Use specific patterns to limit scope
- ✅ Log deletion operations
- ✅ Use SCAN for production with many keys
- ✅ Test patterns in development first
- ❌ Don't use `*` pattern (deletes everything)
- ❌ Don't use KEYS in production (blocks Redis)

## [Local Redis Setup with Docker]()

This section provides Docker Compose configuration for running Redis locally for development and testing purposes with data persistence and health checks. Docker ensures consistent development environment across team members and simplifies local setup.

### When to use?

Use Docker setup when:
- ✅ You need local development environment
- ✅ You want quick setup and teardown
- ✅ You need consistent environment across team
- ✅ You want data persistence between restarts

### When NOT to use?

Avoid Docker when:
- ❌ You have production Redis server
- ❌ You prefer native installation
- ❌ Docker is not available in your environment

### Example

Complete Docker Compose configuration with Redis 7 Alpine, persistent volumes, and connection testing commands.

**Docker Compose Configuration:**

`docker-compose.yml`

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: sdd-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

**Start Redis:**

```bash
docker-compose up -d redis
```

**Connect to Redis CLI:**

```bash
# Access Redis CLI
docker exec -it sdd-redis redis-cli

# Test connection
PING
# Response: PONG

# View all keys
KEYS *

# Get specific key
GET user:123

# View memory info
INFO memory
```

### Checklist

- [ ] Docker installed and running
- [ ] `docker-compose.yml` created
- [ ] Redis container started
- [ ] Connection tested (PING/PONG)
- [ ] Volume for data persistence configured
- [ ] Healthcheck passing

### Troubleshooting

**Container fails to start:**

```bash
# Check container logs
docker logs sdd-redis

# Check if port is already in use
lsof -i :6379

# Remove and recreate container
docker-compose down -v
docker-compose up -d redis
```

**Cannot connect to Redis:**

1. Verify container is running: `docker ps | grep redis`
2. Check if port 6379 is exposed
3. Verify healthcheck status: `docker inspect sdd-redis`
4. Test connection: `redis-cli ping`

### Best Practices

- ✅ Use volumes for data persistence
- ✅ Configure healthcheck for monitoring
- ✅ Use appendonly mode for durability
- ✅ Monitor container logs
- ✅ Set proper resource limits in production
- ❌ Don't expose Redis publicly without authentication
- ❌ Don't run without persistence in production

## [Redis vs RabbitMQ Comparison]()

This comparative section helps you choose between Redis and RabbitMQ based on specific use case requirements, understanding the strengths and limitations of each technology. Making the right choice prevents architectural issues and ensures reliable system behavior.

### When to use?

Use this comparison when:
- ✅ You're deciding between Redis and RabbitMQ
- ✅ You need to understand trade-offs
- ✅ You're architecting a new feature
- ✅ You want to optimize existing implementation

### When NOT to use?

This comparison is not needed when:
- ❌ You clearly need caching (use Redis)
- ❌ You clearly need message queues (use RabbitMQ)
- ❌ You're already using the right tool

### Example

Feature comparison table highlighting delivery guarantees, persistence, retries, and ideal use cases for each technology.

| Feature | Redis | RabbitMQ |
|---------|-------|----------|
| **Primary use** | Cache and shared data | Message queues with topics |
| **Delivery guarantee** | ❌ No | ✅ Yes (ACK/NACK) |
| **Persistence** | ⚠️ Optional (may lose data) | ✅ Durable messages |
| **Retries** | ❌ Manual | ✅ Automatic with DLQ |
| **Topic routing** | ❌ Not available | ✅ Topic Exchange with wildcards |
| **Asynchronous processing** | ❌ Not recommended | ✅ Ideal |
| **Ordering** | ⚠️ Not guaranteed | ✅ FIFO guaranteed |
| **Speed** | ✅ Very fast | ⚠️ Moderate |
| **Horizontal scaling** | ✅ Data sharing | ✅ Multiple consumers |
| **When to use** | Cache, sessions, counters | Background jobs, events, retry |

**Use Redis for:**
- Caching frequently accessed data
- Session storage
- Rate limiting
- Atomic counters
- Temporary data storage

**Use RabbitMQ for:**
- Background job processing
- Event-driven architectures
- Reliable message delivery
- Asynchronous workflows

### Checklist

- [ ] Identified use case requirements
- [ ] Compared delivery guarantees needed
- [ ] Evaluated persistence requirements
- [ ] Considered performance needs
- [ ] Determined scaling strategy

### Troubleshooting

**Chose wrong tool:**

If using Redis for queues or RabbitMQ for caching:
1. Identify the actual requirement
2. Migrate to appropriate tool
3. Update implementation
4. Test thoroughly

### Best Practices

- ✅ Use Redis for caching and temporary data
- ✅ Use RabbitMQ for asynchronous message processing
- ✅ Combine both when needed (Redis for cache, RabbitMQ for jobs)
- ✅ Understand trade-offs before choosing
- ❌ Don't use Redis for reliable message queues
- ❌ Don't use RabbitMQ for caching

## [References and Documentation]()

Official documentation and resources for Redis and NestJS integration providing comprehensive guides and best practices.

- [NestJS Cache](https://docs.nestjs.com/techniques/caching)
- [Redis Commands](https://redis.io/commands)
- [cache-manager](https://github.com/node-cache-manager/node-cache-manager)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
