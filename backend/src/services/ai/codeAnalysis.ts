/**
 * Code Analysis Service
 * AI-powered code review and quality analysis
 */

interface CodeAnalysisResult {
  quality: number;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  bestPractices: BestPracticeCheck[];
  comparison: ComparisonResult | null;
  metrics: CodeMetrics;
}

interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  line: number;
  message: string;
  severity: 'high' | 'medium' | 'low';
  category: 'syntax' | 'logic' | 'performance' | 'security' | 'style';
}

interface CodeSuggestion {
  title: string;
  description: string;
  before: string;
  after: string;
  benefit: string;
}

interface BestPracticeCheck {
  practice: string;
  followed: boolean;
  explanation: string;
}

interface ComparisonResult {
  similarityScore: number;
  improvements: string[];
  differences: string[];
}

interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  maintainability: number;
  testCoverage: number;
  performance: number;
}

export class CodeAnalysisService {
  /**
   * Analyze user-submitted code
   */
  static async analyzeCode(
    code: string,
    language: 'javascript' | 'typescript' | 'python',
    exerciseId?: string
  ): Promise<CodeAnalysisResult> {
    // Calculate metrics
    const metrics = this.calculateMetrics(code);

    // Detect issues
    const issues = this.detectIssues(code, language);

    // Generate suggestions
    const suggestions = this.generateSuggestions(code, language, issues);

    // Check best practices
    const bestPractices = this.checkBestPractices(code, language);

    // Compare with ideal solution if available
    let comparison: ComparisonResult | null = null;
    if (exerciseId) {
      const idealSolution = await this.getIdealSolution(exerciseId);
      if (idealSolution) {
        comparison = this.compareWithIdeal(code, idealSolution);
      }
    }

    // Calculate overall quality score
    const quality = this.calculateQualityScore(
      metrics,
      issues,
      bestPractices
    );

    return {
      quality,
      issues,
      suggestions,
      bestPractices,
      comparison,
      metrics,
    };
  }

