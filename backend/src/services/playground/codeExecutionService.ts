import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface CodeExecutionRequest {
  code: string;
  language: string;
  input?: string;
  timeout?: number;
  memoryLimit?: number;
  files?: { name: string; content: string }[];
}

export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  memoryUsed?: number;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}

export interface LanguageConfig {
  extension: string;
  dockerImage: string;
  compileCommand?: string;
  runCommand: string;
  timeout: number;
  memoryLimit: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  javascript: {
    extension: 'js',
    dockerImage: 'node:18-alpine',
    runCommand: 'node {file}',
    timeout: 10000,
    memoryLimit: '256m',
  },
  typescript: {
    extension: 'ts',
    dockerImage: 'node:18-alpine',
    compileCommand: 'npm install -g typescript && tsc {file}',
    runCommand: 'node {file.js}',
    timeout: 15000,
    memoryLimit: '256m',
  },
  python: {
    extension: 'py',
    dockerImage: 'python:3.11-alpine',
    runCommand: 'python {file}',
    timeout: 10000,
    memoryLimit: '256m',
  },
  java: {
    extension: 'java',
    dockerImage: 'openjdk:17-alpine',
    compileCommand: 'javac {file}',
    runCommand: 'java {classname}',
    timeout: 15000,
    memoryLimit: '512m',
  },
  cpp: {
    extension: 'cpp',
    dockerImage: 'gcc:latest',
    compileCommand: 'g++ -o {output} {file}',
    runCommand: './{output}',
    timeout: 15000,
    memoryLimit: '512m',
  },
  c: {
    extension: 'c',
    dockerImage: 'gcc:latest',
    compileCommand: 'gcc -o {output} {file}',
    runCommand: './{output}',
    timeout: 15000,
    memoryLimit: '512m',
  },
  rust: {
    extension: 'rs',
    dockerImage: 'rust:alpine',
    compileCommand: 'rustc {file}',
    runCommand: './{output}',
    timeout: 20000,
    memoryLimit: '512m',
  },
  go: {
    extension: 'go',
    dockerImage: 'golang:alpine',
    runCommand: 'go run {file}',
    timeout: 15000,
    memoryLimit: '256m',
  },
  ruby: {
    extension: 'rb',
    dockerImage: 'ruby:alpine',
    runCommand: 'ruby {file}',
    timeout: 10000,
    memoryLimit: '256m',
  },
  php: {
    extension: 'php',
    dockerImage: 'php:alpine',
    runCommand: 'php {file}',
    timeout: 10000,
    memoryLimit: '256m',
  },
};

class CodeExecutionService {
  private tmpDir = '/tmp/code-execution';
  private maxConcurrentExecutions = 10;
  private currentExecutions = 0;

  constructor() {
    this.initTmpDir();
  }

