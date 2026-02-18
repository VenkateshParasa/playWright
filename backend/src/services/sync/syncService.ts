import { EventEmitter } from 'events';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

export interface SyncJob {
  id: string;
  type: 'salesforce' | 'hubspot' | 'zoho' | 'workday' | 'sap' | 'azure_ad' | 'google';
  action: 'sync_users' | 'sync_contacts' | 'sync_enrollments' | 'sync_learning_records';
  data: any;
  priority?: number;
  retryAttempts?: number;
}

export interface SyncResult {
  jobId: string;
  status: 'completed' | 'failed' | 'pending';
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

export interface SyncConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  concurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class SyncService extends EventEmitter {
  private syncQueue: Queue;
  private worker: Worker;
  private redis: Redis;
  private config: SyncConfig;

  constructor(config: SyncConfig) {
    super();
    this.config = {
      ...config,
      concurrency: config.concurrency || 5,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 5000,
    };

    // Initialize Redis connection
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
    });

    // Initialize BullMQ queue
    this.syncQueue = new Queue('integration-sync', {
      connection: this.redis,
    });

    // Initialize worker
    this.worker = new Worker(
      'integration-sync',
      async (job: Job) => await this.processJob(job),
      {
        connection: this.redis,
        concurrency: this.config.concurrency,
      }
    );

