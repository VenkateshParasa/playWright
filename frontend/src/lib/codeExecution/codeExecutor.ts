import { TestCase, TestResult, CodeExecutionResult, ProgrammingLanguage } from '../../types/exercise';

class CodeExecutor {
  private worker: Worker | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker('/codeExecutionWorker.js');
    } catch (error) {
      console.error('Failed to initialize code execution worker:', error);
    }
  }

  /**
   * Execute code with test cases
   */
  async executeWithTests(
    code: string,
    testCases: TestCase[],
    functionName: string,
    language: ProgrammingLanguage = 'javascript'
  ): Promise<CodeExecutionResult> {
    if (!this.worker) {
      return {
        success: false,
        error: 'Code execution worker not available',
        logs: [],
        executionTime: 0,
      };
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          error: 'Code execution timeout (5 seconds)',
          logs: [],
          executionTime: 5000,
        });
      }, 5000);

      this.worker!.onmessage = (event: MessageEvent) => {
        clearTimeout(timeout);
        resolve(this.parseWorkerResponse(event.data));
      };

      this.worker!.onerror = (error) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: error.message || 'Worker error',
          logs: [],
          executionTime: 0,
        });
      };

      this.worker!.postMessage({
        type: 'test',
        code,
        testCases,
        functionName,
        language,
      });
    });
  }

  /**
   * Execute code without tests (simple execution)
   */
  async executeSimple(code: string, language: ProgrammingLanguage = 'javascript'): Promise<CodeExecutionResult> {
    if (!this.worker) {
      return {
        success: false,
        error: 'Code execution worker not available',
        logs: [],
        executionTime: 0,
      };
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          error: 'Code execution timeout (5 seconds)',
          logs: [],
          executionTime: 5000,
        });
      }, 5000);

      this.worker!.onmessage = (event: MessageEvent) => {
        clearTimeout(timeout);
        resolve(this.parseWorkerResponse(event.data));
      };

      this.worker!.onerror = (error) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: error.message || 'Worker error',
          logs: [],
          executionTime: 0,
        });
      };

      this.worker!.postMessage({
        type: 'execute',
        code,
        language,
      });
    });
  }

  private parseWorkerResponse(data: any): CodeExecutionResult {
    return {
      success: data.success,
      output: data.output,
      error: data.error,
      logs: data.logs || [],
      testResults: data.testResults,
      executionTime: data.executionTime,
    };
  }

  /**
   * Terminate the worker
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Restart the worker
   */
  restart() {
    this.terminate();
    this.initWorker();
  }
}

// Create singleton instance
let executorInstance: CodeExecutor | null = null;

export function getCodeExecutor(): CodeExecutor {
  if (!executorInstance) {
    executorInstance = new CodeExecutor();
  }
  return executorInstance;
}

export function terminateCodeExecutor() {
  if (executorInstance) {
    executorInstance.terminate();
    executorInstance = null;
  }
}
