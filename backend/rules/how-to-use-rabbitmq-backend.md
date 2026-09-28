# [How to use RabbitMQ in Backend]()

Complete guide for using RabbitMQ with Topic Exchange for asynchronous and reliable processing in distributed systems, covering setup, patterns, and best practices.

## [RabbitMQ Installation and NestJS Integration]()

This section covers the complete setup process for integrating RabbitMQ with NestJS using Topic Exchange pattern, including package installation, global module configuration, environment setup, and microservice bootstrap configuration for asynchronous message processing.

### When to use?

Use RabbitMQ when you need asynchronous processing of tasks that shouldn't block API responses, long-running operations like sending emails or generating reports, automatic retry mechanisms for operations that may fail, delivery guarantees with persistent messages and acknowledgment, or decoupling between producers and consumers for better scalability and background job execution.

### When NOT to use?

Avoid RabbitMQ when you need data caching (use Redis instead), you require synchronous communication with immediate responses (use HTTP/REST), you need temporary shared data between instances (use Redis), or you're implementing simple operations without retry requirements that can be executed directly in the request lifecycle.

### Example

**Package Installation:**

```bash
npm install @nestjs/microservices amqplib amqp-connection-manager
```

**Global RabbitMQ Module Configuration:**

`src/common/rabbitmq/rabbitmq.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: '', // Empty to use specific queues in consumers
            queueOptions: {
              durable: true, // Queue persists after restart
            },
            noAck: false, // Manual message acknowledgment
            prefetchCount: 1, // Process one message at a time
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
```

**AppModule Registration:**

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RabbitMQModule } from './common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitMQModule, // Import once
    // ... other modules
  ],
})
export class AppModule {}
```

**Environment Variables Configuration:**

`.env`

```bash
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=app_exchange
RABBITMQ_USER=guest        # Optional
RABBITMQ_PASSWORD=guest    # Optional
```

**Microservice Bootstrap in main.ts:**

`src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Add RabbitMQ microservice with Topic Exchange
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RABBITMQ_URL', 'amqp://localhost:5672')],
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
        autoDelete: false,
      },
    },
  });

  // Start microservice
  await app.startAllMicroservices();

  // Start HTTP API
  await app.listen(3000);
}
bootstrap();
```

### Checklist

- [ ] RabbitMQ server running (Docker or standalone)
- [ ] Packages installed (`@nestjs/microservices`, `amqplib`, `amqp-connection-manager`)
- [ ] `RabbitMQModule` created in `src/common/rabbitmq/`
- [ ] `@Global()` decorator applied to module
- [ ] Environment variables configured in `.env` file
- [ ] Module imported once in `AppModule`
- [ ] Microservice connected in `main.ts` with `connectMicroservice()`
- [ ] Microservice started with `startAllMicroservices()`

### Troubleshooting

**RabbitMQ connection refused:**

```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# View container logs
docker logs sdd-rabbitmq

# Restart container
docker-compose restart rabbitmq
```

**Exchange not appearing in Management UI:**

Exchange is created automatically by NestJS when first message is published (producer) or first consumer connects. If it doesn't appear, verify microservice was started, check if any message was published, and review error logs for connection issues.

**Module injection failures:**

Ensure `RabbitMQModule` is marked as `@Global()` and exports `ClientsModule`. Verify it's imported only once in `AppModule`. Check that `RABBITMQ_SERVICE` is injected with `@Inject()` decorator.

### Best Practices

- ✅ Configure RabbitMQ as global module to reuse across all modules
- ✅ Always use manual ACK/NACK (`noAck: false`) to avoid message loss
- ✅ Set queues as durable (`durable: true`) to persist after restarts
- ✅ Use environment variables for connection settings
- ✅ Import RabbitMQModule only once in AppModule
- ✅ Use prefetchCount to control parallel processing load
- ✅ Start microservices before HTTP server in bootstrap
- ❌ Never expose RabbitMQ credentials in code
- ❌ Don't set `autoDelete: true` for production queues

## [Topic Exchange Architecture and Routing Patterns]()

This section explains the Topic Exchange pattern used in this project with a single exchange named `app_exchange`, including fundamental concepts, wildcard routing patterns, topic naming conventions, and how messages are routed from publishers to specific consumer queues based on routing key patterns.

### When to use?

Use Topic Exchange when you need flexible message routing based on hierarchical patterns, multiple consumers subscribing to different message types using wildcards, organized event naming with dot-separated structure, centralized message routing through a single exchange, or the ability to filter messages using `*` for one word and `#` for multiple words in routing patterns.

