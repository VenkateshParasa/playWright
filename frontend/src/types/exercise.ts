export type ProgrammingLanguage = 'typescript' | 'javascript' | 'java';

export interface TestCase {
  id: string;
  name: string;
  input: any;
  expectedOutput: any;
  hidden?: boolean; // Hidden test cases are not shown to students
}

export interface TestResult {
  testId: string;
  testName: string;
  passed: boolean | null; // null indicates test was not executed (e.g., Java requiring backend)
  actual?: any;
  expected?: any;
  error?: string;
  executionTime?: number;
  message?: string; // Additional message for test results
}

export interface Hint {
  id: string;
  level: number; // 1 = gentle nudge, 2 = more specific, 3 = nearly the answer
  content: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedTime: number; // in minutes
  language: ProgrammingLanguage;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  hints: Hint[];
  instructions: string[];
  learningObjectives: string[];
  tags: string[];
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  code: string;
  timestamp: Date;
  testResults: TestResult[];
  passed: boolean;
  score: number;
  timeSpent: number; // in seconds
}

export interface ExerciseProgress {
  exerciseId: string;
  currentCode: string;
  attempts: ExerciseAttempt[];
  hintsRevealed: string[];
  solutionViewed: boolean;
  completed: boolean;
  bestScore: number;
  totalTimeSpent: number; // in seconds
  lastAttemptDate?: Date;
  completedDate?: Date;
}

export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  logs: string[];
  testResults?: TestResult[];
  executionTime: number;
  requiresBackend?: boolean; // Indicates that backend execution is required
  message?: string; // Additional execution message
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}
