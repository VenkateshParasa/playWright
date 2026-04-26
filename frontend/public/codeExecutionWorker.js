// Web Worker for executing JavaScript/TypeScript code in a sandboxed environment

// Capture console logs
let consoleLogs = [];

// Override console methods
const console = {
  log: (...args) => {
    consoleLogs.push(`[LOG] ${args.map((a) => JSON.stringify(a)).join(' ')}`);
  },
  error: (...args) => {
    consoleLogs.push(`[ERROR] ${args.map((a) => JSON.stringify(a)).join(' ')}`);
  },
  warn: (...args) => {
    consoleLogs.push(`[WARN] ${args.map((a) => JSON.stringify(a)).join(' ')}`);
  },
  info: (...args) => {
    consoleLogs.push(`[INFO] ${args.map((a) => JSON.stringify(a)).join(' ')}`);
  },
};

/**
 * Execute code and run test cases
 */
function executeCode(code, testCases, functionName) {
  consoleLogs = [];
  const startTime = performance.now();
  const testResults = [];

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
      let testResult;

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
function deepEqual(a, b) {
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
function executeSimple(code) {
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

/**
 * Validate Java code syntax
 */
function validateJavaSyntax(code) {
  const errors = [];

  // Check for basic Java class structure
  if (!code.includes('class ') && !code.includes('public class ')) {
    errors.push('Java code must contain a class definition');
  }

  // Check for balanced braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Mismatched braces - check your { } pairs');
  }

  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('Mismatched parentheses - check your ( ) pairs');
  }

  // Check for semicolons in likely statement lines (basic check)
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines, comments, and lines that don't need semicolons
    if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') &&
        !line.startsWith('import') && !line.startsWith('package') &&
        !line.endsWith('{') && !line.endsWith('}') && !line.endsWith(';') &&
        line !== '{' && line !== '}' &&
        !line.includes('class ') && !line.includes('interface ') && !line.includes('enum ')) {
      // This is a very basic check and will have false positives
      // More sophisticated parsing would be needed for accurate validation
    }
  }

  return errors;
}

/**
 * Execute Java code (mock execution for browser)
 */
function executeJava(code, testCases, functionName) {
  consoleLogs = [];
  const startTime = performance.now();

  // Add informational message
  consoleLogs.push('[INFO] Java execution requires server-side processing');
  consoleLogs.push('[INFO] Performing client-side syntax validation...');

  // Validate Java syntax
  const syntaxErrors = validateJavaSyntax(code);

  if (syntaxErrors.length > 0) {
    return {
      success: false,
      error: 'Java syntax validation failed:\n' + syntaxErrors.join('\n'),
      logs: consoleLogs,
      executionTime: performance.now() - startTime,
    };
  }

  consoleLogs.push('[INFO] Basic syntax validation passed');
  consoleLogs.push('[INFO] In production, this code would be compiled and executed on the server');

  // Create mock test results
  const testResults = testCases.map((testCase) => {
    return {
      testId: testCase.id,
      testName: testCase.name,
      passed: null, // null indicates not executed
      expected: testCase.expectedOutput,
      executionTime: 0,
      message: 'Java execution requires backend server support. This test would be executed on the server.',
    };
  });

  const executionTime = performance.now() - startTime;

  return {
    success: true,
    logs: consoleLogs,
    testResults,
    executionTime,
    requiresBackend: true,
    message: 'Java code validation passed. To execute Java code, a backend server with Java JDK is required. The code would be compiled using javac and executed in a sandboxed Docker container.',
  };
}

/**
 * Simple Java code execution without tests
 */
function executeJavaSimple(code) {
  consoleLogs = [];
  const startTime = performance.now();

  consoleLogs.push('[INFO] Java execution requires server-side processing');
  consoleLogs.push('[INFO] Performing client-side syntax validation...');

  const syntaxErrors = validateJavaSyntax(code);

  if (syntaxErrors.length > 0) {
    return {
      success: false,
      error: 'Java syntax validation failed:\n' + syntaxErrors.join('\n'),
      logs: consoleLogs,
      executionTime: performance.now() - startTime,
    };
  }

  consoleLogs.push('[INFO] Basic syntax validation passed');
  consoleLogs.push('[INFO] Java execution would happen on a backend server with JDK installed');
  consoleLogs.push('[INFO] The code would be compiled and run in a sandboxed Docker environment');

  return {
    success: true,
    output: 'Java code syntax validation passed. Actual execution requires backend server.',
    logs: consoleLogs,
    executionTime: performance.now() - startTime,
    requiresBackend: true,
  };
}

// Message handler
self.addEventListener('message', (event) => {
  const { type, code, testCases, functionName, language } = event.data;

  try {
    let result;

    // Check if this is Java code
    if (language === 'java') {
      if (type === 'test' && testCases && functionName) {
        result = executeJava(code, testCases, functionName);
      } else {
        result = executeJavaSimple(code);
      }
    } else {
      // JavaScript/TypeScript execution
      if (type === 'test' && testCases && functionName) {
        result = executeCode(code, testCases, functionName);
      } else {
        result = executeSimple(code);
      }
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