### When NOT to use?

Avoid Topic Exchange when you need direct point-to-point communication where specific queue names are known (use Direct Exchange), you need to broadcast to all queues regardless of routing key (use Fanout Exchange), you don't need pattern-based routing and simple queue names suffice, or you have simple pub/sub without filtering requirements.

### Example

**Topic Naming Pattern:**

```
<module_name>.<resource_name>.<action>
```

**Real-world Examples:**

```typescript
// Order module events
'order.order.created'     // Order created
'order.order.updated'     // Order updated
'order.order.deleted'     // Order deleted
'order.order.paid'        // Order payment completed
'order.order.canceled'    // Order canceled

// Payment module events
'payment.payment.created'  // Payment initiated
'payment.payment.paid'     // Payment completed
'payment.payment.refunded' // Payment refunded

// Notification module events
'notification.email.sent'      // Email sent
'notification.email.delivered' // Email delivered
'notification.email.failed'    // Email failed

// Product module events
'product.stock.filled'    // Stock replenished
'product.stock.depleted'  // Stock exhausted

// User module events
'user.user.registered'  // User registered
'user.user.activated'   // User activated
'user.user.suspended'   // User suspended

// Auction module events
'auction.bid.placed'   // Bid placed
'auction.bid.accepted' // Bid accepted
'auction.bid.rejected' // Bid rejected
```

**Common Action Verbs:**

- CRUD operations: `created`, `updated`, `deleted`
- Payment states: `paid`, `canceled`, `refunded`
- Notification states: `sent`, `delivered`, `failed`
- Processing states: `generated`, `processed`, `completed`
- Stock states: `filled`, `depleted`
- User states: `registered`, `activated`, `suspended`
- Offer states: `placed`, `accepted`, `rejected`

**Wildcard Pattern Matching:**

```typescript
// Listen to specific event
@EventPattern('order.order.created')

// Listen to ALL order events (*, *, created, updated, deleted, etc)
@EventPattern('order.order.*')

// Listen to ALL events from order module
@EventPattern('order.#')

// Listen to ALL created events from any module
@EventPattern('*.*.created')

// Listen to ALL events (use with caution!)
@EventPattern('#')
```

### Checklist

- [ ] Single exchange `app_exchange` configured across application
- [ ] Topic naming follows `<module>.<resource>.<action>` pattern
- [ ] Queues configured as `durable: true` for persistence
- [ ] Routing keys match expected patterns in consumers
- [ ] Wildcard patterns tested and verified
- [ ] Topic patterns documented in module

### Troubleshooting

**Messages going to wrong queue:**

