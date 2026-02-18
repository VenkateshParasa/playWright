/**
 * Code Executor Worker
 * Sandboxed code execution for multiple programming languages
 *
 * IMPORTANT: This is a demonstration implementation.
 * In production, use proper sandboxing (Docker, VMs, cloud functions)
 */

import { parentPort, workerData } from 'worker_threads';
import { VM } from 'vm2';

interface ExecutionRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'python' | 'java';
  input?: string;
  timeout?: number;
  memoryLimit?: number;
}

interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  exitCode: number;
  sandboxed: boolean;
}

class CodeExecutor {
  private readonly defaultTimeout = 5000; // 5 seconds
  private readonly defaultMemoryLimit = 128 * 1024 * 1024; // 128 MB

  /**
   * Execute code in a sandboxed environment
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const timeout = request.timeout || this.defaultTimeout;
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      let output: string;

      switch (request.language) {
        case 'javascript':
        case 'typescript':
          output = await this.executeJavaScript(request.code, request.input, timeout);
          break;
        case 'python':
          output = await this.executePython(request.code, request.input, timeout);
          break;
        case 'java':
          output = await this.executeJava(request.code, request.input, timeout);
          break;
        default:
          throw new Error(`Unsupported language: ${request.language}`);
      }

      const executionTime = Date.now() - startTime;
      const memoryUsage = process.memoryUsage().heapUsed - startMemory;

      return {
        output,
        executionTime,
        memoryUsage: Math.max(0, memoryUsage),
        exitCode: 0,
        sandboxed: true,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const memoryUsage = process.memoryUsage().heapUsed - startMemory;

      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
        memoryUsage: Math.max(0, memoryUsage),
        exitCode: 1,
        sandboxed: true,
      };
    }
  }

  /**
   * Execute JavaScript code using VM2 sandbox
   */
  private async executeJavaScript(
    code: string,
    input?: string,
    timeout?: number
  ): Promise<string> {
    const outputs: string[] = [];

    // Create a sandboxed VM
    const vm = new VM({
      timeout: timeout || this.defaultTimeout,
      sandbox: {
        console: {
          log: (...args: any[]) => {
            outputs.push(args.map(a => String(a)).join(' '));
          },
          error: (...args: any[]) => {
            outputs.push('ERROR: ' + args.map(a => String(a)).join(' '));
          },
        },
        input: input || '',
      },
    });

    try {
      // Wrap code to capture return value
      const wrappedCode = `
        (function() {
          ${code}
        })();
      `;

      const result = vm.run(wrappedCode);

      // If there's a return value, add it to output
      if (result !== undefined) {
        outputs.push(String(result));
      }

      return outputs.join('\n');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Script execution timed out')) {
          throw new Error('Execution timeout exceeded');
        }
        throw error;
      }
      throw new Error('Unknown execution error');
    }
  }

  /**
   * Execute Python code (requires Python installation)
   * In production, use Docker containers or AWS Lambda
   */
  private async executePython(
    code: string,
    input?: string,
    timeout?: number
  ): Promise<string> {
    // This is a placeholder. In production:
    // 1. Use Docker with Python image
    // 2. Or use AWS Lambda with Python runtime
    // 3. Or use isolated Python subprocess with resource limits

    return this.executeInDocker('python', code, input, timeout);
  }

  /**
   * Execute Java code (requires Java JDK)
   * In production, use Docker containers or cloud functions
   */
  private async executeJava(
    code: string,
    input?: string,
    timeout?: number
  ): Promise<string> {
    // This is a placeholder. In production:
    // 1. Use Docker with Java image
    // 2. Or use AWS Lambda with Java runtime
    // 3. Or compile and run in isolated process

    return this.executeInDocker('java', code, input, timeout);
  }

  /**
   * Execute code in Docker container (production implementation)
   */
  private async executeInDocker(
    language: string,
    code: string,
    input?: string,
    timeout?: number
  ): Promise<string> {
    // Production implementation would:
    // 1. Create a temporary file with the code
    // 2. Spin up a Docker container with appropriate image
    // 3. Mount the code file
    // 4. Execute with resource limits (CPU, memory, network)
    // 5. Capture output and clean up

    const { spawn } = await import('child_process');

    return new Promise((resolve, reject) => {
      let dockerImage: string;
      let command: string[];

      switch (language) {
        case 'python':
          dockerImage = 'python:3.11-alpine';
          command = ['python', '-c', code];
          break;
        case 'java':
          dockerImage = 'openjdk:11-jre-slim';
          // Java requires compilation, more complex
          return reject(new Error('Java execution not yet implemented in demo'));
        default:
          return reject(new Error(`Unsupported language for Docker: ${language}`));
      }

      // Docker run command with security restrictions
      const dockerArgs = [
        'run',
        '--rm', // Remove container after execution
        '--network=none', // No network access
        '--memory=128m', // Memory limit
        '--memory-swap=128m', // No swap
        '--cpus=0.5', // CPU limit
        '--pids-limit=50', // Process limit
        '--read-only', // Read-only filesystem
        '--user=nobody', // Non-root user
        '-i', // Interactive for stdin
        dockerImage,
        ...command,
      ];

      const process = spawn('docker', dockerArgs);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Send input if provided
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }

      // Timeout handling
      const timeoutId = setTimeout(() => {
        process.kill('SIGKILL');
        reject(new Error('Execution timeout exceeded'));
      }, timeout || this.defaultTimeout);

      process.on('close', (exitCode) => {
        clearTimeout(timeoutId);

        if (exitCode === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `Process exited with code ${exitCode}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  /**
   * Validate code for dangerous operations
   */
  private validateCode(code: string, language: string): void {
    const dangerousPatterns = [
      /require\s*\(\s*['"]fs['"]\s*\)/, // File system access
      /require\s*\(\s*['"]child_process['"]\s*\)/, // Process execution
      /require\s*\(\s*['"]net['"]\s*\)/, // Network access
      /import\s+os/, // Python OS module
      /import\s+subprocess/, // Python subprocess
      /Runtime\.getRuntime\(\)/, // Java runtime
      /System\.exit/, // System exit
      /__import__/, // Python dynamic import
      /eval\s*\(/, // Eval execution
      /exec\s*\(/, // Exec execution
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('Code contains potentially dangerous operations');
      }
    }
  }
}

// Worker thread message handler
if (parentPort) {
  const executor = new CodeExecutor();

  parentPort.on('message', async (request: ExecutionRequest) => {
    try {
      const result = await executor.execute(request);
      parentPort!.postMessage({ success: true, result });
    } catch (error) {
      parentPort!.postMessage({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

// Export for direct usage
export { CodeExecutor, ExecutionRequest, ExecutionResult };
export default CodeExecutor;

/**
 * PRODUCTION SECURITY RECOMMENDATIONS:
 *
 * 1. Docker Isolation:
 *    - Use Docker containers with strict resource limits
 *    - Network isolation (--network=none)
 *    - Read-only filesystem
 *    - Non-root user
 *    - Seccomp and AppArmor profiles
 *
 * 2. Resource Limits:
 *    - CPU limits (--cpus)
 *    - Memory limits (--memory, --memory-swap)
 *    - Process limits (--pids-limit)
 *    - Execution timeout
 *
 * 3. Code Validation:
 *    - AST parsing for dangerous operations
 *    - Whitelist of allowed libraries
 *    - Signature verification
 *
 * 4. Monitoring:
 *    - Log all executions
 *    - Monitor resource usage
 *    - Rate limiting per user
 *    - Anomaly detection
 *
 * 5. Alternative Solutions:
 *    - AWS Lambda with custom runtime
 *    - Google Cloud Functions
 *    - Azure Functions
 *    - Judge0 API (https://judge0.com/)
 *    - Glot.io API
 */
