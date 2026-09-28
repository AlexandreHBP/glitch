# [How to Implement Real-Time with SSE and MQTT in Backend]()

Complete guide for implementing real-time communication using Server-Sent Events (SSE) for frontend connections and MQTT for backend event distribution, ensuring security, scalability, and instant reactivity to business events, webhooks, and external system notifications.

## [Architecture Overview - SSE Frontend to MQTT Backend]()

This architecture pattern establishes a secure bridge between frontend clients and backend event systems. Frontend connects via SSE to receive real-time updates, while backend manages MQTT topics and subscriptions, keeping business logic and security rules server-side. This prevents direct client access to MQTT brokers, protecting sensitive topics and maintaining centralized control over event distribution.

### When to use?

Use this pattern when you need instant frontend reactivity to business events, webhook receptions, external system notifications, or internal state changes. Ideal for dashboards, live notifications, real-time monitoring, collaborative features, order status tracking, payment confirmations, IoT device updates, or any scenario requiring server-push communication without client polling.

### When NOT to use?

Avoid this pattern for simple request-response flows where standard REST APIs suffice, when dealing with large binary data transfers better suited for WebSockets, for infrequent updates where polling is acceptable, or when browser compatibility with SSE is a concern (though SSE support is excellent in modern browsers).

### Architecture Flow

```
┌─────────────┐         SSE          ┌──────────────┐        MQTT         ┌──────────────┐
│   Frontend  │ ◄─────────────────── │   Backend    │ ◄──────────────────►│     MQTT     │
│   (React)   │    text/event-stream │   (NestJS)   │   pub/sub topics   │   Broker     │
└─────────────┘                       └──────────────┘                     │ (Mosquitto)  │
                                             │                              └──────────────┘
                                             │
                                      ┌──────▼──────┐
                                      │  Business   │
                                      │   Rules &   │
                                      │   Topics    │
                                      └─────────────┘
```

### Key Benefits

- **Security First**: Topics managed server-side, preventing client manipulation
- **Scalability**: MQTT handles message distribution efficiently
- **Browser Compatibility**: SSE works in all modern browsers with automatic reconnection
- **Simplicity**: No complex WebSocket protocol negotiation
- **HTTP-Friendly**: Works through standard HTTP infrastructure (proxies, load balancers)
- **Event Sourcing**: Easy integration with event-driven architectures

## [MQTT Broker Requirements]()

MQTT broker must be available and accessible for the backend to connect. Eclipse Mosquitto is recommended as a lightweight, open-source MQTT broker. Contact your infrastructure team or DevOps to ensure the MQTT broker is properly configured and accessible.

### Connection Requirements

- **MQTT URL**: Broker connection string (e.g., `mqtt://mqtt-broker:1883`)
- **Authentication**: Username and password (if required)
- **Network Access**: Backend must have network connectivity to broker
- **Port**: Default MQTT port is 1883 (configurable)

## [NestJS MQTT Integration]()

Backend integration with MQTT broker using NestJS microservices module. This enables publishing and subscribing to MQTT topics with proper dependency injection and TypeScript type safety.

### Package Installation

```bash
npm install @nestjs/microservices mqtt
```

### Environment Configuration

`.env`

```env
# MQTT Configuration
MQTT_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=nestjs-backend
```

### Global MQTT Module

`src/common/mqtt/mqtt.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MQTT_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.MQTT,
          options: {
            url: configService.get('MQTT_URL', 'mqtt://localhost:1883'),
            username: configService.get('MQTT_USERNAME'),
            password: configService.get('MQTT_PASSWORD'),
            clientId: configService.get('MQTT_CLIENT_ID', 'nestjs-backend'),
            clean: true, // Clean session
            reconnectPeriod: 1000, // Reconnect after 1s
            connectTimeout: 30000, // 30s timeout
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MqttModule {}
```