Check in Management UI (http://localhost:15672):
1. Navigate to **Exchanges** > `app_exchange` > **Bindings**
2. Review routing patterns of each queue
3. Test pattern with "Publish message" feature
4. Verify routing key matches consumer's `@EventPattern()`

Check in code:
- Does emit routing key match `@EventPattern()` decorator?
- Are wildcards correct (`*` for one word vs `#` for zero or more words)?
- Is topic name following the naming convention?

**Exchange not created:**

Exchange is created automatically when first producer emits or first consumer connects. Ensure microservice was started and at least one consumer exists.

### Best Practices

- ✅ Always follow the naming pattern `<module>.<resource>.<action>`
- ✅ Use a single exchange (`app_exchange`) for all events
- ✅ Document your topic patterns in the module documentation
- ✅ Use descriptive and consistent action names
- ✅ Use `*` wildcard for single word matching
- ✅ Use `#` wildcard for multiple word matching
- ✅ Test routing patterns in Management UI before deployment
- ❌ Avoid inconsistent naming patterns across modules
- ❌ Don't create multiple exchanges without good reason
- ❌ Don't use overly broad patterns like `#` unless necessary

## [Event Publishing from Controllers and Services]()

This section demonstrates how to publish events to RabbitMQ from Controllers and Services using specific topic routing keys, including injection patterns, payload structure, timing considerations, and integration with business logic for decoupled asynchronous notifications across the system.

### When to use?

Publish messages when an important business event occurs that other parts of the system need to know about (order created, payment completed), you need to notify other services or modules asynchronously without blocking the current request, you want to decouple event producers from consumers, or you need to trigger background jobs, workflows, or side effects.

### When NOT to use?

Avoid publishing messages when you need immediate synchronous response from the operation, the operation is trivial and doesn't require notification to other parts of the system, you're simply updating local state without external impact, or the event has no subscribers and adds unnecessary overhead.

### Example

**Producer Implementation in Controller:**

```typescript
import { Controller, Post, Body, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
    private orderService: OrderService,
  ) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    // Execute business logic first
    const order = await this.orderService.create(dto);

    // Publish event after successful operation
    await this.rabbitClient.emit('order.order.created', {
      orderId: order.id,
      userId: order.userId,
      total: order.total,
      items: order.items.length,
      createdAt: order.createdAt,
    });

    return order;
  }

  @Post(':id/pay')
  async payOrder(@Param('id') id: string) {
    const order = await this.orderService.pay(id);

    await this.rabbitClient.emit('order.order.paid', {
      orderId: order.id,
      paidAt: order.paidAt,
      amount: order.total,
    });

    return order;
  }
}
```

**Module-specific Publishing Patterns:**

**Order Module Events:**
```typescript
// Order created
await this.rabbitClient.emit('order.order.created', {
  orderId, userId, total, items
});

// Order paid
await this.rabbitClient.emit('order.order.paid', {
  orderId, amount, paidAt
});

// Order canceled
await this.rabbitClient.emit('order.order.canceled', {
  orderId, reason, canceledAt
});
```

**Payment Module Events:**
```typescript
// Payment created
await this.rabbitClient.emit('payment.payment.created', {
  paymentId, orderId, amount
});

// Payment completed
await this.rabbitClient.emit('payment.payment.paid', {
  paymentId, amount, paidAt
});

// Payment refunded
await this.rabbitClient.emit('payment.payment.refunded', {
  paymentId, amount, refundedAt
});
```

**Notification Module Events:**
```typescript
// Email sent
await this.rabbitClient.emit('notification.email.sent', {
  emailId, recipient, subject, sentAt
});
```

### Checklist

- [ ] `RABBITMQ_SERVICE` injected via constructor with `@Inject()` decorator
- [ ] Topic names follow `<module>.<resource>.<action>` pattern
- [ ] Payload includes only relevant and necessary data
- [ ] Events emitted after successful database operations
- [ ] `await` keyword used for emit operations
- [ ] Error handling implemented with try/catch
- [ ] Sensitive data excluded from payloads

### Troubleshooting

**Messages not being published:**

1. Verify `RABBITMQ_SERVICE` is injected correctly with `@Inject()` decorator
2. Check RabbitMQ connection is established in bootstrap
3. Review error logs for connection or permission issues
4. Verify topic name format matches pattern
5. Ensure `await` is used with `emit()` operation

**Events published but not consumed:**

1. Verify consumers exist for the routing key
2. Check consumer patterns match publisher topic
3. Review Management UI to see if messages are queued
4. Confirm microservice was started with `startAllMicroservices()`

### Best Practices

- ✅ Inject `RABBITMQ_SERVICE` using `@Inject()` decorator
- ✅ Use `await` for `emit()` operations to handle errors
- ✅ Include only necessary data in payloads (avoid over-fetching)
- ✅ Publish after successful database operations (after commit)
- ✅ Use try/catch for error handling around emit operations
- ✅ Keep payloads small and focused on event data
- ✅ Document which events each module publishes
- ❌ Don't block API responses waiting for message processing
- ❌ Don't include sensitive data (passwords, tokens) in messages
- ❌ Don't emit before database operations complete

## [Message Consumption with Event Patterns and ACK]()

This section covers creating consumers that subscribe to specific topics or wildcard patterns to process events asynchronously, including proper message acknowledgment handling (ACK/NACK), error handling patterns, consumer registration, and extracting routing keys from messages for pattern-based processing.

### When to use?

Create consumers when you need to react to specific business events published by other modules, you want to process messages asynchronously without blocking request threads, you need to implement retry logic for failed operations, or you want to scale processing independently from API servers and handle background tasks.

### When NOT to use?

Avoid consumers when you need synchronous processing with immediate response to the caller, the operation is too simple and doesn't benefit from async processing (use direct service calls), real-time response is critical to user experience, or you don't need the decoupling and resilience that message queues provide.

### Example

**Basic Consumer Implementation:**

`src/modules/notification/notification.consumer.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Injectable()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(private emailService: EmailService) {}

  // Subscribe to specific topic: order.order.created
  @EventPattern('order.order.created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Processing order created: ${data.orderId}`);

      // Execute business logic
      await this.emailService.sendOrderConfirmation(data);

      this.logger.log(`Confirmation email sent for order ${data.orderId}`);

      // Acknowledge message (ACK)
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing order: ${error.message}`);

      // Reject and requeue for retry (NACK with requeue=true)
      channel.nack(originalMsg, false, true);
    }
  }
}
```