  private async initTmpDir(): Promise<void> {
    try {
      await fs.mkdir(this.tmpDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Execute code in a sandboxed Docker container
   */
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const startTime = Date.now();

    // Validate language support
    const config = LANGUAGE_CONFIGS[request.language.toLowerCase()];
    if (!config) {
      return {
        success: false,
        error: `Unsupported language: ${request.language}`,
        executionTime: Date.now() - startTime,
      };
    }

    // Check concurrent execution limit
    if (this.currentExecutions >= this.maxConcurrentExecutions) {
      return {
        success: false,
        error: 'Maximum concurrent executions reached. Please try again.',
        executionTime: Date.now() - startTime,
      };
    }

    this.currentExecutions++;

    try {
      const sessionId = crypto.randomBytes(16).toString('hex');
      const sessionDir = path.join(this.tmpDir, sessionId);

      // Create session directory
      await fs.mkdir(sessionDir, { recursive: true });

      // Write main code file
      const filename = `main.${config.extension}`;
      const filepath = path.join(sessionDir, filename);
      await fs.writeFile(filepath, request.code);

      // Write additional files
      if (request.files) {
        for (const file of request.files) {
          const additionalFilePath = path.join(sessionDir, file.name);
          await fs.writeFile(additionalFilePath, file.content);
        }
      }

      // Write input file if provided
      if (request.input) {
        const inputPath = path.join(sessionDir, 'input.txt');
        await fs.writeFile(inputPath, request.input);
      }

      // Execute code in Docker
      const result = await this.executeInDocker(
        config,
        sessionDir,
        filename,
        request.timeout || config.timeout,
        request.memoryLimit || config.memoryLimit
      );

      // Cleanup
      await this.cleanup(sessionDir);

      return {
        ...result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: Date.now() - startTime,
      };
    } finally {
      this.currentExecutions--;
    }
  }

  /**
   * Execute code inside a Docker container
   */
  private async executeInDocker(
    config: LanguageConfig,
    sessionDir: string,
    filename: string,
    timeout: number,
    memoryLimit: string | number
  ): Promise<Omit<CodeExecutionResult, 'executionTime'>> {
    const containerName = `code-exec-${path.basename(sessionDir)}`;
    const volumeMount = `${sessionDir}:/workspace`;

    try {
      // Compile if needed
      if (config.compileCommand) {
        const compileCmd = config.compileCommand
          .replace('{file}', filename)
          .replace('{output}', 'program')
          .replace('{classname}', path.parse(filename).name);

        const compileCommand = `docker run --rm --name ${containerName}-compile \
          -v ${volumeMount} \
          -w /workspace \
          --memory=${memoryLimit} \
          --cpus=1 \
          --network=none \
          ${config.dockerImage} \
          sh -c "${compileCmd}"`;

        try {
          await execAsync(compileCommand, { timeout: timeout / 2 });
        } catch (compileError: any) {
          return {
            success: false,
            error: 'Compilation failed',
            stderr: compileError.stderr || compileError.message,
            exitCode: compileError.code,
          };
        }
      }

      // Run the code
      const runCmd = config.runCommand
        .replace('{file}', filename)
        .replace('{file.js}', filename.replace(/\.ts$/, '.js'))
        .replace('{output}', 'program')
        .replace('{classname}', path.parse(filename).name);

      const runCommand = `docker run --rm --name ${containerName} \
        -v ${volumeMount} \
        -w /workspace \
        --memory=${memoryLimit} \
        --cpus=1 \
        --network=none \
        --pids-limit=100 \
        ${config.dockerImage} \
        sh -c "${runCmd} < input.txt 2>&1"`;

      const { stdout, stderr } = await execAsync(runCommand, {
        timeout,
        maxBuffer: 1024 * 1024, // 1MB
      });

      return {
        success: true,
        output: stdout || stderr,
        stdout,
        stderr,
        exitCode: 0,
      };
    } catch (error: any) {
      // Handle timeout
      if (error.killed || error.signal === 'SIGTERM') {
        try {
          await execAsync(`docker stop ${containerName}`);
        } catch (stopError) {
          // Ignore cleanup errors
        }

        return {
          success: false,
          error: 'Execution timeout',
          stderr: `Execution exceeded ${timeout}ms time limit`,
          exitCode: -1,
        };
      }

      return {
        success: false,
        error: 'Runtime error',
        stderr: error.stderr || error.message,
        stdout: error.stdout,
        exitCode: error.code || -1,
      };
    }
  }

  /**
   * Validate code for security issues
   */
  validateCode(code: string, language: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic security checks
    const dangerousPatterns = [
      /require\s*\(\s*['"]child_process['"]\s*\)/gi,
      /import\s+.*\s+from\s+['"]child_process['"]/gi,
      /eval\s*\(/gi,
      /exec\s*\(/gi,
      /system\s*\(/gi,
      /subprocess/gi,
      /__import__/gi,
      /os\.system/gi,
      /Runtime\.getRuntime/gi,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(`Potentially dangerous code pattern detected: ${pattern.source}`);
      }
    }

    // Check code length
    if (code.length > 50000) {
      errors.push('Code exceeds maximum length of 50,000 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_CONFIGS);
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(language: string): LanguageConfig | null {
    return LANGUAGE_CONFIGS[language.toLowerCase()] || null;
  }

  /**
   * Cleanup session directory
   */
  private async cleanup(sessionDir: string): Promise<void> {
    try {
      await fs.rm(sessionDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Health check for Docker availability
   */
  async healthCheck(): Promise<boolean> {
    try {
      await execAsync('docker ps', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new CodeExecutionService();