### Register in AppModule

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MqttModule } from './common/mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MqttModule, // Register MQTT globally
    // ... other modules
  ],
})
export class AppModule {}
```

## [SSE Controller Implementation]()

Server-Sent Events endpoint implementation exposing real-time data streams to frontend clients. SSE controllers handle client connections, manage subscriptions, and transform MQTT messages into SSE format with proper error handling and connection lifecycle management.

### When to use?

Implement SSE controllers when frontend needs real-time updates without polling, for dashboard live metrics, notification systems, progress tracking, live feeds, or any scenario requiring server-to-client push with automatic reconnection.

### SSE Controller Example

`src/modules/notifications/controllers/notifications-sse.controller.ts`

```typescript
import { Controller, Sse, UseGuards, Req, Param, MessageEvent } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { NotificationsSseService } from '../services/notifications-sse.service';
import { Request } from 'express';

@Controller({ path: 'notifications', version: '1' })
@UseGuards(JwtAuthGuard) // Require authentication
export class NotificationsSseController {
  constructor(
    private readonly notificationsSseService: NotificationsSseService,
  ) {}

  @Sse('stream')
  async *streamNotifications(@Req() request: Request): AsyncGenerator<MessageEvent> {
    const userId = request.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Subscribe user to their personal notification stream
    yield* this.notificationsSseService.subscribeToUserNotifications(userId);
  }

  @Sse('orders/:orderId/status')
  async *streamOrderStatus(
    @Req() request: Request,
    @Param('orderId') orderId: string,
  ): AsyncGenerator<MessageEvent> {
    const userId = request.user?.id;

    // Validate user has access to this order
    // This is where business rules are applied
    yield* this.notificationsSseService.subscribeToOrderStatus(
      userId,
      orderId,
    );
  }
}
```

### SSE Response Format

```typescript
// MessageEvent structure
interface MessageEvent {
  data: string | object; // Payload
  id?: string; // Event ID for reconnection
  type?: string; // Event type for client-side filtering
  retry?: number; // Reconnection timeout in ms
}
```

## [SSE Service with MQTT Subscription]()

Service layer orchestrating MQTT subscriptions and transforming messages into SSE events. This is where business logic, topic selection, filtering, and authorization rules are implemented, ensuring secure and contextual event delivery to connected clients.

### When to use?

Create SSE services to encapsulate subscription logic, apply business rules for topic access control, transform MQTT payloads into frontend-friendly formats, implement user-specific filtering, and manage the lifecycle of MQTT subscriptions tied to SSE connections.

### Notifications SSE Service

`src/modules/notifications/services/notifications-sse.service.ts`

```typescript
import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { MessageEvent } from '@nestjs/common';
import { EventEmitter } from 'events';

interface MqttMessage {
  topic: string;
  payload: any;
  timestamp: Date;
}

@Injectable()
export class NotificationsSseService implements OnModuleInit, OnModuleDestroy {
  private mqttEmitter = new EventEmitter();
  private subscriptions = new Map<string, any>();

  constructor(
    @Inject('MQTT_SERVICE')
    private readonly mqttClient: ClientMqtt,
  ) {}

  async onModuleInit() {
    // Connect to MQTT broker
    await this.mqttClient.connect();
  }