**Pattern Matching with Wildcards:**

```typescript
@Injectable()
export class AuditConsumer {
  private readonly logger = new Logger(AuditConsumer.name);

  // Subscribe to ALL order events (created, updated, deleted, paid, etc)
  @EventPattern('order.order.*')
  async handleAllOrderEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey; // Extract actual routing key

    try {
      this.logger.log(`Order event received: ${routingKey}`);

      await this.auditService.log({
        topic: routingKey,
        data,
        timestamp: new Date(),
      });

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Audit error: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  // Subscribe to ALL payment module events
  @EventPattern('payment.#')
  async handleAllPaymentEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    try {
      this.logger.log(`Payment event: ${routingKey}`);
      await this.processPaymentEvent(routingKey, data);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Payment processing error: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  // Subscribe to ALL "created" events from any module
  @EventPattern('*.*.created')
  async handleAllCreatedEvents(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.logCreationEvent(data);
      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg, false, true);
    }
  }
}
```

**Consumer Module Registration:**

`src/modules/notification/notification.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { NotificationConsumer } from './notification.consumer';
import { EmailService } from './email.service';

@Module({
  providers: [
    NotificationConsumer,
    EmailService,
  ],
})
export class NotificationModule {}
```

### Checklist

- [ ] Consumer class decorated with `@Injectable()`
- [ ] Handler methods decorated with `@EventPattern()`
- [ ] Proper ACK/NACK handling implemented in try/catch
- [ ] Error handling with try/catch blocks
- [ ] Logger configured for monitoring
- [ ] Consumer registered in module providers array
- [ ] Microservice started in `main.ts` with `startAllMicroservices()`
- [ ] Routing key extraction for pattern-based consumers

### Troubleshooting

**Messages not being consumed:**

1. Verify microservice was started: `await app.startAllMicroservices()` in `main.ts`
2. Check consumer pattern matches publisher topic exactly
3. Review logs for routing key mismatches
4. Verify consumer is registered in module providers
5. Check RabbitMQ connection in bootstrap configuration

**Messages accumulating in queue without processing:**

1. Access Management UI: http://localhost:15672
2. Check **Queues** tab for active consumers count
3. Review consumption rate vs production rate
4. Increase number of worker instances for horizontal scaling
5. Optimize consumer code performance
6. Increase `prefetchCount` for parallel processing

