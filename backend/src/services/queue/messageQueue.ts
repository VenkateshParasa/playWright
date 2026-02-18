/**
 * Message Queue Service (RabbitMQ & Kafka)
 * Event-driven architecture with CQRS pattern
 */

import { EventEmitter } from 'events';

// Message Queue Interface
export interface Message {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount?: number;
  metadata?: Record<string, any>;
}

export interface QueueConfig {
  durable?: boolean;
  autoDelete?: boolean;
  exclusive?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * RabbitMQ Service (for task queues and work distribution)
 */
export class RabbitMQService extends EventEmitter {
  private connection: any;
  private channel: any;
  private queues: Map<string, QueueConfig> = new Map();
  private deadLetterQueue = 'dlq';

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    try {
      // In production, use amqplib
      const amqp = await import('amqplib');
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Setup dead letter queue
      await this.channel.assertQueue(this.deadLetterQueue, { durable: true });

      this.connection.on('error', (err: Error) => {
        console.error('RabbitMQ connection error:', err);
        this.emit('error', err);
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.emit('close');
      });

      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async createQueue(name: string, config: QueueConfig = {}): Promise<void> {
    const queueConfig = {
      durable: true,
      autoDelete: false,
      exclusive: false,
      maxRetries: 3,
      retryDelay: 5000,
      ...config,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': this.deadLetterQueue,
      },
    };

    await this.channel.assertQueue(name, queueConfig);
    this.queues.set(name, queueConfig);
    console.log(`Queue created: ${name}`);
  }

  async publish(queue: string, message: Message): Promise<boolean> {
    try {
      const content = Buffer.from(JSON.stringify(message));
      return this.channel.sendToQueue(queue, content, {
        persistent: true,
        messageId: message.id,
        timestamp: message.timestamp,
      });
    } catch (error) {
      console.error('Failed to publish message:', error);
      return false;
    }
  }

  async consume(
    queue: string,
    handler: (message: Message) => Promise<void>
  ): Promise<void> {
    await this.channel.consume(
      queue,
      async (msg: any) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Message processing error:', error);

          // Check retry count
          const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1;
          const maxRetries = this.queues.get(queue)?.maxRetries || 3;

          if (retryCount < maxRetries) {
            // Retry with delay
            setTimeout(() => {
              this.channel.nack(msg, false, true);
            }, this.queues.get(queue)?.retryDelay || 5000);
          } else {
            // Send to dead letter queue
            this.channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

/**
 * Kafka Service (for event streaming and real-time data)
 */
export class KafkaService extends EventEmitter {
  private producer: any;
  private consumer: any;
  private admin: any;
  private topics: Set<string> = new Set();

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    try {
      // In production, use kafkajs
      const { Kafka } = await import('kafkajs');

      const kafka = new Kafka({
        clientId: 'playwright-learning-platform',
        brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        ssl: process.env.KAFKA_SSL === 'true',
        sasl: process.env.KAFKA_USERNAME
          ? {
              mechanism: 'plain',
              username: process.env.KAFKA_USERNAME,
              password: process.env.KAFKA_PASSWORD || '',
            }
          : undefined,
      });

      this.producer = kafka.producer();
      this.consumer = kafka.consumer({ groupId: 'learning-platform-group' });
      this.admin = kafka.admin();

      await this.producer.connect();
      await this.consumer.connect();
      await this.admin.connect();

      console.log('Connected to Kafka');
    } catch (error) {
      console.error('Failed to connect to Kafka:', error);
      throw error;
    }
  }

  async createTopic(topic: string, partitions: number = 3, replicationFactor: number = 2): Promise<void> {
    try {
      await this.admin.createTopics({
        topics: [
          {
            topic,
            numPartitions: partitions,
            replicationFactor,
          },
        ],
      });

      this.topics.add(topic);
      console.log(`Topic created: ${topic}`);
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  }

  async publish(topic: string, message: Message): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: message.id,
          value: JSON.stringify(message),
          timestamp: message.timestamp.toString(),
          headers: message.metadata,
        },
      ],
    });
  }

  async subscribe(topic: string, handler: (message: Message) => Promise<void>): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        try {
          const content = JSON.parse(message.value.toString());
          await handler(content);
        } catch (error) {
          console.error('Message processing error:', error);
          this.emit('error', { error, topic, partition, message });
        }
      },
    });
  }

  async close(): Promise<void> {
    await this.producer?.disconnect();
    await this.consumer?.disconnect();
    await this.admin?.disconnect();
  }
}