  async onModuleDestroy() {
    // Cleanup on shutdown
    await this.mqttClient.close();
    this.mqttEmitter.removeAllListeners();

    // Unsubscribe from all MQTT topics
    for (const [topic, subscription] of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions.clear();
  }

  /**
   * Subscribe to user-specific notifications
   * Topic format: notifications/user/{userId}
   */
  async *subscribeToUserNotifications(userId: string): AsyncGenerator<MessageEvent> {
    const topic = `notifications/user/${userId}`;

    // Subscribe to MQTT topic if not already subscribed
    if (!this.subscriptions.has(topic)) {
      const subscription = this.mqttClient.subscribe(topic).subscribe((payload) => {
        const message: MqttMessage = {
          topic,
          payload,
          timestamp: new Date(),
        };
        this.mqttEmitter.emit('message', message);
      });
      this.subscriptions.set(topic, subscription);
    }

    // Create event listener for this topic
    const messageHandler = (message: MqttMessage) => {
      if (message.topic === topic) {
        return {
          data: {
            type: 'notification',
            payload: message.payload,
            timestamp: message.timestamp.toISOString(),
          },
          id: Date.now().toString(),
          retry: 5000, // Retry after 5s
        };
      }
      return null;
    };

    // Stream messages as they arrive
    while (true) {
      const message = await new Promise<MqttMessage>((resolve) => {
        this.mqttEmitter.once('message', resolve);
      });

      const event = messageHandler(message);
      if (event) {
        yield event;
      }
    }
  }

  /**
   * Subscribe to order status updates
   * Topic format: orders/{orderId}/status
   * Business rule: User must own the order
   */
  async *subscribeToOrderStatus(
    userId: string,
    orderId: string,
  ): AsyncGenerator<MessageEvent> {
    // Apply business rule: validate user owns this order
    // This keeps security server-side
    const isAuthorized = await this.validateOrderAccess(userId, orderId);

    if (!isAuthorized) {
      throw new Error('Unauthorized access to order');
    }

    const topic = `orders/${orderId}/status`;

    // Subscribe to MQTT topic if not already subscribed
    if (!this.subscriptions.has(topic)) {
      const subscription = this.mqttClient.subscribe(topic).subscribe((payload) => {
        const message: MqttMessage = {
          topic,
          payload,
          timestamp: new Date(),
        };
        this.mqttEmitter.emit('message', message);
      });
      this.subscriptions.set(topic, subscription);
    }

    // Create event listener for this topic
    const messageHandler = (message: MqttMessage) => {
      if (message.topic === topic) {
        return {
          data: {
            type: 'order_status',
            orderId,
            status: message.payload.status,
            timestamp: message.timestamp.toISOString(),
          },
          id: Date.now().toString(),
        };
      }
      return null;
    };

    // Stream messages as they arrive
    while (true) {
      const message = await new Promise<MqttMessage>((resolve) => {
        this.mqttEmitter.once('message', resolve);
      });

      const event = messageHandler(message);
      if (event) {
        yield event;
      }
    }
  }

  private async validateOrderAccess(userId: string, orderId: string): Promise<boolean> {
    // Implement business logic to verify user owns order
    // Query database, check permissions, etc.
    return true; // Placeholder
  }
}
```

## [Publishing Events to MQTT Topics]()

Publishing events from controllers, services, use-cases, or event handlers to MQTT topics for distribution to subscribed SSE clients. This section demonstrates how to emit events from different parts of the application, triggering real-time updates across connected frontends.

### When to use?

Publish to MQTT topics after completing business operations that should trigger frontend updates: order status changes, payment confirmations, webhook receptions, background job completions, user notifications, IoT device updates, or any state change requiring instant client notification.

### Publishing from Service

`src/modules/orders/services/orders.service.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject('MQTT_SERVICE')
    private readonly mqttClient: ClientMqtt,
  ) {}

  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    // Update database
    await this.ordersRepository.updateStatus(orderId, newStatus);

    // Publish to MQTT topic for real-time update
    const topic = `orders/${orderId}/status`;
    const payload = {
      orderId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    this.mqttClient.emit(topic, payload);

    // Also notify user directly
    const order = await this.ordersRepository.findById(orderId);
    const userTopic = `notifications/user/${order.userId}`;

    this.mqttClient.emit(userTopic, {
      type: 'ORDER_STATUS_CHANGED',
      message: `Your order #${orderId} is now ${newStatus}`,
      orderId,
      status: newStatus,
    });
  }
}
```

### Publishing from Webhook Handler

`src/modules/payments/controllers/payments-webhook.controller.ts`

```typescript
import { Controller, Post, Body, Headers, Inject } from '@nestjs/common';
import { ClientMqtt } from '@nestjs/microservices';
import { PaymentsWebhookService } from '../services/payments-webhook.service';