**Infinite retry loops:**

Implement retry counter or use Dead Letter Queue (see Advanced Patterns section) to prevent indefinite requeue cycles on persistent failures.

### Best Practices

- ✅ Always use try/catch in consumer methods
- ✅ Call `channel.ack()` after successful processing
- ✅ Call `channel.nack()` on errors to enable retry
- ✅ Log routing keys for debugging pattern matches
- ✅ Validate payload structure before processing
- ✅ Use wildcards carefully (`*` for one word, `#` for multiple)
- ✅ Separate consumers by responsibility (Single Responsibility Principle)
- ✅ Extract routing key when using pattern matching
- ❌ Never use `noAck: true` in production
- ❌ Don't ignore error handling
- ❌ Don't process without validating payload

## [Advanced Patterns - DLQ, Retry, and Batch Processing]()

This section demonstrates advanced implementation patterns including Dead Letter Queue configuration for failed messages, retry control with exponential backoff and maximum attempt limits, batch processing for high-volume operations, horizontal scaling strategies with multiple consumer instances, and idempotency handling for duplicate message scenarios.

### When to use?

Use advanced patterns when you need sophisticated error handling with Dead Letter Queue for permanently failed messages, you require controlled retry mechanisms with exponential backoff to avoid overwhelming systems, you want to process high-volume messages in batches for efficiency, you need to scale horizontally with multiple worker instances, or you must handle duplicate messages with idempotency checks.

### When NOT to use?

Avoid advanced patterns when your use case is simple and doesn't need complex error handling, you're just starting and need basic functionality first to validate the approach, the added complexity and operational overhead isn't justified by your requirements, or you have low message volumes that don't benefit from batching or multiple workers.

### Example

**Dead Letter Queue Configuration:**

```typescript
// src/main.ts
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get('RABBITMQ_URL')],
    noAck: false,
    prefetchCount: 1,
    queueOptions: {
      durable: true,
      deadLetterExchange: 'app_exchange_dlx',  // DLQ exchange
      deadLetterRoutingKey: 'failed',          // DLQ routing key
      messageTtl: 3600000,                     // 1 hour TTL
    },
  },
});
```

**Retry Control with Counter and Exponential Backoff:**

```typescript
@Injectable()
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);
  private readonly maxRetries = 3;

  @EventPattern('notification.email.sent')
  async handleEmailSend(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const retryCount = originalMsg.properties.headers['x-retry-count'] || 0;

    try {
      this.logger.log(`Attempt ${retryCount + 1}/${this.maxRetries} - Sending email`);

      await this.emailService.send(data);

      this.logger.log(`Email sent successfully`);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error on attempt ${retryCount + 1}: ${error.message}`);

      if (retryCount >= this.maxRetries) {
        this.logger.error('Max attempts reached. Sending to DLQ.');
        channel.nack(originalMsg, false, false); // Don't requeue, send to DLQ
      } else {
        this.logger.warn(`Requeuing for attempt ${retryCount + 2}`);

        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Update retry counter in headers
        originalMsg.properties.headers['x-retry-count'] = retryCount + 1;

        channel.nack(originalMsg, false, true); // Requeue for retry
      }
    }
  }
}
```

**Batch Processing Implementation:**

```typescript
@Injectable()
export class BatchConsumer {
  private batches: Map<string, any[]> = new Map();
  private readonly batchSize = 10;
  private readonly batchTimeout = 5000; // 5 seconds
  private readonly logger = new Logger(BatchConsumer.name);

  @EventPattern('product.stock.updated')
  async handleStockUpdate(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const routingKey = originalMsg.fields.routingKey;

    // Initialize batch for this routing key
    if (!this.batches.has(routingKey)) {
      this.batches.set(routingKey, []);
      this.scheduleBatchProcessing(routingKey);
    }

    // Add to batch
    this.batches.get(routingKey).push({ data, originalMsg });

    // Process immediately if batch size is reached
    if (this.batches.get(routingKey).length >= this.batchSize) {
      await this.processBatch(routingKey);
    }

    // ACK individual message
    channel.ack(originalMsg);
  }

