import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface SandboxEnvironment {
  id: string;
  userId: string;
  type: 'nodejs' | 'python' | 'java' | 'fullstack' | 'database';
  status: 'creating' | 'running' | 'stopped' | 'error';
  containerId?: string;
  port?: number;
  createdAt: Date;
  expiresAt: Date;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  environment: Record<string, string>;
  volumes?: string[];
}

export interface CreateSandboxRequest {
  userId: string;
  type: SandboxEnvironment['type'];
  template?: string;
  duration?: number; // minutes
  resources?: Partial<SandboxEnvironment['resources']>;
  environment?: Record<string, string>;
}

export interface SandboxFile {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

export interface SandboxCommand {
  command: string;
  workDir?: string;
  timeout?: number;
}

export interface SandboxCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

class SandboxService {
  private sandboxes: Map<string, SandboxEnvironment> = new Map();
  private sandboxDir = '/tmp/sandboxes';
  private portRange = { min: 8000, max: 9000 };
  private usedPorts: Set<number> = new Set();

  constructor() {
    this.initSandboxDir();
    this.startCleanupScheduler();
  }

  private async initSandboxDir(): Promise<void> {
    try {
      await fs.mkdir(this.sandboxDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create sandbox directory:', error);
    }
  }

  /**
   * Create a new sandbox environment
   */
  async createSandbox(request: CreateSandboxRequest): Promise<SandboxEnvironment> {
    const sandboxId = crypto.randomBytes(16).toString('hex');
    const sandboxPath = path.join(this.sandboxDir, sandboxId);

    // Create sandbox directory
    await fs.mkdir(sandboxPath, { recursive: true });

    // Calculate expiration
    const duration = request.duration || 60; // Default 60 minutes
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    // Default resources
    const resources = {
      cpu: request.resources?.cpu || '1',
      memory: request.resources?.memory || '512m',
      storage: request.resources?.storage || '1g',
    };

    const sandbox: SandboxEnvironment = {
      id: sandboxId,
      userId: request.userId,
      type: request.type,
      status: 'creating',
      createdAt: new Date(),
      expiresAt,
      resources,
      environment: request.environment || {},
      volumes: [sandboxPath],
    };

    this.sandboxes.set(sandboxId, sandbox);

    try {
      // Create Docker container based on type
      const containerConfig = this.getContainerConfig(request.type, request.template);
      const port = this.allocatePort();

      const containerId = await this.createDockerContainer(
        sandboxId,
        sandboxPath,
        containerConfig,
        resources,
        port,
        request.environment
      );

      sandbox.containerId = containerId;
      sandbox.port = port;
      sandbox.status = 'running';

      // Initialize template if provided
      if (request.template) {
        await this.initializeTemplate(sandboxId, request.template);
      }

      return sandbox;
    } catch (error) {
      sandbox.status = 'error';
      throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get sandbox by ID
   */
  getSandbox(sandboxId: string): SandboxEnvironment | null {
    return this.sandboxes.get(sandboxId) || null;
  }

  /**
   * Get all sandboxes for a user
   */
  getUserSandboxes(userId: string): SandboxEnvironment[] {
    return Array.from(this.sandboxes.values()).filter((s) => s.userId === userId);
  }

  /**
   * Execute command in sandbox
   */
  async executeCommand(sandboxId: string, command: SandboxCommand): Promise<SandboxCommandResult> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox || !sandbox.containerId) {
      throw new Error('Sandbox not found or not running');
    }

    const workDir = command.workDir || '/workspace';
    const timeout = command.timeout || 30000;

    try {
      const execCommand = `docker exec -w ${workDir} ${sandbox.containerId} sh -c "${command.command}"`;

      const { stdout, stderr } = await execAsync(execCommand, {
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return {
        stdout,
        stderr,
        exitCode: 0,
        success: true,
      };
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || -1,
        success: false,
      };
    }
  }

  /**
   * Write file to sandbox
   */
  async writeFile(sandboxId: string, file: SandboxFile): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox || !sandbox.volumes || sandbox.volumes.length === 0) {
      throw new Error('Sandbox not found or no volumes available');
    }

    const sandboxPath = sandbox.volumes[0];
    const filePath = path.join(sandboxPath, file.path);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write file
    const content = file.encoding === 'base64'
      ? Buffer.from(file.content, 'base64')
      : file.content;

    await fs.writeFile(filePath, content);
  }

  /**
   * Read file from sandbox
   */
  async readFile(sandboxId: string, filePath: string): Promise<string> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox || !sandbox.volumes || sandbox.volumes.length === 0) {
      throw new Error('Sandbox not found or no volumes available');
    }

    const sandboxPath = sandbox.volumes[0];
    const fullPath = path.join(sandboxPath, filePath);

    try {
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  /**
   * List files in sandbox directory
   */
  async listFiles(sandboxId: string, dirPath: string = '/'): Promise<string[]> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox || !sandbox.volumes || sandbox.volumes.length === 0) {
      throw new Error('Sandbox not found or no volumes available');
    }

    const sandboxPath = sandbox.volumes[0];
    const fullPath = path.join(sandboxPath, dirPath);