/**
 * Event Bus (Unified interface for both RabbitMQ and Kafka)
 */
export class EventBus {
  private rabbitmq: RabbitMQService;
  private kafka: KafkaService;
  private eventHandlers: Map<string, Set<(data: any) => Promise<void>>> = new Map();

  constructor() {
    this.rabbitmq = new RabbitMQService();
    this.kafka = new KafkaService();
  }

  async initialize(): Promise<void> {
    try {
      // Connect to both message brokers
      await Promise.all([this.rabbitmq.connect(), this.kafka.connect()]);

      // Create default queues and topics
      await this.setupDefaultChannels();

      console.log('Event bus initialized');
    } catch (error) {
      console.error('Failed to initialize event bus:', error);
      throw error;
    }
  }

  private async setupDefaultChannels(): Promise<void> {
    // RabbitMQ queues for task processing
    await this.rabbitmq.createQueue('user.registration');
    await this.rabbitmq.createQueue('email.notifications');
    await this.rabbitmq.createQueue('report.generation');
    await this.rabbitmq.createQueue('content.processing');

    // Kafka topics for event streaming
    await this.kafka.createTopic('user.events');
    await this.kafka.createTopic('analytics.events');
    await this.kafka.createTopic('gamification.events');
    await this.kafka.createTopic('audit.logs');
  }

  /**
   * Publish task to queue (RabbitMQ)
   */
  async publishTask(queue: string, data: any): Promise<void> {
    const message: Message = {
      id: this.generateId(),
      type: queue,
      payload: data,
      timestamp: Date.now(),
    };

    await this.rabbitmq.publish(queue, message);
  }

  /**
   * Publish event to stream (Kafka)
   */
  async publishEvent(topic: string, data: any): Promise<void> {
    const message: Message = {
      id: this.generateId(),
      type: topic,
      payload: data,
      timestamp: Date.now(),
    };

    await this.kafka.publish(topic, message);
  }

  /**
   * Subscribe to task queue (RabbitMQ)
   */
  async subscribeToQueue(queue: string, handler: (data: any) => Promise<void>): Promise<void> {
    await this.rabbitmq.consume(queue, async (message) => {
      await handler(message.payload);
    });
  }

  /**
   * Subscribe to event stream (Kafka)
   */
  async subscribeToTopic(topic: string, handler: (data: any) => Promise<void>): Promise<void> {
    await this.kafka.subscribe(topic, async (message) => {
      await handler(message.payload);
    });
  }

  /**
   * Local event emitter (in-process events)
   */
  on(event: string, handler: (data: any) => Promise<void>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  async emit(event: string, data: any): Promise<void> {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      await Promise.all(Array.from(handlers).map(handler => handler(data)));
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async close(): Promise<void> {
    await this.rabbitmq.close();
    await this.kafka.close();
  }
}

/**
 * CQRS Pattern Implementation
 */
export class CommandBus {
  private handlers: Map<string, (command: any) => Promise<any>> = new Map();

  register(commandType: string, handler: (command: any) => Promise<any>): void {
    this.handlers.set(commandType, handler);
  }

  async execute(commandType: string, command: any): Promise<any> {
    const handler = this.handlers.get(commandType);
    if (!handler) {
      throw new Error(`No handler registered for command: ${commandType}`);
    }

    return await handler(command);
  }
}

export class QueryBus {
  private handlers: Map<string, (query: any) => Promise<any>> = new Map();

  register(queryType: string, handler: (query: any) => Promise<any>): void {
    this.handlers.set(queryType, handler);
  }

  async execute(queryType: string, query: any): Promise<any> {
    const handler = this.handlers.get(queryType);
    if (!handler) {
      throw new Error(`No handler registered for query: ${queryType}`);
    }

    return await handler(query);
  }
}

// Singleton instances
export const eventBus = new EventBus();
export const commandBus = new CommandBus();
export const queryBus = new QueryBus();

// Event types
export const EventTypes = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  LESSON_COMPLETED: 'lesson.completed',
  ACHIEVEMENT_UNLOCKED: 'achievement.unlocked',
  QUIZ_SUBMITTED: 'quiz.submitted',
  PROGRESS_UPDATED: 'progress.updated',
  CONTENT_CREATED: 'content.created',
  CONTENT_UPDATED: 'content.updated',
};