  /**
   * Detect common mistakes in Playwright/Selenium code
   */
  static detectCommonMistakes(
    code: string,
    framework: 'playwright' | 'selenium'
  ): CodeIssue[] {
    const issues: CodeIssue[] = [];

    if (framework === 'playwright') {
      // Check for missing await
      if (/\.(click|fill|type|goto)\(/.test(code) && !/await/.test(code)) {
        issues.push({
          type: 'error',
          line: this.findLineNumber(code, /\.(click|fill|type|goto)\(/),
          message: 'Missing await keyword for async Playwright methods',
          severity: 'high',
          category: 'logic',
        });
      }

      // Check for inefficient locators
      if (/getByRole\(['"]textbox['"]\)/.test(code)) {
        const match = code.match(/getByRole\(['"]textbox['"]\)/);
        if (match && !code.includes('getByLabel')) {
          issues.push({
            type: 'warning',
            line: this.findLineNumber(code, /getByRole\(['"]textbox['"]\)/),
            message: 'Consider using getByLabel for better accessibility',
            severity: 'medium',
            category: 'style',
          });
        }
      }

      // Check for hard-coded waits
      if (/setTimeout|sleep/.test(code)) {
        issues.push({
          type: 'warning',
          line: this.findLineNumber(code, /setTimeout|sleep/),
          message: 'Avoid hard-coded waits. Use Playwright auto-waiting instead',
          severity: 'medium',
          category: 'performance',
        });
      }

      // Check for missing error handling
      if (/await/.test(code) && !/try/.test(code)) {
        issues.push({
          type: 'warning',
          line: 1,
          message: 'Consider adding try-catch for error handling',
          severity: 'low',
          category: 'logic',
        });
      }
    }

    if (framework === 'selenium') {
      // Check for implicit waits
      if (/implicitlyWait/.test(code)) {
        issues.push({
          type: 'warning',
          line: this.findLineNumber(code, /implicitlyWait/),
          message: 'Prefer explicit waits over implicit waits',
          severity: 'medium',
          category: 'performance',
        });
      }

      // Check for XPath usage
      if (/By\.xpath/.test(code)) {
        issues.push({
          type: 'info',
          line: this.findLineNumber(code, /By\.xpath/),
          message: 'XPath can be fragile. Consider CSS selectors or ID',
          severity: 'low',
          category: 'style',
        });
      }
    }

    return issues;
  }

  /**
   * Suggest code improvements
   */
  static generateSuggestions(
    code: string,
    language: string,
    issues: CodeIssue[]
  ): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Suggest async/await improvements
    if (language === 'javascript' || language === 'typescript') {
      if (/\.then\(/.test(code)) {
        suggestions.push({
          title: 'Use async/await instead of .then()',
          description: 'Modern async/await syntax is more readable',
          before: code.match(/.*\.then\(.*\)/)?.toString() || '',
          after: 'await page.click(...)',
          benefit: 'Improved readability and error handling',
        });
      }

      // Suggest const over let/var
      if (/var\s/.test(code)) {
        suggestions.push({
          title: 'Use const/let instead of var',
          description: 'Block-scoped variables prevent common errors',
          before: 'var element = ...',
          after: 'const element = ...',
          benefit: 'Better scope control and immutability',
        });
      }
    }

    // Suggest better locator strategies
    if (/querySelector|getElementById/.test(code)) {
      suggestions.push({
        title: 'Use Playwright locators',
        description: 'Playwright locators are more reliable and have auto-waiting',
        before: 'document.querySelector("#id")',
        after: 'page.locator("#id")',
        benefit: 'Built-in retry logic and better reliability',
      });
    }

    // Suggest page object pattern
    if (code.split('\n').length > 50 && !/class.*Page/.test(code)) {
      suggestions.push({
        title: 'Consider Page Object Model',
        description: 'Organize complex tests using Page Object pattern',
        before: 'Multiple direct page interactions',
        after: 'const loginPage = new LoginPage(page)',
        benefit: 'Better maintainability and reusability',
      });
    }

    return suggestions;
  }

  /**
   * Check best practices
   */
  static checkBestPractices(
    code: string,
    language: string
  ): BestPracticeCheck[] {
    const checks: BestPracticeCheck[] = [];

    // Playwright best practices
    checks.push({
      practice: 'Using semantic locators',
      followed: /getByRole|getByLabel|getByText/.test(code),
      explanation: 'Semantic locators are more resilient to UI changes',
    });

    checks.push({
      practice: 'Proper error handling',
      followed: /try\s*\{.*catch/.test(code),
      explanation: 'Try-catch blocks help handle unexpected failures',
    });

    checks.push({
      practice: 'No hard-coded waits',
      followed: !/setTimeout|sleep\(/.test(code),
      explanation: 'Playwright has built-in auto-waiting capabilities',
    });

    checks.push({
      practice: 'Descriptive test names',
      followed: /test\(['"].*should.*['"]/.test(code),
      explanation: 'Test names should clearly describe what is being tested',
    });

    checks.push({
      practice: 'Independent tests',
      followed: !/(beforeAll|globalSetup).*login/.test(code),
      explanation: 'Tests should not depend on each other\'s state',
    });

    checks.push({
      practice: 'Assertions present',
      followed: /expect\(.*\)\.(toBe|toHaveText|toBeVisible)/.test(code),
      explanation: 'Tests should verify expected outcomes',
    });

    return checks;
  }

  /**
   * Compare with ideal solution
   */
  static compareWithIdeal(
    userCode: string,
    idealCode: string
  ): ComparisonResult {
    const userLines = userCode.split('\n').filter((l) => l.trim());
    const idealLines = idealCode.split('\n').filter((l) => l.trim());

    // Calculate similarity (simplified Levenshtein-based)
    const similarityScore = this.calculateSimilarity(userCode, idealCode);

    // Find improvements
    const improvements: string[] = [];
    const differences: string[] = [];

    // Check for patterns in ideal code not in user code
    const idealPatterns = this.extractPatterns(idealCode);
    const userPatterns = this.extractPatterns(userCode);

    idealPatterns.forEach((pattern) => {
      if (!userPatterns.has(pattern)) {
        improvements.push(`Consider using: ${pattern}`);
      }
    });

    // Check for anti-patterns in user code
    if (/setTimeout/.test(userCode) && !/setTimeout/.test(idealCode)) {
      improvements.push('Remove hard-coded waits');
    }

    if (userLines.length > idealLines.length * 1.5) {
      improvements.push('Solution can be more concise');
    }

    // Identify key differences
    if (/async.*await/.test(idealCode) && !/async.*await/.test(userCode)) {
      differences.push('Ideal solution uses async/await pattern');
    }

    return {
      similarityScore,
      improvements,
      differences,
    };
  }

  /**
   * Detect code smells and anti-patterns
   */
  static detectCodeSmells(code: string): CodeIssue[] {
    const smells: CodeIssue[] = [];

    // Long methods
    const methods = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]+\}/g) || [];
    methods.forEach((method) => {
      const lines = method.split('\n').length;
      if (lines > 50) {
        smells.push({
          type: 'warning',
          line: this.findLineNumber(code, new RegExp(method.substring(0, 20))),
          message: 'Method is too long. Consider breaking it down',
          severity: 'medium',
          category: 'style',
        });
      }
    });

    // Duplicate code
    const lines = code.split('\n');
    const duplicates = this.findDuplicateLines(lines);
    if (duplicates.length > 3) {
      smells.push({
        type: 'warning',
        line: duplicates[0],
        message: 'Duplicate code detected. Consider extracting to a function',
        severity: 'medium',
        category: 'style',
      });
    }

    // Magic numbers
    const magicNumbers = code.match(/\b\d{3,}\b/g);
    if (magicNumbers && magicNumbers.length > 2) {
      smells.push({
        type: 'info',
        line: 1,
        message: 'Consider extracting magic numbers to constants',
        severity: 'low',
        category: 'style',
      });
    }

    // Deep nesting
    const maxNesting = this.calculateMaxNesting(code);
    if (maxNesting > 4) {
      smells.push({
        type: 'warning',
        line: 1,
        message: 'Deep nesting detected. Consider refactoring for readability',
        severity: 'medium',
        category: 'style',
      });
    }

    return smells;
  }

  /**
   * Provide personalized feedback
   */
  static generatePersonalizedFeedback(
    analysis: CodeAnalysisResult,
    userLevel: 'beginner' | 'intermediate' | 'advanced'
  ): string[] {
    const feedback: string[] = [];

    if (analysis.quality >= 80) {
      feedback.push('Excellent work! Your code follows best practices.');
    } else if (analysis.quality >= 60) {
      feedback.push('Good effort! A few improvements will make this great.');
    } else {
      feedback.push('Keep practicing! Focus on the suggestions below.');
    }

    // Level-appropriate feedback
    if (userLevel === 'beginner') {
      if (analysis.issues.length > 0) {
        feedback.push('Start by fixing the high-severity issues first.');
      }
      feedback.push('Review the examples in the lesson for reference.');
    } else if (userLevel === 'intermediate') {
      if (analysis.bestPractices.filter((bp) => !bp.followed).length > 0) {
        feedback.push('Focus on incorporating more best practices.');
      }
    } else {
      if (analysis.metrics.complexity > 10) {
        feedback.push('Consider reducing complexity for better maintainability.');
      }
    }

    return feedback;
  }

  // ==================== Helper Methods ====================

  private static calculateMetrics(code: string): CodeMetrics {
    const lines = code.split('\n').filter((l) => l.trim());

    return {
      linesOfCode: lines.length,
      complexity: this.calculateComplexity(code),
      maintainability: this.calculateMaintainability(code),
      testCoverage: this.estimateTestCoverage(code),
      performance: this.estimatePerformance(code),
    };
  }

  private static calculateComplexity(code: string): number {
    // Simplified cyclomatic complexity
    let complexity = 1;

    // Count decision points
    const patterns = [/if\s*\(/, /else/, /for\s*\(/, /while\s*\(/, /case\s/, /&&/, /\|\|/];
    patterns.forEach((pattern) => {
      const matches = code.match(new RegExp(pattern, 'g'));
      complexity += matches?.length || 0;
    });

    return complexity;
  }

  private static calculateMaintainability(code: string): number {
    let score = 100;

    const lines = code.split('\n').filter((l) => l.trim());
    if (lines.length > 100) score -= 10;

    const complexity = this.calculateComplexity(code);
    score -= Math.min(30, complexity * 2);

    const commentRatio = this.calculateCommentRatio(code);
    score += Math.min(10, commentRatio * 20);

    return Math.max(0, Math.min(100, score));
  }

  private static estimateTestCoverage(code: string): number {
    const hasTests = /test\(|it\(|describe\(/.test(code);
    if (!hasTests) return 0;

    const testCount = (code.match(/test\(|it\(/g) || []).length;
    const functionCount = (code.match(/function\s+\w+/g) || []).length;

    return Math.min(100, (testCount / Math.max(functionCount, 1)) * 100);
  }

  private static estimatePerformance(code: string): number {
    let score = 100;

    // Penalize inefficient patterns
    if (/for\s*\(.*for\s*\(/s.test(code)) score -= 20; // Nested loops
    if (/setTimeout|sleep/.test(code)) score -= 15; // Hard waits
    if (/\.then\(.*\.then\(/s.test(code)) score -= 10; // Promise chains

    return Math.max(0, score);
  }

  private static calculateCommentRatio(code: string): number {
    const commentLines = (code.match(/\/\/|\/\*/g) || []).length;
    const totalLines = code.split('\n').length;
    return commentLines / totalLines;
  }

  private static detectIssues(code: string, language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];

    // Syntax-like issues (simplified)
    if (/console\.log/.test(code)) {
      issues.push({
        type: 'info',
        line: this.findLineNumber(code, /console\.log/),
        message: 'Remove console.log statements before submitting',
        severity: 'low',
        category: 'style',
      });
    }

    // Add framework-specific issues
    const frameworkIssues = this.detectCommonMistakes(code, 'playwright');
    issues.push(...frameworkIssues);

    // Add code smells
    const smells = this.detectCodeSmells(code);
    issues.push(...smells);

    return issues;
  }

  private static calculateQualityScore(
    metrics: CodeMetrics,
    issues: CodeIssue[],
    bestPractices: BestPracticeCheck[]
  ): number {
    let score = 100;

    // Penalize based on issues
    issues.forEach((issue) => {
      if (issue.severity === 'high') score -= 10;
      else if (issue.severity === 'medium') score -= 5;
      else score -= 2;
    });

    // Penalize poor metrics
    if (metrics.complexity > 10) score -= (metrics.complexity - 10) * 2;
    if (metrics.maintainability < 60) score -= (60 - metrics.maintainability) * 0.5;

    // Reward best practices
    const followedPractices = bestPractices.filter((bp) => bp.followed).length;
    const practiceScore = (followedPractices / bestPractices.length) * 20;
    score += practiceScore;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static findLineNumber(code: string, pattern: RegExp): number {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return 1;
  }

  private static async getIdealSolution(exerciseId: string): Promise<string | null> {
    // Would fetch from database
    return null;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    // Simplified similarity calculation
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return (intersection.size / union.size) * 100;
  }

  private static extractPatterns(code: string): Set<string> {
    const patterns = new Set<string>();

    // Extract common patterns
    const matches = [
      ...code.matchAll(/getBy\w+/g),
      ...code.matchAll(/expect\([^)]+\)\.\w+/g),
      ...code.matchAll(/await\s+\w+/g),
    ];

    matches.forEach((match) => patterns.add(match[0]));

    return patterns;
  }

  private static findDuplicateLines(lines: string[]): number[] {
    const seen = new Map<string, number[]>();
    const duplicates: number[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length < 10) return;

      if (!seen.has(trimmed)) {
        seen.set(trimmed, [index]);
      } else {
        seen.get(trimmed)?.push(index);
        if (!duplicates.includes(index)) {
          duplicates.push(index);
        }
      }
    });

    return duplicates;
  }

  private static calculateMaxNesting(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }

    return maxDepth;
  }
}