    this.setupWorkerListeners();
  }

  /**
   * Add sync job to queue
   */
  async addSyncJob(job: SyncJob): Promise<string> {
    try {
      const queueJob = await this.syncQueue.add(
        job.type,
        job,
        {
          priority: job.priority || 10,
          attempts: job.retryAttempts || this.config.retryAttempts,
          backoff: {
            type: 'exponential',
            delay: this.config.retryDelay,
          },
        }
      );

      this.emit('job_added', { jobId: queueJob.id, type: job.type });
      return queueJob.id!;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to add sync job: ${error.message}`);
    }
  }

  /**
   * Process sync job
   */
  private async processJob(job: Job<SyncJob>): Promise<SyncResult> {
    const startTime = new Date();
    const result: SyncResult = {
      jobId: job.id!,
      status: 'pending',
      recordsProcessed: 0,
      recordsFailed: 0,
      errors: [],
      startTime,
    };

    try {
      this.emit('job_started', { jobId: job.id, type: job.data.type });

      // Process based on integration type
      switch (job.data.type) {
        case 'salesforce':
          await this.processSalesforceSync(job.data, result);
          break;
        case 'hubspot':
          await this.processHubSpotSync(job.data, result);
          break;
        case 'zoho':
          await this.processZohoSync(job.data, result);
          break;
        case 'workday':
          await this.processWorkdaySync(job.data, result);
          break;
        case 'sap':
          await this.processSAPSync(job.data, result);
          break;
        case 'azure_ad':
          await this.processAzureADSync(job.data, result);
          break;
        case 'google':
          await this.processGoogleSync(job.data, result);
          break;
        default:
          throw new Error(`Unknown sync type: ${job.data.type}`);
      }

      result.status = 'completed';
      result.endTime = new Date();

      this.emit('job_completed', result);
      return result;
    } catch (error) {
      result.status = 'failed';
      result.errors.push(error.message);
      result.endTime = new Date();

      this.emit('job_failed', result);
      throw error;
    }
  }

  /**
   * Process Salesforce sync
   */
  private async processSalesforceSync(job: SyncJob, result: SyncResult): Promise<void> {
    // Implementation would integrate with SalesforceClient
    // This is a placeholder for the actual implementation
    const { action, data } = job;

    switch (action) {
      case 'sync_contacts':
        // Sync contacts from platform to Salesforce
        result.recordsProcessed = data.contacts?.length || 0;
        break;
      case 'sync_enrollments':
        // Sync course enrollments to Salesforce
        result.recordsProcessed = data.enrollments?.length || 0;
        break;
      default:
        throw new Error(`Unknown Salesforce action: ${action}`);
    }
  }

  /**
   * Process HubSpot sync
   */
  private async processHubSpotSync(job: SyncJob, result: SyncResult): Promise<void> {
    const { action, data } = job;

    switch (action) {
      case 'sync_contacts':
        result.recordsProcessed = data.contacts?.length || 0;
        break;
      default:
        throw new Error(`Unknown HubSpot action: ${action}`);
    }
  }

  /**
   * Process Zoho sync
   */
  private async processZohoSync(job: SyncJob, result: SyncResult): Promise<void> {
    const { action, data } = job;

    switch (action) {
      case 'sync_contacts':
        result.recordsProcessed = data.contacts?.length || 0;
        break;
      default:
        throw new Error(`Unknown Zoho action: ${action}`);
    }
  }

  /**
   * Process Workday sync
   */
  private async processWorkdaySync(job: SyncJob, result: SyncResult): Promise<void> {
    const { action, data } = job;

    switch (action) {
      case 'sync_users':
        result.recordsProcessed = data.users?.length || 0;
        break;
      case 'sync_learning_records':
        result.recordsProcessed = data.records?.length || 0;
        break;
      default:
        throw new Error(`Unknown Workday action: ${action}`);
    }
  }

  /**
   * Process SAP sync
   */
  private async processSAPSync(job: SyncJob, result: SyncResult): Promise<void> {
    const { action, data } = job;

    switch (action) {
      case 'sync_users':
        result.recordsProcessed = data.users?.length || 0;
        break;
      case 'sync_learning_records':
        result.recordsProcessed = data.records?.length || 0;
        break;
      default:
        throw new Error(`Unknown SAP action: ${action}`);
    }
  }

  /**
   * Process Azure AD sync
   */
  private async processAzureADSync(job: SyncJob, result: SyncResult): Promise<void> {
    const { action, data } = job;

    switch (action) {
      case 'sync_users':
        result.recordsProcessed = data.users?.length || 0;
        break;
      default:
        throw new Error(`Unknown Azure AD action: ${action}`);
    }
  }

  /**
   * Process Google sync
   */
  private async processGoogleSync(job: SyncJob, result: SyncResult): Promise<void> {
    const { action, data } = job;

    switch (action) {
      case 'sync_users':
        result.recordsProcessed = data.users?.length || 0;
        break;
      default:
        throw new Error(`Unknown Google action: ${action}`);
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.syncQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      progress: await job.progress(),
      state: await job.getState(),
      returnValue: job.returnvalue,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
    };
  }

  /**
   * Get all jobs
   */
  async getAllJobs(status?: 'completed' | 'failed' | 'active' | 'waiting'): Promise<any[]> {
    const jobs = status
      ? await this.syncQueue.getJobs([status])
      : await this.syncQueue.getJobs(['completed', 'failed', 'active', 'waiting']);

    return Promise.all(
      jobs.map(async job => ({
        id: job.id,
        name: job.name,
        data: job.data,
        state: await job.getState(),
        timestamp: job.timestamp,
        finishedOn: job.finishedOn,
      }))
    );
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = await this.syncQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    await job.remove();
    this.emit('job_cancelled', jobId);
  }

  /**
   * Retry failed job
   */
  async retryJob(jobId: string): Promise<void> {
    const job = await this.syncQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    await job.retry();
    this.emit('job_retried', jobId);
  }

  /**
   * Setup worker event listeners
   */
  private setupWorkerListeners(): void {
    this.worker.on('completed', (job: Job, result: SyncResult) => {
      this.emit('worker_completed', { jobId: job.id, result });
    });

    this.worker.on('failed', (job: Job | undefined, error: Error) => {
      this.emit('worker_failed', { jobId: job?.id, error: error.message });
    });

    this.worker.on('error', (error: Error) => {
      this.emit('worker_error', error);
    });
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics(): Promise<any> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.syncQueue.getWaitingCount(),
      this.syncQueue.getActiveCount(),
      this.syncQueue.getCompletedCount(),
      this.syncQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    };
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    await this.syncQueue.clean(olderThanMs, 1000, 'completed');
    await this.syncQueue.clean(olderThanMs, 1000, 'failed');
    this.emit('jobs_cleaned');
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.worker.close();
    await this.syncQueue.close();
    await this.redis.quit();
    this.emit('closed');
  }
}

export default SyncService;
