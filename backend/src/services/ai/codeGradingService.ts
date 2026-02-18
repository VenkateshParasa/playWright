/**
 * Code Grading Service
 * Automated code grading with test execution, style checking, security analysis, and performance metrics
 */

import type {
  CodeSubmission,
  GradingResult,
  TestResult,
  StyleIssue,
  SecurityVulnerability,
  PerformanceMetrics,
} from '../../types/ai.js';
import { plagiarismDetectionService } from './plagiarismDetection.js';

interface GradingConfig {
  enableStyleCheck: boolean;
  enableSecurityCheck: boolean;
  enablePerformanceCheck: boolean;
  enablePlagiarismCheck: boolean;
  weights: {
    tests: number;
    style: number;
    security: number;
    performance: number;
  };
}

export class CodeGradingService {
  private readonly defaultConfig: GradingConfig = {
    enableStyleCheck: true,
    enableSecurityCheck: true,
    enablePerformanceCheck: true,
    enablePlagiarismCheck: true,
    weights: {
      tests: 0.6,
      style: 0.15,
      security: 0.15,
      performance: 0.1,
    },
  };

  /**
   * Grade a code submission
   */
  async gradeSubmission(
    submission: CodeSubmission,
    config: Partial<GradingConfig> = {}
  ): Promise<GradingResult> {
    const gradingConfig = { ...this.defaultConfig, ...config };

    // Execute test cases
    const testResults = await this.executeTests(submission);

    // Check code style
    const styleIssues = gradingConfig.enableStyleCheck
      ? await this.checkStyle(submission.code, submission.language)
      : [];

    // Check security vulnerabilities
    const securityVulnerabilities = gradingConfig.enableSecurityCheck
      ? await this.checkSecurity(submission.code, submission.language)
      : [];

    // Analyze performance
    const performanceMetrics = gradingConfig.enablePerformanceCheck
      ? await this.analyzePerformance(submission.code, submission.language, testResults)
      : this.getDefaultPerformanceMetrics();

    // Check plagiarism
    let plagiarismResult;
    if (gradingConfig.enablePlagiarismCheck) {
      // In a real implementation, fetch other submissions from database
      plagiarismResult = await plagiarismDetectionService.checkCodeSimilarity(
        submission.code,
        submission.language,
        submission.userId,
        submission.exerciseId,
        [] // Would fetch from database
      );
    }

    // Calculate scores
    const testScore = this.calculateTestScore(testResults);
    const styleScore = this.calculateStyleScore(styleIssues, submission.code);
    const securityScore = this.calculateSecurityScore(securityVulnerabilities);
    const performanceScore = this.calculatePerformanceScore(performanceMetrics);

    const partialCredits = {
      tests: testScore * gradingConfig.weights.tests,
      style: styleScore * gradingConfig.weights.style,
      security: securityScore * gradingConfig.weights.security,
      performance: performanceScore * gradingConfig.weights.performance,
    };

    const totalScore = Object.values(partialCredits).reduce((sum, score) => sum + score, 0);
    const maxScore = 100;
    const percentage = (totalScore / maxScore) * 100;

    // Generate feedback
    const feedback = this.generateFeedback(
      testResults,
      styleIssues,
      securityVulnerabilities,
      performanceMetrics,
      plagiarismResult
    );

    return {
      score: totalScore,
      maxScore,
      percentage,
      passed: percentage >= 60 && testScore >= 0.5,
      testResults,
      styleIssues,
      securityVulnerabilities,
      performanceMetrics,
      plagiarismResult,
      feedback,
      partialCredits,
      gradedAt: new Date(),
    };
  }

