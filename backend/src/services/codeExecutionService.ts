import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TestCase {
  id: string;
  name: string;
  input: any;
  expectedOutput: any;
  hidden?: boolean;
}

export interface TestResult {
  testId: string;
  testName: string;
  passed: boolean;
  actual?: any;
  expected?: any;
  error?: string;
  executionTime?: number;
}

export interface CodeExecutionRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'java';
  testCases: TestCase[];
  timeout?: number;
}

export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  logs: string[];
  testResults: TestResult[];
  executionTime: number;
  allTestsPassed: boolean;
  passedCount: number;
  totalCount: number;
  score: number;
}

class CodeExecutionService {
  private readonly workerPath: string;
  private readonly defaultTimeout = 10000; // 10 seconds

  constructor() {
    // Path to the code executor worker
    this.workerPath = path.resolve(__dirname, '../../../workers/codeExecutor.js');
  }

  /**
   * Execute code with test cases
   */
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    const testResults: TestResult[] = [];

    try {
      // Run tests sequentially
      for (const testCase of request.testCases) {
        const testResult = await this.runSingleTest(
          request.code,
          request.language,
          testCase,
          request.timeout
        );
        testResults.push(testResult);
      }

      const executionTime = Date.now() - startTime;
      const passedCount = testResults.filter(t => t.passed).length;
      const totalCount = testResults.length;
      const allTestsPassed = passedCount === totalCount;
      const score = Math.round((passedCount / totalCount) * 100);

      return {
        success: true,
        logs,
        testResults,
        executionTime,
        allTestsPassed,
        passedCount,
        totalCount,
        score
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs,
        testResults,
        executionTime,
        allTestsPassed: false,
        passedCount: 0,
        totalCount: request.testCases.length,
        score: 0
      };
    }
  }

  /**
   * Run a single test case
   */
  private async runSingleTest(
    code: string,
    language: string,
    testCase: TestCase,
    timeout?: number
  ): Promise<TestResult> {
    const testStartTime = Date.now();

    try {
      // Wrap code with test execution
      const wrappedCode = this.wrapCodeWithTest(code, testCase, language);

      // Execute code in worker
      const result = await this.executeInWorker(
        wrappedCode,
        language,
        timeout || this.defaultTimeout
      );

      const executionTime = Date.now() - testStartTime;

      // Parse result
      if (result.error) {
        return {
          testId: testCase.id,
          testName: testCase.name,
          passed: false,
          expected: testCase.expectedOutput,
          error: result.error,
          executionTime
        };
      }

      // Compare output with expected
      const actual = this.parseOutput(result.output);
      const passed = this.compareValues(actual, testCase.expectedOutput);

      return {
        testId: testCase.id,
        testName: testCase.name,
        passed,
        actual,
        expected: testCase.expectedOutput,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - testStartTime;
      return {
        testId: testCase.id,
        testName: testCase.name,
        passed: false,
        expected: testCase.expectedOutput,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime
      };
    }
  }

  /**
   * Wrap user code with test execution logic
   */
  private wrapCodeWithTest(code: string, testCase: TestCase, language: string): string {
    // Extract function name from code
    const functionMatch = code.match(/function\s+(\w+)/);
    const functionName = functionMatch ? functionMatch[1] : null;

    if (!functionName) {
      throw new Error('Could not find function definition in code');
    }

    // Convert input array to function arguments
    const args = Array.isArray(testCase.input)
      ? testCase.input.map(arg => JSON.stringify(arg)).join(', ')
      : JSON.stringify(testCase.input);

    const testCode = `
${code}

// Execute test
try {
  const result = ${functionName}(${args});
  console.log(JSON.stringify(result));
} catch (error) {
  throw error;
}
`;

    return testCode;
  }

  /**
   * Execute code in worker thread
   */
  private async executeInWorker(
    code: string,
    language: string,
    timeout: number
  ): Promise<{ output?: string; error?: string; executionTime: number }> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerPath, {
        workerData: { code, language, timeout }
      });

      const timeoutId = setTimeout(() => {
        worker.terminate();
        reject(new Error('Execution timeout exceeded'));
      }, timeout);

      worker.on('message', (message) => {
        clearTimeout(timeoutId);
        worker.terminate();

        if (message.success) {
          resolve({
            output: message.result.output,
            error: message.result.error,
            executionTime: message.result.executionTime
          });
        } else {
          resolve({
            error: message.error,
            executionTime: 0
          });
        }
      });

      worker.on('error', (error) => {
        clearTimeout(timeoutId);
        worker.terminate();
        reject(error);
      });

      worker.on('exit', (code) => {
        clearTimeout(timeoutId);
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Parse output from code execution
   */
  private parseOutput(output?: string): any {
    if (!output) return undefined;

    try {
      // Try to parse as JSON
      return JSON.parse(output.trim());
    } catch {
      // Return as string if not JSON
      return output.trim();
    }
  }

  /**
   * Compare actual and expected values
   */
  private compareValues(actual: any, expected: any): boolean {
    // Handle undefined/null
    if (actual === expected) return true;
    if (actual == null || expected == null) return false;

    // Handle arrays
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      return actual.every((val, idx) => this.compareValues(val, expected[idx]));
    }

    // Handle objects
    if (typeof actual === 'object' && typeof expected === 'object') {
      const actualKeys = Object.keys(actual).sort();
      const expectedKeys = Object.keys(expected).sort();

      if (actualKeys.length !== expectedKeys.length) return false;
      if (!actualKeys.every((key, idx) => key === expectedKeys[idx])) return false;

      return actualKeys.every(key => this.compareValues(actual[key], expected[key]));
    }

    // Handle primitives
    return actual === expected;
  }

  /**
   * Validate code for security issues
   */
  validateCode(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /require\s*\(\s*['"]fs['"]\s*\)/, message: 'File system access is not allowed' },
      { pattern: /require\s*\(\s*['"]child_process['"]\s*\)/, message: 'Process execution is not allowed' },
      { pattern: /require\s*\(\s*['"]net['"]\s*\)/, message: 'Network access is not allowed' },
      { pattern: /eval\s*\(/, message: 'eval() is not allowed' },
      { pattern: /Function\s*\(/, message: 'Function constructor is not allowed' },
      { pattern: /process\s*\./, message: 'Process access is not allowed' },
      { pattern: /__dirname/, message: '__dirname is not allowed' },
      { pattern: /__filename/, message: '__filename is not allowed' }
    ];

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(message);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const codeExecutionService = new CodeExecutionService();
export default codeExecutionService;