    try {
      const files = await fs.readdir(fullPath, { withFileTypes: true });
      return files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: path.join(dirPath, file.name),
      })) as any;
    } catch (error) {
      throw new Error(`Failed to list files in: ${dirPath}`);
    }
  }

  /**
   * Delete file from sandbox
   */
  async deleteFile(sandboxId: string, filePath: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox || !sandbox.volumes || sandbox.volumes.length === 0) {
      throw new Error('Sandbox not found or no volumes available');
    }

    const sandboxPath = sandbox.volumes[0];
    const fullPath = path.join(sandboxPath, filePath);

    await fs.rm(fullPath, { recursive: true, force: true });
  }

  /**
   * Stop sandbox
   */
  async stopSandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found');
    }

    if (sandbox.containerId) {
      try {
        await execAsync(`docker stop ${sandbox.containerId}`);
        await execAsync(`docker rm ${sandbox.containerId}`);
      } catch (error) {
        console.error('Failed to stop container:', error);
      }
    }

    if (sandbox.port) {
      this.usedPorts.delete(sandbox.port);
    }

    sandbox.status = 'stopped';
  }

  /**
   * Delete sandbox
   */
  async deleteSandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error('Sandbox not found');
    }

    // Stop container first
    await this.stopSandbox(sandboxId);

    // Delete sandbox files
    if (sandbox.volumes && sandbox.volumes.length > 0) {
      try {
        await fs.rm(sandbox.volumes[0], { recursive: true, force: true });
      } catch (error) {
        console.error('Failed to delete sandbox files:', error);
      }
    }

    this.sandboxes.delete(sandboxId);
  }

  /**
   * Save sandbox state
   */
  async saveSandboxState(sandboxId: string, name: string): Promise<string> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox || !sandbox.containerId) {
      throw new Error('Sandbox not found or not running');
    }

    const imageName = `sandbox-snapshot-${sandboxId}-${Date.now()}`;

    try {
      await execAsync(`docker commit ${sandbox.containerId} ${imageName}`);
      return imageName;
    } catch (error) {
      throw new Error('Failed to save sandbox state');
    }
  }

  /**
   * Restore sandbox from saved state
   */
  async restoreSandboxState(userId: string, snapshotId: string): Promise<SandboxEnvironment> {
    // Implementation for restoring from snapshot
    throw new Error('Not implemented');
  }

  /**
   * Create Docker container for sandbox
   */
  private async createDockerContainer(
    sandboxId: string,
    sandboxPath: string,
    config: any,
    resources: SandboxEnvironment['resources'],
    port: number,
    environment?: Record<string, string>
  ): Promise<string> {
    const containerName = `sandbox-${sandboxId}`;
    const envVars = environment
      ? Object.entries(environment)
          .map(([key, value]) => `-e ${key}="${value}"`)
          .join(' ')
      : '';

    const command = `docker run -d \
      --name ${containerName} \
      -v ${sandboxPath}:/workspace \
      -w /workspace \
      --memory=${resources.memory} \
      --cpus=${resources.cpu} \
      --storage-opt size=${resources.storage} \
      -p ${port}:${config.internalPort} \
      ${envVars} \
      --network bridge \
      --pids-limit=100 \
      ${config.image} \
      ${config.command}`;

    try {
      const { stdout } = await execAsync(command);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to create Docker container: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get container configuration based on sandbox type
   */
  private getContainerConfig(type: SandboxEnvironment['type'], template?: string): any {
    const configs = {
      nodejs: {
        image: 'node:18-alpine',
        internalPort: 3000,
        command: 'tail -f /dev/null',
      },
      python: {
        image: 'python:3.11-alpine',
        internalPort: 8000,
        command: 'tail -f /dev/null',
      },
      java: {
        image: 'openjdk:17-alpine',
        internalPort: 8080,
        command: 'tail -f /dev/null',
      },
      fullstack: {
        image: 'node:18',
        internalPort: 3000,
        command: 'tail -f /dev/null',
      },
      database: {
        image: 'postgres:15-alpine',
        internalPort: 5432,
        command: 'postgres',
      },
    };

    return configs[type] || configs.nodejs;
  }

  /**
   * Initialize template in sandbox
   */
  private async initializeTemplate(sandboxId: string, template: string): Promise<void> {
    const templates: Record<string, string[]> = {
      'express-api': [
        'npm init -y',
        'npm install express cors dotenv',
        'mkdir src',
        'echo "console.log(\'Express API Ready\');" > src/index.js',
      ],
      'react-app': [
        'npx create-react-app .',
      ],
      'python-flask': [
        'pip install flask flask-cors',
        'mkdir app',
        'echo "from flask import Flask\\napp = Flask(__name__)" > app/main.py',
      ],
    };

    const commands = templates[template];
    if (commands) {
      for (const command of commands) {
        await this.executeCommand(sandboxId, { command });
      }
    }
  }

  /**
   * Allocate a port for the sandbox
   */
  private allocatePort(): number {
    for (let port = this.portRange.min; port <= this.portRange.max; port++) {
      if (!this.usedPorts.has(port)) {
        this.usedPorts.add(port);
        return port;
      }
    }
    throw new Error('No available ports');
  }

  /**
   * Cleanup expired sandboxes
   */
  private startCleanupScheduler(): void {
    setInterval(async () => {
      const now = Date.now();
      for (const [sandboxId, sandbox] of this.sandboxes.entries()) {
        if (sandbox.expiresAt.getTime() < now) {
          try {
            await this.deleteSandbox(sandboxId);
            console.log(`Cleaned up expired sandbox: ${sandboxId}`);
          } catch (error) {
            console.error(`Failed to cleanup sandbox ${sandboxId}:`, error);
          }
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Get sandbox statistics
   */
  async getSandboxStats(sandboxId: string): Promise<any> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox || !sandbox.containerId) {
      throw new Error('Sandbox not found or not running');
    }

    try {
      const { stdout } = await execAsync(`docker stats ${sandbox.containerId} --no-stream --format "{{json .}}"`);
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error('Failed to get sandbox statistics');
    }
  }
}

export default new SandboxService();
