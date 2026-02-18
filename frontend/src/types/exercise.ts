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
  passed: boolean;
  actual?: any;
  expected?: any;
  error?: string;
  executionTime?: number;
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
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}
