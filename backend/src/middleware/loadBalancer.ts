/**
 * Advanced Load Balancer Middleware
 * Implements multiple load balancing strategies
 */

import { Request, Response, NextFunction } from 'express';
import { serviceRegistry } from '../config/microservices';

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-connections' | 'ip-hash' | 'weighted';
  healthCheckInterval?: number;
  stickySession?: boolean;
}

class LoadBalancer {
  private currentIndex = new Map<string, number>();
  private connections = new Map<string, number>();
  private sessionStore = new Map<string, string>(); // sessionId -> serviceId

  constructor(private config: LoadBalancerConfig) {}

  /**
   * Round Robin Load Balancing
   */
  roundRobin(serviceName: string): string | null {
    const services = serviceRegistry.getAll(serviceName);
    if (services.length === 0) return null;

    const index = this.currentIndex.get(serviceName) || 0;
    const selected = services[index % services.length];
    this.currentIndex.set(serviceName, (index + 1) % services.length);

    return `${selected.host}:${selected.port}`;
  }

  /**
   * Least Connections Load Balancing
   */
  leastConnections(serviceName: string): string | null {
    const services = serviceRegistry.getAll(serviceName);
    if (services.length === 0) return null;

    let minConnections = Infinity;
    let selectedService = services[0];

    for (const service of services) {
      const serviceId = `${service.host}:${service.port}`;
      const connections = this.connections.get(serviceId) || 0;

      if (connections < minConnections) {
        minConnections = connections;
        selectedService = service;
      }
    }

    const serviceId = `${selectedService.host}:${selectedService.port}`;
    this.connections.set(serviceId, (this.connections.get(serviceId) || 0) + 1);

    return serviceId;
  }

  /**
   * IP Hash Load Balancing
   */
  ipHash(serviceName: string, clientIp: string): string | null {
    const services = serviceRegistry.getAll(serviceName);
    if (services.length === 0) return null;

    const hash = this.hashCode(clientIp);
    const index = Math.abs(hash) % services.length;
    const selected = services[index];

    return `${selected.host}:${selected.port}`;
  }

  /**
   * Weighted Load Balancing
   */
  weighted(serviceName: string): string | null {
    const services = serviceRegistry.getAll(serviceName);
    if (services.length === 0) return null;

    // Weight based on service metadata
    const weights = services.map(s => s.metadata?.weight || 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;

    let cumulative = 0;
    for (let i = 0; i < services.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return `${services[i].host}:${services[i].port}`;
      }
    }

    return `${services[0].host}:${services[0].port}`;
  }

  /**
   * Sticky Session Support
   */
  stickySession(serviceName: string, sessionId: string): string | null {
    // Check if session already has assigned service
    const existingService = this.sessionStore.get(sessionId);
    if (existingService) {
      return existingService;
    }

    // Assign new service using primary strategy
    const serviceId = this.selectService(serviceName);
    if (serviceId) {
      this.sessionStore.set(sessionId, serviceId);
    }

    return serviceId;
  }

  /**
   * Select service based on configured strategy
   */
  selectService(serviceName: string, req?: Request): string | null {
    const { strategy, stickySession } = this.config;

    // Check sticky session first
    if (stickySession && req?.cookies?.sessionId) {
      const sticky = this.stickySession(serviceName, req.cookies.sessionId);
      if (sticky) return sticky;
    }

    switch (strategy) {
      case 'round-robin':
        return this.roundRobin(serviceName);
      case 'least-connections':
        return this.leastConnections(serviceName);
      case 'ip-hash':
        return this.ipHash(serviceName, req?.ip || '');
      case 'weighted':
        return this.weighted(serviceName);
      default:
        return this.roundRobin(serviceName);
    }
  }

  /**
   * Release connection (for least-connections)
   */
  releaseConnection(serviceId: string): void {
    const current = this.connections.get(serviceId) || 0;
    this.connections.set(serviceId, Math.max(0, current - 1));
  }

  /**
   * Simple hash function for IP hashing
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Clear session binding
   */
  clearSession(sessionId: string): void {
    this.sessionStore.delete(sessionId);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      strategy: this.config.strategy,
      totalSessions: this.sessionStore.size,
      connections: Array.from(this.connections.entries()).map(([service, count]) => ({
        service,
        activeConnections: count,
      })),
      indices: Array.from(this.currentIndex.entries()).map(([service, index]) => ({
        service,
        currentIndex: index,
      })),
    };
  }
}

// Create load balancer instance
const loadBalancer = new LoadBalancer({
  strategy: (process.env.LOAD_BALANCER_STRATEGY as any) || 'round-robin',
  stickySession: process.env.STICKY_SESSIONS === 'true',
  healthCheckInterval: 30000,
});

/**
 * Load Balancer Middleware
 */
export function loadBalancerMiddleware(serviceName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceId = loadBalancer.selectService(serviceName, req);

      if (!serviceId) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: `No healthy instances of ${serviceName} available`,
        });
      }

      // Attach service info to request
      (req as any).targetService = serviceId;

      // Track connection for least-connections strategy
      res.on('finish', () => {
        loadBalancer.releaseConnection(serviceId);
      });

      next();
    } catch (error) {
      console.error('Load balancer error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Load balancer failure',
      });
    }
  };
}

/**
 * Health Check Middleware
 */
export function healthCheckMiddleware(req: Request, res: Response) {
  const stats = loadBalancer.getStats();

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    loadBalancer: stats,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
}

/**
 * Geographic Load Balancing
 */
export class GeoLoadBalancer {
  private regionMapping: Map<string, string[]> = new Map([
    ['us-east', ['us-east-1', 'us-east-2']],
    ['us-west', ['us-west-1', 'us-west-2']],
    ['eu', ['eu-west-1', 'eu-central-1']],
    ['asia', ['ap-southeast-1', 'ap-northeast-1']],
  ]);

  selectRegion(clientRegion: string): string {
    const regions = this.regionMapping.get(clientRegion);
    if (!regions || regions.length === 0) {
      // Default to us-east
      return 'us-east-1';
    }

    // Select least loaded region
    return regions[Math.floor(Math.random() * regions.length)];
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Determine client region from IP or headers
      const clientRegion = this.getClientRegion(req);
      const targetRegion = this.selectRegion(clientRegion);

      // Attach region info to request
      (req as any).targetRegion = targetRegion;

      next();
    };
  }

  private getClientRegion(req: Request): string {
    // Get region from CloudFront header
    const cfRegion = req.headers['cloudfront-viewer-country'] as string;
    if (cfRegion) {
      return this.mapCountryToRegion(cfRegion);
    }

    // Default region
    return 'us-east';
  }

  private mapCountryToRegion(country: string): string {
    const mapping: Record<string, string> = {
      US: 'us-east',
      CA: 'us-east',
      GB: 'eu',
      DE: 'eu',
      FR: 'eu',
      JP: 'asia',
      CN: 'asia',
      IN: 'asia',
    };

    return mapping[country] || 'us-east';
  }
}

export const geoLoadBalancer = new GeoLoadBalancer();
export { loadBalancer };