@Controller({ path: 'webhooks/payments', version: '1' })
export class PaymentsWebhookController {
  constructor(
    private readonly webhookService: PaymentsWebhookService,
    @Inject('MQTT_SERVICE')
    private readonly mqttClient: ClientMqtt,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    // Validate webhook signature
    const isValid = await this.webhookService.validateStripeSignature(
      payload,
      signature,
    );

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Process webhook event
    const { type, data } = payload;

    if (type === 'payment_intent.succeeded') {
      const paymentIntent = data.object;
      const orderId = paymentIntent.metadata.orderId;

      // Update order in database
      await this.webhookService.markOrderAsPaid(orderId);

      // Publish real-time notification via MQTT
      const topic = `orders/${orderId}/payment`;
      this.mqttClient.emit(topic, {
        orderId,
        status: 'paid',
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        timestamp: new Date().toISOString(),
      });

      // Notify user
      const order = await this.webhookService.getOrder(orderId);
      const userTopic = `notifications/user/${order.userId}`;

      this.mqttClient.emit(userTopic, {
        type: 'PAYMENT_CONFIRMED',
        message: 'Your payment has been confirmed!',
        orderId,
      });
    }

    return { received: true };
  }
}
```

## [Frontend SSE Client Implementation]()

React/TypeScript client implementation for consuming SSE endpoints with automatic reconnection, error handling, and state management. This section demonstrates how frontend connects to SSE streams, processes events, and maintains real-time synchronization with backend.

### React Hook for SSE Connection

`src/hooks/useSSE.ts`

```typescript
import { useEffect, useState, useRef } from 'react';

interface SSEOptions {
  url: string;
  token?: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
}

export function useSSE({ url, token, onMessage, onError }: SSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connectSSE = () => {
      const eventUrl = token ? `${url}?token=${token}` : url;
      const eventSource = new EventSource(eventUrl);

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('SSE connected:', url);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        setIsConnected(false);
        setError('Connection lost. Reconnecting...');
        console.error('SSE error:', err);
        onError?.(err);

        // EventSource automatically reconnects
        // But we close and recreate to ensure clean state
        eventSource.close();
        setTimeout(connectSSE, 3000); // Retry after 3s
      };

      eventSourceRef.current = eventSource;
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      eventSourceRef.current?.close();
    };
  }, [url, token]);

  return { isConnected, error };
}
```

### Using SSE Hook in Component

`src/components/OrderTracking.tsx`

```typescript
import React, { useState } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { useAuth } from '@/hooks/useAuth';

interface OrderStatus {
  orderId: string;
  status: string;
  timestamp: string;
}