  /**
   * Execute test cases against submitted code
   */
  private async executeTests(submission: CodeSubmission): Promise<TestResult[]> {
    if (!submission.testCases || submission.testCases.length === 0) {
      return [];
    }

    const results: TestResult[] = [];

    for (const testCase of submission.testCases) {
      try {
        const startTime = Date.now();

        // In production, this would send to the code executor worker
        const output = await this.executeCode(
          submission.code,
          submission.language,
          testCase.input
        );

        const executionTime = Date.now() - startTime;

        const passed = this.compareOutputs(output, testCase.expectedOutput);

        results.push({
          testCaseId: testCase.id,
          passed,
          actualOutput: output,
          expectedOutput: testCase.expectedOutput,
          executionTime,
        });
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          actualOutput: '',
          expectedOutput: testCase.expectedOutput,
          executionTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Execute code (mock implementation - would use worker in production)
   */
  private async executeCode(
    code: string,
    language: string,
    input: string
  ): Promise<string> {
    // Mock implementation - in production, send to codeExecutor worker
    // This would run in a sandboxed environment (Docker, VM, etc.)
    return 'Mock output';
  }

  /**
   * Compare actual and expected outputs
   */
  private compareOutputs(actual: string, expected: string): boolean {
    const normalizeOutput = (str: string) => str.trim().replace(/\s+/g, ' ');
    return normalizeOutput(actual) === normalizeOutput(expected);
  }

  /**
   * Check code style using language-specific linters
   */
  private async checkStyle(code: string, language: string): Promise<StyleIssue[]> {
    const issues: StyleIssue[] = [];

    switch (language) {
      case 'javascript':
      case 'typescript':
        issues.push(...this.checkJavaScriptStyle(code));
        break;
      case 'python':
        issues.push(...this.checkPythonStyle(code));
        break;
      case 'java':
        issues.push(...this.checkJavaStyle(code));
        break;
    }

    return issues;
  }

  /**
   * Check JavaScript/TypeScript style
   */
  private checkJavaScriptStyle(code: string): StyleIssue[] {
    const issues: StyleIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for var usage
      if (line.includes('var ')) {
        issues.push({
          line: index + 1,
          column: line.indexOf('var '),
          rule: 'no-var',
          message: 'Use const or let instead of var',
          severity: 'warning',
        });
      }

      // Check for console.log
      if (line.includes('console.log')) {
        issues.push({
          line: index + 1,
          column: line.indexOf('console.log'),
          rule: 'no-console',
          message: 'Unexpected console statement',
          severity: 'warning',
        });
      }

      // Check for missing semicolons
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('if') &&
        !trimmed.startsWith('for') &&
        !trimmed.startsWith('while')
      ) {
        issues.push({
          line: index + 1,
          column: line.length,
          rule: 'semi',
          message: 'Missing semicolon',
          severity: 'error',
        });
      }

      // Check indentation
      const indent = line.match(/^\s*/)?.[0].length || 0;
      if (indent % 2 !== 0 && line.trim().length > 0) {
        issues.push({
          line: index + 1,
          column: 0,
          rule: 'indent',
          message: 'Expected indentation of 2 spaces',
          severity: 'warning',
        });
      }
    });

    return issues;
  }

