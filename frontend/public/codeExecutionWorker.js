// Web Worker for executing JavaScript/TypeScript code in a sandboxed environment

interface TestCase {
  id: string;
  name: string;
  input: any;
  expectedOutput: any;
  hidden?: boolean;
}

interface TestResult {
  testId: string;
  testName: string;
  passed: boolean;
  actual?: any;
  expected?: any;
  error?: string;
  executionTime?: number;
}

interface ExecutionMessage {
  type: 'execute' | 'test';
  code: string;
  testCases?: TestCase[];
  functionName?: string;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  logs: string[];
  testResults?: TestResult[];
  executionTime: number;
}

// Capture console logs
let consoleLogs: string[] = [];

// Override console methods
const console = {
  log: (...args: any[]) => {
    consoleLogs.push(`[LOG] ${args.map((a) => JSON.stringify(a)).join(' ')}`);
  },
  error: (...args: any[]) => {
    consoleLogs.push(`[ERROR] ${args.map((a) => JSON.stringify(a)).join(' ')}`);
  },
  warn: (...args: any[]) => {
    consoleLogs.push(`[WARN] ${args.map((a) => JSON.stringify(a)).join(' ')}`);
  },
  info: (...args: any[]) => {
    consoleLogs.push(`[INFO] ${args.map((a) => JSON.stringify(a)).join(' ')}`);
  },
};

/**
 * Execute code and run test cases
 */
function executeCode(code: string, testCases: TestCase[], functionName: string): ExecutionResult {
  consoleLogs = [];
  const startTime = performance.now();
  const testResults: TestResult[] = [];

  try {
    // Create a sandboxed function from the user's code
    // eslint-disable-next-line no-new-func
    const userFunction = new Function('console', `
      ${code}
      return typeof ${functionName} !== 'undefined' ? ${functionName} : null;
    `)(console);

    if (!userFunction || typeof userFunction !== 'function') {
      return {
        success: false,
        error: `Function '${functionName}' is not defined or exported. Make sure your code exports a function named '${functionName}'.`,
        logs: consoleLogs,
        executionTime: performance.now() - startTime,
      };
    }

    // Run all test cases
    for (const testCase of testCases) {
      const testStartTime = performance.now();
      let testResult: TestResult;

      try {
        // Execute the function with test input
        const actual = userFunction(...(Array.isArray(testCase.input) ? testCase.input : [testCase.input]));
        const testExecutionTime = performance.now() - testStartTime;

        // Compare actual with expected
        const passed = deepEqual(actual, testCase.expectedOutput);

        testResult = {
          testId: testCase.id,
          testName: testCase.name,
          passed,
          actual,
          expected: testCase.expectedOutput,
          executionTime: testExecutionTime,
        };
      } catch (error) {
        testResult = {
          testId: testCase.id,
          testName: testCase.name,
          passed: false,
          expected: testCase.expectedOutput,
          error: error instanceof Error ? error.message : String(error),
          executionTime: performance.now() - testStartTime,
        };
      }

      testResults.push(testResult);
    }

    const executionTime = performance.now() - startTime;

    return {
      success: true,
      logs: consoleLogs,
      testResults,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      logs: consoleLogs,
      executionTime: performance.now() - startTime,
    };
  }
}

/**
 * Deep equality check for test results
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') return a === b;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => deepEqual(a[key], b[key]));
}

/**
 * Simple code execution without tests
 */
function executeSimple(code: string): ExecutionResult {
  consoleLogs = [];
  const startTime = performance.now();

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function('console', code)(console);

    return {
      success: true,
      output: result !== undefined ? String(result) : undefined,
      logs: consoleLogs,
      executionTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      logs: consoleLogs,
      executionTime: performance.now() - startTime,
    };
  }
}

// Message handler
self.addEventListener('message', (event: MessageEvent<ExecutionMessage>) => {
  const { type, code, testCases, functionName } = event.data;

  try {
    let result: ExecutionResult;

    if (type === 'test' && testCases && functionName) {
      result = executeCode(code, testCases, functionName);
    } else {
      result = executeSimple(code);
    }

    self.postMessage(result);
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      logs: [],
      executionTime: 0,
    });
  }
});

// Export for TypeScript (won't affect worker runtime)
export {};