export function OrderTracking({ orderId }: { orderId: string }) {
  const { token } = useAuth();
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);

  const { isConnected, error } = useSSE({
    url: `http://localhost:3000/v1/notifications/orders/${orderId}/status`,
    token,
    onMessage: (data) => {
      if (data.type === 'order_status') {
        setOrderStatus({
          orderId: data.orderId,
          status: data.status,
          timestamp: data.timestamp,
        });
      }
    },
  });

  return (
    <div>
      <h2>Order Tracking</h2>

      {!isConnected && <p>Connecting to live updates...</p>}
      {error && <p className="error">{error}</p>}

      {orderStatus && (
        <div>
          <p>Order ID: {orderStatus.orderId}</p>
          <p>Status: {orderStatus.status}</p>
          <p>Updated: {new Date(orderStatus.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
```

### Notifications Component

`src/components/Notifications.tsx`

```typescript
import React, { useState } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  type: string;
  message: string;
  timestamp: string;
}

export function Notifications() {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { isConnected } = useSSE({
    url: `http://localhost:3000/v1/notifications/stream`,
    token,
    onMessage: (data) => {
      const notification: Notification = {
        type: data.type,
        message: data.payload.message,
        timestamp: data.timestamp,
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
    },
  });

  return (
    <div className="notifications">
      <h3>Live Notifications {isConnected ? '🟢' : '🔴'}</h3>

      {notifications.length === 0 && <p>No new notifications</p>}

      <ul>
        {notifications.map((notif, idx) => (
          <li key={idx}>
            <strong>{notif.type}</strong>: {notif.message}
            <small>{new Date(notif.timestamp).toLocaleTimeString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## [Business Rules and Topic Management]()

Centralized management of MQTT topics with business logic enforcement, access control, and topic naming conventions. This ensures security, maintainability, and prevents unauthorized access to sensitive real-time data streams.

### Why Topics Must Stay in Backend

**Security**: Frontend cannot be trusted with direct MQTT access. Topics might contain sensitive patterns revealing business logic or user data structures.

**Authorization**: Backend validates user permissions before subscribing to topics, preventing unauthorized data access.

**Business Logic**: Topic selection depends on database queries, user roles, and complex rules that must execute server-side.

**Scalability**: Centralizing subscriptions allows backend to optimize connections and implement caching strategies.

### Topic Naming Conventions

```typescript
// User-specific topics
notifications/user/{userId}           // User notifications
notifications/user/{userId}/orders    // User's order updates
notifications/user/{userId}/messages  // User's messages

// Entity-specific topics
orders/{orderId}/status               // Order status updates
orders/{orderId}/payment              // Order payment updates
orders/{orderId}/shipping             // Order shipping updates

// Domain-specific topics
warehouse/inventory/{productId}       // Product inventory changes
iot/devices/{deviceId}/status         // IoT device status
analytics/dashboard/sales             // Real-time sales metrics

// Webhook-triggered topics
webhooks/stripe/events                // Stripe webhook events
webhooks/shipping/tracking            // Shipping provider updates
```

### Topic Authorization Service

`src/common/mqtt/services/mqtt-authorization.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@/modules/users/repositories/users.repository';
import { OrdersRepository } from '@/modules/orders/repositories/orders.repository';

@Injectable()
export class MqttAuthorizationService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  /**
   * Validate if user can subscribe to a specific topic
   */
  async canSubscribeToTopic(userId: string, topic: string): Promise<boolean> {
    // User's own notifications - always allowed
    if (topic === `notifications/user/${userId}`) {
      return true;
    }

    // Order topics - validate user owns order
    const orderIdMatch = topic.match(/^orders\/([^/]+)\//);
    if (orderIdMatch) {
      const orderId = orderIdMatch[1];
      const order = await this.ordersRepository.findById(orderId);
      return order?.userId === userId;
    }

    // Admin-only topics
    if (topic.startsWith('analytics/') || topic.startsWith('warehouse/')) {
      const user = await this.usersRepository.findById(userId);
      return user?.role === 'admin';
    }

    // Deny by default
    return false;
  }

  /**
   * Get list of topics user should auto-subscribe to
   */
  async getUserAutoSubscribeTopics(userId: string): Promise<string[]> {
    const topics: string[] = [
      `notifications/user/${userId}`,
      `notifications/user/${userId}/orders`,
    ];

    // Add role-based topics
    const user = await this.usersRepository.findById(userId);
    if (user?.role === 'admin') {
      topics.push('analytics/dashboard/sales');
      topics.push('warehouse/inventory/alerts');
    }

    return topics;
  }
}
```

## [Integration with RabbitMQ Events]()

Bridging RabbitMQ events to MQTT topics for real-time frontend distribution. This pattern allows backend services to publish events via RabbitMQ for internal processing, while automatically forwarding relevant events to MQTT for SSE client consumption.

### When to use?

Use this integration when you already have RabbitMQ for backend event-driven architecture and want to expose specific events to frontend via SSE/MQTT without duplicating event publishing logic.

### RabbitMQ to MQTT Bridge Service

`src/common/bridges/rabbitmq-mqtt.bridge.ts`

```typescript
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientMqtt, EventPattern } from '@nestjs/microservices';

@Injectable()
export class RabbitMqMqttBridge implements OnModuleInit {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitMqClient: ClientProxy,
    @Inject('MQTT_SERVICE')
    private readonly mqttClient: ClientMqtt,
  ) {}

  async onModuleInit() {
    await this.mqttClient.connect();
  }

  /**
   * Listen to RabbitMQ events and forward to MQTT
   */
  @EventPattern('order.status.changed')
  async handleOrderStatusChanged(data: any) {
    const { orderId, status, userId } = data;

    // Forward to MQTT for SSE clients
    const mqttTopic = `orders/${orderId}/status`;
    this.mqttClient.emit(mqttTopic, {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });

    // Also notify user directly
    const userTopic = `notifications/user/${userId}`;
    this.mqttClient.emit(userTopic, {
      type: 'ORDER_STATUS_CHANGED',
      orderId,
      status,
    });
  }

  @EventPattern('payment.completed')
  async handlePaymentCompleted(data: any) {
    const { orderId, userId, amount } = data;

    const userTopic = `notifications/user/${userId}`;
    this.mqttClient.emit(userTopic, {
      type: 'PAYMENT_COMPLETED',
      message: `Payment of ${amount} confirmed`,
      orderId,
    });
  }

  @EventPattern('webhook.received')
  async handleWebhookReceived(data: any) {
    const { source, event, payload } = data;

    // Forward webhook events to monitoring dashboard
    const adminTopic = 'analytics/dashboard/webhooks';
    this.mqttClient.emit(adminTopic, {
      source,
      event,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Registering the Bridge

`src/common/bridges/bridges.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RabbitMqMqttBridge } from './rabbitmq-mqtt.bridge';

@Module({
  providers: [RabbitMqMqttBridge],
  exports: [RabbitMqMqttBridge],
})
export class BridgesModule {}
```

## [Performance and Scalability Considerations]()

Strategies for optimizing SSE/MQTT architecture in production environments, including connection management, message filtering, load balancing, and monitoring to ensure reliable real-time communication at scale.

### Connection Limits

**Problem**: Each SSE connection is a persistent HTTP connection. Too many can exhaust server resources.

**Solution**:
```typescript
// Implement connection pooling and limits
@Injectable()
export class ConnectionManager {
  private connections = new Map<string, Set<Response>>();
  private readonly MAX_CONNECTIONS_PER_USER = 5;

  addConnection(userId: string, response: Response): boolean {
    const userConnections = this.connections.get(userId) || new Set();

    if (userConnections.size >= this.MAX_CONNECTIONS_PER_USER) {
      return false; // Reject connection
    }

    userConnections.add(response);
    this.connections.set(userId, userConnections);
    return true;
  }

  removeConnection(userId: string, response: Response): void {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(response);
    }
  }
}
```

### Message Filtering

**Problem**: Broadcasting all events to all clients wastes bandwidth.

**Solution**: Implement server-side filtering based on user subscriptions.

```typescript
@Injectable()
export class NotificationFilterService {
  // Only send events user is interested in
  shouldSendToUser(userId: string, event: any): boolean {
    // Check user preferences
    // Filter by event type
    // Apply business rules
    return true;
  }
}
```

### MQTT QoS Levels

```typescript
// Configure Quality of Service levels
const mqttOptions = {
  qos: 1, // At least once delivery
  retain: false, // Don't retain messages
};

this.mqttClient.emit(topic, payload, mqttOptions);
```

### Load Balancing with Sticky Sessions

SSE connections must stick to the same backend instance. Configure load balancer:

```nginx
upstream backend {
  ip_hash; # Sticky sessions based on IP
  server backend1:3000;
  server backend2:3000;
  server backend3:3000;
}
```

### Monitoring and Health Checks

```typescript
@Injectable()
export class SseHealthService {
  private activeConnections = 0;

  @Get('health/sse')
  getHealth() {
    return {
      status: 'ok',
      activeConnections: this.activeConnections,
      mqttConnected: this.mqttClient.isConnected(),
    };
  }
}
```

## [Testing Real-Time Features]()

Testing strategies for SSE/MQTT integrations including unit tests for services, integration tests for end-to-end flows, and manual testing tools for development.

### Unit Testing SSE Service

`src/modules/notifications/services/notifications-sse.service.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { NotificationsSseService } from './notifications-sse.service';

describe('NotificationsSseService', () => {
  let service: NotificationsSseService;
  let mqttClient: any;

  beforeEach(async () => {
    const mockSubscription = {
      subscribe: jest.fn((callback) => {
        // Simulate MQTT message after 100ms
        setTimeout(() => {
          callback({ message: 'Test notification' });
        }, 100);
        return { unsubscribe: jest.fn() };
      }),
      unsubscribe: jest.fn(),
    };

    mqttClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockReturnValue(mockSubscription),
    };

    const module = await Test.createTestingModule({
      providers: [
        NotificationsSseService,
        { provide: 'MQTT_SERVICE', useValue: mqttClient },
      ],
    }).compile();

    service = module.get<NotificationsSseService>(NotificationsSseService);
    await service.onModuleInit();
  });

  it('should subscribe to user notifications', async () => {
    const userId = 'user123';
    const generator = service.subscribeToUserNotifications(userId);

    expect(mqttClient.subscribe).toHaveBeenCalledWith(
      `notifications/user/${userId}`,
    );

    // Test async generator yields events
    const result = await generator.next();
    expect(result.value).toHaveProperty('data');
    expect(result.value.data).toHaveProperty('type', 'notification');
  });
});
```

### Manual Testing with curl

```bash
# Test SSE endpoint
curl -N \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/v1/notifications/stream

# Publish test message via MQTT CLI
mosquitto_pub -h localhost -p 1883 \
  -t "notifications/user/user123" \
  -m '{"type":"TEST","message":"Hello"}'
```

### Integration Testing

```typescript
describe('SSE Integration', () => {
  it('should receive MQTT messages via SSE', async () => {
    const app = await createTestApp();
    const userId = 'user123';

    // Connect SSE client
    const events = [];
    const eventSource = new EventSourcePolyfill(
      `http://localhost:3000/v1/notifications/stream`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    eventSource.onmessage = (event) => {
      events.push(JSON.parse(event.data));
    };

    // Publish MQTT message
    await publishMqttMessage(`notifications/user/${userId}`, {
      type: 'TEST',
      message: 'Integration test',
    });

    // Wait and verify
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'notification' });

    eventSource.close();
  });
});
```

## [Common Use Cases and Patterns]()

Real-world scenarios demonstrating practical applications of SSE/MQTT architecture for instant frontend reactivity to backend events.

### Use Case 1: Order Status Tracking

**Scenario**: Customer places order and tracks status in real-time as it moves through processing, payment, fulfillment, and shipping.

**Implementation**:
```typescript
// Backend publishes status changes
async processOrder(orderId: string) {
  await this.updateStatus(orderId, 'PROCESSING');
  this.publishStatus(orderId, 'PROCESSING');

  await this.chargePayment(orderId);
  this.publishStatus(orderId, 'PAID');

  await this.fulfillOrder(orderId);
  this.publishStatus(orderId, 'FULFILLED');

  await this.shipOrder(orderId);
  this.publishStatus(orderId, 'SHIPPED');
}

private publishStatus(orderId: string, status: string) {
  this.mqttClient.emit(`orders/${orderId}/status`, { status });
}
```

### Use Case 2: Live Dashboard Metrics

**Scenario**: Admin dashboard displays real-time sales, active users, and system metrics without polling.

**Implementation**:
```typescript
// Publish metrics every second
setInterval(() => {
  const metrics = {
    activeSessions: this.getActiveSessions(),
    salesLastHour: this.getSalesLastHour(),
    ordersInProgress: this.getOrdersInProgress(),
  };

  this.mqttClient.emit('analytics/dashboard/sales', metrics);
}, 1000);
```

### Use Case 3: Webhook to Frontend Notification

**Scenario**: Stripe payment webhook triggers instant confirmation to customer browsing site.

**Implementation**:
```typescript
@Post('webhooks/stripe')
async handleStripeWebhook(@Body() payload: any) {
  if (payload.type === 'payment_intent.succeeded') {
    const orderId = payload.data.object.metadata.orderId;
    const userId = await this.getUserIdFromOrder(orderId);

    // Instant notification to customer's browser
    this.mqttClient.emit(`notifications/user/${userId}`, {
      type: 'PAYMENT_SUCCESS',
      message: 'Payment confirmed! Your order is being processed.',
    });
  }
}
```

### Use Case 4: IoT Device Status

**Scenario**: IoT devices report status to MQTT, backend forwards to dashboard for real-time monitoring.

**Implementation**:
```typescript
// Device publishes to MQTT directly
// Backend subscribes and forwards to SSE clients

@EventPattern('iot/devices/+/status')
async handleDeviceStatus(data: any, context: any) {
  const deviceId = context.getPattern().split('/')[2];

  // Forward to admin dashboard
  this.mqttClient.emit('analytics/dashboard/iot', {
    deviceId,
    ...data,
  });

  // Alert if device offline
  if (data.status === 'offline') {
    this.mqttClient.emit('notifications/user/admin', {
      type: 'DEVICE_ALERT',
      message: `Device ${deviceId} is offline`,
    });
  }
}
```

## [Troubleshooting Common Issues]()

Solutions to frequent problems encountered when implementing SSE/MQTT architecture.

### Issue: SSE Connection Drops Frequently

**Symptoms**: Frontend reconnects constantly, events are missed.

**Causes & Solutions**:
```typescript
// 1. Add keepalive heartbeat
setInterval(() => {
  response.write(': heartbeat\n\n'); // SSE comment = keepalive
}, 15000); // Every 15s

// 2. Configure reverse proxy timeouts
// Nginx config:
proxy_read_timeout 300s;
proxy_send_timeout 300s;
proxy_buffering off; // Critical for SSE
```

### Issue: MQTT Messages Not Reaching SSE Clients

**Symptoms**: MQTT publishes succeed but SSE clients don't receive events.

**Debug checklist**:
```typescript
// 1. Verify MQTT subscription
console.log('Subscribing to:', topic);
this.mqttClient.subscribe(topic).subscribe(
  (msg) => console.log('Received:', msg),
  (err) => console.error('Subscribe error:', err),
);

// 2. Check topic matching (wildcards)
'notifications/user/+' matches 'notifications/user/123'
'notifications/#' matches 'notifications/user/123/orders'

// 3. Verify SSE stream is active
response.on('close', () => {
  console.log('SSE client disconnected');
  // Cleanup subscriptions
});
```

### Issue: Memory Leak from Dangling Subscriptions

**Symptoms**: Memory usage grows over time, backend slows down.

**Solution**: Proper cleanup on disconnect.

```typescript
@Sse('stream')
async *streamNotifications(@Req() request: Request): AsyncGenerator<MessageEvent> {
  const userId = request.user?.id;
  let isConnected = true;

  // Cleanup on disconnect
  request.on('close', () => {
    isConnected = false;
    console.log('SSE client disconnected');
    // Service will handle MQTT unsubscribe
  });

  // Stream events while connected
  const generator = this.service.subscribeToUserNotifications(userId);

  while (isConnected) {
    const result = await generator.next();
    if (result.done) break;
    yield result.value;
  }

  // Cleanup generator
  await generator.return();
}
```

### Issue: CORS Errors with SSE

**Symptoms**: Browser blocks SSE connection with CORS error.

**Solution**: Configure CORS for EventSource.

```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## [Security Best Practices]()

Security guidelines for protecting SSE/MQTT architecture from unauthorized access, injection attacks, and data leaks.

### Authentication on SSE Endpoints

```typescript
@Controller('notifications')
@UseGuards(JwtAuthGuard) // Require JWT
export class NotificationsSseController {
  @Sse('stream')
  stream(@Req() request: Request) {
    const userId = request.user.id; // From JWT
    return this.service.subscribeForUser(userId);
  }
}
```

### Authorization for Topic Access

```typescript
// Validate BEFORE subscribing
const canAccess = await this.authService.canAccessTopic(userId, topic);
if (!canAccess) {
  throw new ForbiddenException('Access denied');
}
```

### Input Sanitization

```typescript
// Sanitize topic names to prevent injection
function sanitizeTopic(topic: string): string {
  return topic.replace(/[^a-zA-Z0-9/_-]/g, '');
}
```

### Rate Limiting

```typescript
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 connections per minute
@Sse('stream')
stream() { ... }
```

### Avoid Exposing Sensitive Data

```typescript
// Bad: Exposing internal IDs and structure
const topic = `internal/user/${userId}/transactions`;

// Good: Abstract implementation details
const topic = `notifications/user/${userId}`;
```

## [Related Documentation]()

See also:
- [How to use RabbitMQ in Backend](./how-to-use-rabbitmq-backend.md) - Event-driven architecture with message queuing
- [How to Integrate External APIs in Backend](./how-to-integrate-external-api-backend.md#webhook-implementation---receiving-external-api-events) - Webhook reception patterns
- [How to Create an API in the Backend](./how-to-create-api-backend.md) - REST API structure and controller patterns
- [How to Create Use-Cases in NestJS Backend](./how-to-create-use-case-backend.md) - Business logic organization

## [References and Documentation]()

- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [MQTT Protocol Documentation](https://mqtt.org/mqtt-specification/)
- [NestJS Microservices - MQTT](https://docs.nestjs.com/microservices/mqtt)
- [Eclipse Mosquitto](https://mosquitto.org/documentation/)
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