  /**
   * Check Python style (PEP 8)
   */
  private checkPythonStyle(code: string): StyleIssue[] {
    const issues: StyleIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check line length
      if (line.length > 79) {
        issues.push({
          line: index + 1,
          column: 79,
          rule: 'line-too-long',
          message: 'Line too long (>79 characters)',
          severity: 'warning',
        });
      }

      // Check indentation (4 spaces)
      const indent = line.match(/^\s*/)?.[0].length || 0;
      if (indent % 4 !== 0 && line.trim().length > 0) {
        issues.push({
          line: index + 1,
          column: 0,
          rule: 'indent',
          message: 'Expected indentation of 4 spaces',
          severity: 'error',
        });
      }

      // Check for trailing whitespace
      if (line.endsWith(' ') || line.endsWith('\t')) {
        issues.push({
          line: index + 1,
          column: line.length - 1,
          rule: 'trailing-whitespace',
          message: 'Trailing whitespace',
          severity: 'warning',
        });
      }
    });

    return issues;
  }

  /**
   * Check Java style
   */
  private checkJavaStyle(code: string): StyleIssue[] {
    const issues: StyleIssue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for proper class naming
      const classMatch = line.match(/class\s+([a-z][a-zA-Z]*)/);
      if (classMatch) {
        issues.push({
          line: index + 1,
          column: line.indexOf(classMatch[1]),
          rule: 'class-name',
          message: 'Class names should start with an uppercase letter',
          severity: 'error',
        });
      }

      // Check for proper constant naming
      const constMatch = line.match(/final\s+\w+\s+([a-z][a-zA-Z_]*)\s*=/);
      if (constMatch) {
        issues.push({
          line: index + 1,
          column: line.indexOf(constMatch[1]),
          rule: 'constant-name',
          message: 'Constant names should be in UPPER_CASE',
          severity: 'warning',
        });
      }
    });

    return issues;
  }

  /**
   * Check for security vulnerabilities
   */
  private async checkSecurity(
    code: string,
    language: string
  ): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for eval usage
      if (line.includes('eval(')) {
        vulnerabilities.push({
          type: 'dangerous-function',
          severity: 'critical',
          line: index + 1,
          description: 'Use of eval() is dangerous and can lead to code injection',
          recommendation: 'Avoid using eval(). Use safer alternatives like JSON.parse()',
        });
      }

      // Check for SQL injection vulnerabilities
      if (
        line.includes('execute(') &&
        (line.includes('+') || line.includes('${'))
      ) {
        vulnerabilities.push({
          type: 'sql-injection',
          severity: 'high',
          line: index + 1,
          description: 'Possible SQL injection vulnerability',
          recommendation: 'Use parameterized queries or prepared statements',
        });
      }

      // Check for hardcoded credentials
      if (
        /password\s*=\s*["'][^"']+["']/i.test(line) ||
        /api[_-]?key\s*=\s*["'][^"']+["']/i.test(line)
      ) {
        vulnerabilities.push({
          type: 'hardcoded-credentials',
          severity: 'high',
          line: index + 1,
          description: 'Hardcoded credentials detected',
          recommendation: 'Use environment variables or secure configuration',
        });
      }

      // Check for XSS vulnerabilities
      if (language === 'javascript' || language === 'typescript') {
        if (line.includes('innerHTML') || line.includes('document.write')) {
          vulnerabilities.push({
            type: 'xss',
            severity: 'medium',
            line: index + 1,
            description: 'Possible XSS vulnerability',
            recommendation: 'Use textContent or sanitize HTML input',
          });
        }
      }

      // Check for command injection
      if (
        line.includes('exec(') ||
        line.includes('system(') ||
        line.includes('shell_exec(')
      ) {
        vulnerabilities.push({
          type: 'command-injection',
          severity: 'critical',
          line: index + 1,
          description: 'Possible command injection vulnerability',
          recommendation: 'Validate and sanitize all input before executing commands',
        });
      }
    });

    return vulnerabilities;
  }

  /**
   * Analyze code performance
   */
  private async analyzePerformance(
    code: string,
    language: string,
    testResults: TestResult[]
  ): Promise<PerformanceMetrics> {
    const avgExecutionTime = testResults.length > 0
      ? testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length
      : 0;

    const complexity = this.calculateComplexity(code);
    const suggestions = this.generatePerformanceSuggestions(code, language, complexity);

    return {
      executionTime: avgExecutionTime,
      memoryUsage: 0, // Would be measured in actual execution
      complexity,
      suggestions,
    };
  }

  /**
   * Calculate code complexity
   */
  private calculateComplexity(code: string): { cyclomatic: number; cognitive: number } {
    let cyclomatic = 1; // Start with 1 for the function itself
    let cognitive = 0;

    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'case', 'catch',
      '&&', '||', '?', 'break', 'continue', 'return',
    ];

    const lines = code.split('\n');
    let nestingLevel = 0;

    lines.forEach(line => {
      // Count opening braces for nesting
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      nestingLevel += openBraces - closeBraces;

      // Count complexity keywords
      complexityKeywords.forEach(keyword => {
        if (line.includes(keyword)) {
          cyclomatic++;
          cognitive += nestingLevel; // Cognitive complexity increases with nesting
        }
      });
    });

    return { cyclomatic, cognitive };
  }

  /**
   * Generate performance suggestions
   */
  private generatePerformanceSuggestions(
    code: string,
    language: string,
    complexity: { cyclomatic: number; cognitive: number }
  ): string[] {
    const suggestions: string[] = [];

    if (complexity.cyclomatic > 10) {
      suggestions.push('Consider breaking down complex functions into smaller ones');
    }

    if (complexity.cognitive > 15) {
      suggestions.push('Reduce nesting depth to improve code readability');
    }

    // Language-specific suggestions
    if (language === 'javascript' || language === 'typescript') {
      if (code.includes('for (let i = 0')) {
        suggestions.push('Consider using array methods like map(), filter(), or reduce()');
      }

      if (code.includes('nested loops')) {
        suggestions.push('Nested loops may have O(n²) complexity. Consider optimizing');
      }
    }

    if (language === 'python') {
      if (code.includes('for i in range(len(')) {
        suggestions.push('Use enumerate() instead of range(len())');
      }
    }

    return suggestions;
  }

  /**
   * Get default performance metrics
   */
  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      executionTime: 0,
      memoryUsage: 0,
      complexity: { cyclomatic: 0, cognitive: 0 },
      suggestions: [],
    };
  }

  /**
   * Calculate test score
   */
  private calculateTestScore(testResults: TestResult[]): number {
    if (testResults.length === 0) return 1;

    const passedTests = testResults.filter(r => r.passed).length;
    return passedTests / testResults.length;
  }

  /**
   * Calculate style score
   */
  private calculateStyleScore(styleIssues: StyleIssue[], code: string): number {
    if (styleIssues.length === 0) return 1;

    const lines = code.split('\n').length;
    const errorWeight = 2;
    const warningWeight = 1;

    const totalPenalty = styleIssues.reduce((sum, issue) => {
      return sum + (issue.severity === 'error' ? errorWeight : warningWeight);
    }, 0);

    // Penalty per 100 lines of code
    const penalty = (totalPenalty / lines) * 100;
    return Math.max(0, 1 - penalty / 100);
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    if (vulnerabilities.length === 0) return 1;

    const severityWeights = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1,
    };

    const totalPenalty = vulnerabilities.reduce((sum, vuln) => {
      return sum + severityWeights[vuln.severity];
    }, 0);

    return Math.max(0, 1 - totalPenalty / 20);
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 1;

    // Penalize high complexity
    if (metrics.complexity.cyclomatic > 15) {
      score -= 0.3;
    } else if (metrics.complexity.cyclomatic > 10) {
      score -= 0.15;
    }

    if (metrics.complexity.cognitive > 20) {
      score -= 0.3;
    } else if (metrics.complexity.cognitive > 15) {
      score -= 0.15;
    }

    return Math.max(0, score);
  }

  /**
   * Generate comprehensive feedback
   */
  private generateFeedback(
    testResults: TestResult[],
    styleIssues: StyleIssue[],
    securityVulnerabilities: SecurityVulnerability[],
    performanceMetrics: PerformanceMetrics,
    plagiarismResult?: any
  ): string[] {
    const feedback: string[] = [];

    // Test results feedback
    const passedTests = testResults.filter(r => r.passed).length;
    feedback.push(`Tests: ${passedTests}/${testResults.length} passed`);

    if (passedTests < testResults.length) {
      const failedTests = testResults.filter(r => !r.passed);
      feedback.push(`Failed tests: ${failedTests.map(t => t.testCaseId).join(', ')}`);
    }

    // Style feedback
    if (styleIssues.length > 0) {
      const errors = styleIssues.filter(i => i.severity === 'error').length;
      const warnings = styleIssues.filter(i => i.severity === 'warning').length;
      feedback.push(`Style: ${errors} errors, ${warnings} warnings found`);

      if (errors > 0) {
        feedback.push('Fix critical style errors to improve code quality');
      }
    } else {
      feedback.push('Style: Excellent! No style issues found');
    }

    // Security feedback
    if (securityVulnerabilities.length > 0) {
      feedback.push(`Security: ${securityVulnerabilities.length} vulnerabilities found`);
      const critical = securityVulnerabilities.filter(v => v.severity === 'critical');
      if (critical.length > 0) {
        feedback.push('CRITICAL: Address security vulnerabilities immediately');
      }
    } else {
      feedback.push('Security: No vulnerabilities detected');
    }

    // Performance feedback
    if (performanceMetrics.suggestions.length > 0) {
      feedback.push(`Performance: ${performanceMetrics.suggestions.length} suggestions`);
    } else {
      feedback.push('Performance: Good performance characteristics');
    }

    // Plagiarism feedback
    if (plagiarismResult && plagiarismResult.similarity > 0.7) {
      feedback.push('ALERT: High similarity with other submissions detected');
    }

    return feedback;
  }
}

export const codeGradingService = new CodeGradingService();