  private scheduleBatchProcessing(routingKey: string): void {
    setTimeout(async () => {
      if (this.batches.has(routingKey) && this.batches.get(routingKey).length > 0) {
        await this.processBatch(routingKey);
      }
    }, this.batchTimeout);
  }

  private async processBatch(routingKey: string): Promise<void> {
    const items = [...this.batches.get(routingKey)];
    this.batches.set(routingKey, []);

    try {
      this.logger.log(`Processing batch of ${items.length} items for ${routingKey}`);

      await this.stockService.bulkUpdate(items.map((i) => i.data));

      this.logger.log('Batch processed successfully');
    } catch (error) {
      this.logger.error(`Batch processing error: ${error.message}`);
    }
  }
}
```

**Horizontal Scaling with Multiple Instances:**

```bash
# Instance 1
npm run start

# Instance 2 (different terminal/server)
npm run start

# Instance 3
npm run start

# RabbitMQ distributes messages among instances (round-robin)
# Each instance processes different messages from the same queue
```

**Idempotency for Duplicate Message Handling:**

```typescript
@Injectable()
export class OrderConsumer {
  private processedIds = new Set<string>();
  private readonly logger = new Logger(OrderConsumer.name);

  @EventPattern('order.order.created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    // Check if already processed (idempotency)
    if (this.processedIds.has(data.orderId)) {
      this.logger.warn(`Duplicate message ignored: ${data.orderId}`);
      channel.ack(originalMsg);
      return;
    }

    try {
      await this.processOrder(data);

      this.processedIds.add(data.orderId);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Error processing order: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }
}
```

### Checklist

- [ ] Dead Letter Queue exchange and routing key configured
- [ ] Retry mechanism implemented with counter
- [ ] Exponential backoff configured appropriately
- [ ] Maximum retry attempts defined
- [ ] Batch size and timeout defined
- [ ] Multiple instances tested for horizontal scaling
- [ ] Idempotency checks implemented for critical operations
- [ ] Monitoring and alerting configured for DLQ

### Troubleshooting

**Messages stuck in DLQ:**

1. Access Management UI and review DLQ messages
2. Analyze failure patterns and error types
3. Fix underlying issues in consumer code
4. Manually requeue messages or purge if necessary

**Exponential backoff not working:**

Verify retry counter is being incremented correctly in message headers and delay calculation is accurate. Ensure `setTimeout` is properly awaited.

**Batch not processing:**

Check if batch size threshold is too high or batch timeout is too short. Verify `scheduleBatchProcessing` is called when first message arrives.

### Best Practices

- ✅ Configure Dead Letter Queue for permanently failed messages
- ✅ Implement retry with exponential backoff to avoid overwhelming systems
- ✅ Use batch processing for high-volume operations
- ✅ Test horizontal scaling before production deployment
- ✅ Implement idempotency for duplicate handling
- ✅ Set appropriate TTL for messages to avoid indefinite storage
- ✅ Monitor DLQ regularly and alert on accumulation
- ✅ Use message headers for retry counters
- ❌ Don't retry indefinitely without DLQ
- ❌ Don't batch without size and time limits
- ❌ Don't ignore duplicate messages in critical flows

## [Local Development with Docker Compose]()

This section provides Docker Compose configuration for running RabbitMQ locally with Management UI, including container setup, port configuration, volume persistence, healthcheck configuration, and accessing the web-based Management UI for development, debugging, and testing purposes.

### When to use?

Use Docker setup when you need local development environment that matches production, you want Management UI for debugging message flows and queue states, you need quick setup and teardown for testing, you want consistent environment across development team, or you need isolated RabbitMQ instance without affecting system-wide installations.

### When NOT to use?

Avoid Docker when you have dedicated production RabbitMQ server or cloud service, you prefer native installation for performance reasons, Docker is not available or allowed in your development environment, or you need to test against specific RabbitMQ versions not easily available in Docker images.

### Example

**Docker Compose Configuration:**

`docker-compose.yml`

```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: sdd-rabbitmq
    ports:
      - "5672:5672"    # AMQP protocol port
      - "15672:15672"  # Management UI port
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

volumes:
  rabbitmq-data:

networks:
  app-network:
    driver: bridge
```

**Starting RabbitMQ Container:**

```bash
# Start RabbitMQ service
docker-compose up -d rabbitmq

# Verify container is running
docker ps | grep rabbitmq

# View logs
docker logs sdd-rabbitmq

# Follow logs in real-time
docker logs -f sdd-rabbitmq
```

**Accessing Management UI:**

- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

**Management UI Features:**

1. **Exchanges Tab** - View `app_exchange` (type: topic)
2. **Click on exchange** > **Bindings** - See all bound queues and patterns
3. **Queues Tab** - View all automatically created queues
4. **Publish message** - Test routing patterns manually
5. **Get messages** - Inspect message payloads without consuming

### Checklist

- [ ] Docker installed and running on development machine
- [ ] `docker-compose.yml` created with RabbitMQ service
- [ ] RabbitMQ container started successfully
- [ ] Management UI accessible at http://localhost:15672
- [ ] Login credentials working (guest/guest)
- [ ] Exchanges visible in UI after first connection
- [ ] Queues being created automatically by consumers
- [ ] Volume configured for data persistence

### Troubleshooting

**Container fails to start:**

```bash
# Check detailed container logs
docker logs sdd-rabbitmq

# Check if ports are already in use
lsof -i :5672
lsof -i :15672

# Remove and recreate container with volumes
docker-compose down -v
docker-compose up -d rabbitmq
```

**Cannot access Management UI:**

1. Verify container is running: `docker ps | grep rabbitmq`
2. Check if port 15672 is exposed in docker-compose.yml
3. Verify healthcheck status: `docker inspect sdd-rabbitmq | grep Health`
4. Check browser console for errors
5. Try accessing from different browser
6. Verify firewall is not blocking port 15672

**Data not persisting after restart:**

Ensure volume `rabbitmq-data` is configured in docker-compose.yml and mounted to `/var/lib/rabbitmq`.

### Best Practices

- ✅ Use volumes for data persistence across container restarts
- ✅ Configure healthcheck for container monitoring
- ✅ Use Management UI extensively for debugging in development
- ✅ Change default credentials in production environments
- ✅ Monitor container logs regularly during development
- ✅ Use alpine image variant for smaller footprint
- ✅ Configure networks for multi-container setups
- ❌ Never expose Management UI publicly without authentication
- ❌ Don't use guest/guest credentials in production
- ❌ Don't run without volumes in development (data loss on restart)

## [RabbitMQ vs Redis - Choosing the Right Tool]()

This comparative section helps you choose between RabbitMQ's message queue capabilities and Redis's caching and data storage features based on your specific requirements, analyzing delivery guarantees, persistence, performance, use cases, and architectural trade-offs for optimal system design.

### When to use?

Use this comparison when you're deciding between RabbitMQ and Redis for a new feature, you need to understand architectural trade-offs for system design, you're optimizing existing implementation and questioning tool choice, you want to educate team members on when to use each tool, or you're evaluating whether to introduce RabbitMQ into a Redis-only architecture.

### When NOT to use?

This comparison is not needed when you clearly need caching or session storage (use Redis), you clearly need reliable message queues with async processing (use RabbitMQ), you're already using the right tool and it's working well, or your requirements are so specific that general comparison doesn't apply.

### Example

**Feature Comparison Table:**

| Feature | RabbitMQ | Redis |
|---------|----------|-------|
| **Primary use** | Message queues with topic routing | Cache and shared data storage |
| **Delivery guarantee** | ✅ Yes (ACK/NACK) | ❌ No guarantees |
| **Persistence** | ✅ Durable messages on disk | ⚠️ Optional (may lose data) |
| **Automatic retries** | ✅ Built-in with DLQ | ❌ Manual implementation |
| **Topic routing** | ✅ Topic Exchange with wildcards | ❌ Not available |
| **Asynchronous processing** | ✅ Ideal use case | ❌ Not recommended |
| **Message ordering** | ✅ FIFO guaranteed | ⚠️ Not guaranteed |
| **Speed** | ⚠️ Moderate (disk I/O) | ✅ Very fast (in-memory) |
| **Horizontal scaling** | ✅ Multiple consumers | ✅ Data sharing across instances |
| **TTL support** | ✅ Message TTL | ✅ Key expiration |
| **Data structures** | ❌ Messages only | ✅ Strings, Lists, Sets, Hashes |

**Use RabbitMQ for:**

- Background job processing (email sending, report generation)
- Event-driven architectures with pub/sub patterns
- Reliable message delivery with acknowledgment
- Asynchronous workflows and long-running operations
- Retry mechanisms with exponential backoff
- Decoupling microservices communication
- Task queues with worker pools

**Use Redis for:**

- Caching frequently accessed data
- Session storage for web applications
- Rate limiting and throttling
- Temporary data storage with TTL
- Real-time counters and statistics
- Pub/Sub for real-time notifications (ephemeral)
- Distributed locks

**Combined Usage Example:**

```typescript
// Use RabbitMQ for reliable order processing
await this.rabbitClient.emit('order.order.created', { orderId });

// Use Redis for caching order data
await this.cacheService.set(`order:${orderId}`, orderData, 3600);
```

### Checklist

- [ ] Identified whether you need reliable delivery (RabbitMQ) or speed (Redis)
- [ ] Evaluated if async processing is required
- [ ] Determined if messages need persistence
- [ ] Assessed retry and error handling requirements
- [ ] Considered performance vs reliability trade-offs
- [ ] Reviewed team expertise with each technology

### Troubleshooting

**Chose wrong tool and experiencing issues:**

If using RabbitMQ for caching:
1. Migrate to Redis for better performance
2. Remove unnecessary queue consumers
3. Implement cache-aside or write-through patterns

If using Redis for message queues:
1. Migrate to RabbitMQ for reliability
2. Implement proper ACK/NACK handling
3. Configure Dead Letter Queue for failures

### Best Practices

- ✅ Use RabbitMQ for asynchronous message processing with reliability
- ✅ Use Redis for caching and temporary data with speed priority
- ✅ Combine both when needed (RabbitMQ for jobs, Redis for cache)
- ✅ Understand delivery guarantees before choosing
- ✅ Consider operational complexity of running both
- ✅ Evaluate team expertise with each technology
- ❌ Don't use RabbitMQ for caching frequently accessed data
- ❌ Don't use Redis for reliable message queues with delivery guarantees
- ❌ Don't choose based on familiarity alone, consider requirements

## [References and Documentation]()

Official documentation, tutorials, and resources for RabbitMQ and NestJS microservices integration.

- [NestJS Microservices Documentation](https://docs.nestjs.com/microservices/basics)
- [RabbitMQ Topic Exchange Tutorial](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
- [RabbitMQ Management UI Guide](https://www.rabbitmq.com/management.html)
- [Dead Letter Exchanges Documentation](https://www.rabbitmq.com/dlx.html)
- [AMQP Concepts - Routing Keys and Bindings](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
- [RabbitMQ Best Practices](https://www.rabbitmq.com/production-checklist.html)

## [Related Documentation]()

See also:
- [How to Implement Real-Time with SSE and MQTT](./how-to-implement-realtime-sse-mqtt-backend.md#integration-with-rabbitmq-events) - Bridging RabbitMQ events to MQTT for real-time frontend distribution
- [How to Integrate External APIs in Backend](./how-to-integrate-external-api-backend.md) - External API integration patterns
- [How to Create an API in the Backend](./how-to-create-api-backend.md) - REST API structure and controller patterns
- [CloudAMQP RabbitMQ for Beginners](https://www.cloudamqp.com/blog/part1-rabbitmq-for-beginners-what-is-rabbitmq.html)
