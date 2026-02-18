/**
 * Microservices Architecture Configuration
 * Service mesh, discovery, and inter-service communication
 */

import { EventEmitter } from 'events';

// Service Registry
export interface ServiceDefinition {
  name: string;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc';
  healthEndpoint: string;
  metadata: Record<string, any>;
}

export class ServiceRegistry extends EventEmitter {
  private services: Map<string, ServiceDefinition[]> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startHealthChecks();
  }

  register(service: ServiceDefinition): void {
    const existing = this.services.get(service.name) || [];
    existing.push(service);
    this.services.set(service.name, existing);
    this.emit('service:registered', service);
    console.log(`Service registered: ${service.name}@${service.version}`);
  }

  deregister(serviceName: string, host: string, port: number): void {
    const services = this.services.get(serviceName);
    if (services) {
      const filtered = services.filter(s => !(s.host === host && s.port === port));
      this.services.set(serviceName, filtered);
      this.emit('service:deregistered', { serviceName, host, port });
      console.log(`Service deregistered: ${serviceName} at ${host}:${port}`);
    }
  }

  discover(serviceName: string, version?: string): ServiceDefinition | null {
    const services = this.services.get(serviceName);
    if (!services || services.length === 0) return null;

    // Filter by version if specified
    const candidates = version
      ? services.filter(s => s.version === version)
      : services;

    if (candidates.length === 0) return null;

    // Round-robin load balancing
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  getAll(serviceName: string): ServiceDefinition[] {
    return this.services.get(serviceName) || [];
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const [serviceName, services] of this.services.entries()) {
        for (const service of services) {
          try {
            const url = `${service.protocol}://${service.host}:${service.port}${service.healthEndpoint}`;
            const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });

            if (!response.ok) {
              this.emit('service:unhealthy', service);
              this.deregister(serviceName, service.host, service.port);
            }
          } catch (error) {
            this.emit('service:unhealthy', service);
            this.deregister(serviceName, service.host, service.port);
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Circuit Breaker Pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000,
    private readonly resetTimeout: number = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime! > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.timeout)
        ),
      ]);

      if (this.state === 'HALF_OPEN') {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.warn(`Circuit breaker opened after ${this.failures} failures`);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
    console.log('Circuit breaker reset to CLOSED state');
  }

  getState(): string {
    return this.state;
  }
}

// Service Client with Circuit Breaker
export class ServiceClient {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  constructor(private registry: ServiceRegistry) {}

  async call<T>(
    serviceName: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const service = this.registry.discover(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    const breaker = this.getOrCreateCircuitBreaker(serviceName);
    const url = `${service.protocol}://${service.host}:${service.port}${endpoint}`;

    return await breaker.execute(async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Name': 'api-gateway',
          'X-Request-ID': this.generateRequestId(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Service call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    });
  }

  private getOrCreateCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker());
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Service Mesh Configuration
export const SERVICE_DEFINITIONS = {
  AUTH: {
    name: 'auth-service',
    port: 3001,
    healthEndpoint: '/health',
  },
  CONTENT: {
    name: 'content-service',
    port: 3002,
    healthEndpoint: '/health',
  },
  ANALYTICS: {
    name: 'analytics-service',
    port: 3003,
    healthEndpoint: '/health',
  },
  NOTIFICATION: {
    name: 'notification-service',
    port: 3004,
    healthEndpoint: '/health',
  },
  USER: {
    name: 'user-service',
    port: 3005,
    healthEndpoint: '/health',
  },
  GAMIFICATION: {
    name: 'gamification-service',
    port: 3006,
    healthEndpoint: '/health',
  },
};

// API Gateway Configuration
export const API_GATEWAY_CONFIG = {
  port: 3000,
  timeout: 30000,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  routes: [
    { path: '/api/auth', service: 'auth-service' },
    { path: '/api/content', service: 'content-service' },
    { path: '/api/analytics', service: 'analytics-service' },
    { path: '/api/notifications', service: 'notification-service' },
    { path: '/api/users', service: 'user-service' },
    { path: '/api/gamification', service: 'gamification-service' },
  ],
};

// Singleton instances
export const serviceRegistry = new ServiceRegistry();
export const serviceClient = new ServiceClient(serviceRegistry);

// Service mesh initialization
export function initializeServiceMesh(): void {
  const host = process.env.SERVICE_HOST || 'localhost';
  const protocol = (process.env.SERVICE_PROTOCOL as 'http' | 'https') || 'http';

  Object.values(SERVICE_DEFINITIONS).forEach(def => {
    serviceRegistry.register({
      ...def,
      version: '1.0.0',
      host,
      protocol,
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        region: process.env.AWS_REGION || 'us-east-1',
      },
    });
  });

  // Listen for service events
  serviceRegistry.on('service:unhealthy', (service) => {
    console.error(`Service unhealthy: ${service.name} at ${service.host}:${service.port}`);
  });

  serviceRegistry.on('service:registered', (service) => {
    console.log(`Service registered: ${service.name}@${service.version}`);
  });

  console.log('Service mesh initialized');
}

// Graceful shutdown
export function shutdownServiceMesh(): void {
  serviceRegistry.shutdown();
  console.log('Service mesh shutdown complete');
}
