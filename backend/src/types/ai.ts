/**
 * Type Definitions for AI-Powered Learning Features
 * Automated Grading, Content Generation, and Intelligent Tutoring
 */

export interface CodeSubmission {
  code: string;
  language: 'javascript' | 'typescript' | 'python' | 'java';
  exerciseId: string;
  userId: string;
  testCases?: TestCase[];
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  weight: number;
  hidden?: boolean;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTime: number;
  error?: string;
}

export interface StyleIssue {
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  line: number;
  description: string;
  recommendation: string;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  complexity: {
    cyclomatic: number;
    cognitive: number;
  };
  suggestions: string[];
}

export interface PlagiarismResult {
  similarity: number;
  matchedSubmissions: Array<{
    submissionId: string;
    userId: string;
    similarity: number;
    matchedLines: number[];
  }>;
  externalMatches?: Array<{
    source: string;
    url: string;
    similarity: number;
  }>;
}

export interface GradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  testResults: TestResult[];
  styleIssues: StyleIssue[];
  securityVulnerabilities: SecurityVulnerability[];
  performanceMetrics: PerformanceMetrics;
  plagiarismResult?: PlagiarismResult;
  feedback: string[];
  partialCredits: {
    tests: number;
    style: number;
    performance: number;
    security: number;
  };
  gradedAt: Date;
}

export interface EssaySubmission {
  content: string;
  questionId: string;
  userId: string;
  rubric?: Rubric;
  maxWords?: number;
}

export interface Rubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: Array<{
    score: number;
    description: string;
  }>;
}

export interface EssayGradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  criteriaScores: Array<{
    criterionId: string;
    score: number;
    feedback: string;
  }>;
  keyConcepts: {
    identified: string[];
    missing: string[];
  };
  grammarAnalysis: {
    errors: number;
    suggestions: Array<{
      text: string;
      suggestion: string;
      type: string;
    }>;
  };
  readabilityScore: number;
  plagiarismScore: number;
  feedback: string[];
  requiresHumanReview: boolean;
  gradedAt: Date;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'coding';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  estimatedTime: number;
}

export interface GeneratedContent {
  type: 'quiz' | 'exercise' | 'flashcard' | 'summary' | 'explanation';
  content: any;
  sourceContext: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  metadata: {
    generatedAt: Date;
    model: string;
    confidence: number;
    reviewRequired: boolean;
  };
}

export interface FlashcardGeneration {
  front: string;
  back: string;
  category: string;
  tags: string[];
}

export interface ExerciseGeneration {
  title: string;
  description: string;
  instructions: string[];
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
}

export interface TutoringRequest {
  userId: string;
  exerciseId: string;
  context: {
    currentCode?: string;
    attempts: number;
    timeSpent: number;
    errors: string[];
  };
  type: 'hint' | 'explanation' | 'debug' | 'concept';
  specificQuestion?: string;
}

export interface TutoringResponse {
  type: 'hint' | 'explanation' | 'debug' | 'concept';
  content: string;
  progressive: boolean;
  level: number;
  suggestions: string[];
  relatedConcepts: string[];
  nextSteps: string[];
}

export interface HintGeneration {
  level: number;
  hint: string;
  revealed: boolean;
  nextHintAvailable: boolean;
}

export interface MistakeDetection {
  type: string;
  description: string;
  lineNumber?: number;
  suggestion: string;
  commonMistake: boolean;
  resources: Array<{
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'video';
  }>;
}

export interface LearningPathRecommendation {
  userId: string;
  currentLevel: string;
  recommendations: Array<{
    lessonId: string;
    title: string;
    reason: string;
    priority: number;
    estimatedTime: number;
    prerequisites: string[];
  }>;
  skills: {
    current: string[];
    target: string[];
    gaps: string[];
  };
  adaptiveDifficulty: 'easy' | 'medium' | 'hard';
}

export interface ContentQualityScore {
  overall: number;
  dimensions: {
    clarity: number;
    completeness: number;
    accuracy: number;
    engagement: number;
    accessibility: number;
  };
  suggestions: string[];
  predictedEngagement: number;
  readabilityLevel: string;
}

export interface ContentAnalysis {
  tags: string[];
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives: string[];
  estimatedTime: number;
  relatedContent: Array<{
    id: string;
    title: string;
    relevance: number;
  }>;
  keyTopics: string[];
}

export interface AIAssistantRequest {
  userId: string;
  question: string;
  context?: {
    lessonId?: string;
    exerciseId?: string;
    currentCode?: string;
    history?: Array<{
      question: string;
      answer: string;
    }>;
  };
  type: 'question' | 'debug' | 'explain' | 'resource';
}

export interface AIAssistantResponse {
  answer: string;
  confidence: number;
  sources: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
  relatedQuestions: string[];
  codeExamples?: Array<{
    language: string;
    code: string;
    explanation: string;
  }>;
  debugSuggestions?: string[];
}

export interface CodeExecutionRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'python' | 'java';
  input?: string;
  timeout?: number;
  memoryLimit?: number;
}

export interface CodeExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  exitCode: number;
  sandboxed: boolean;
}

export interface AIModelConfig {
  provider: 'openai' | 'huggingface' | 'local';
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
}

export interface ContentGenerationRequest {
  type: 'quiz' | 'exercise' | 'flashcard' | 'summary' | 'explanation';
  sourceContent: string;
  sourceType: 'lesson' | 'video' | 'documentation' | 'transcript';
  options: {
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    includeExplanations?: boolean;
    language?: string;
  };
}

export interface QuizGenerationOptions {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  includeMultipleChoice: boolean;
  includeTrueFalse: boolean;
  includeShortAnswer: boolean;
  distractorQuality: 'basic' | 'advanced';
}

export interface ExerciseVariation {
  originalExerciseId: string;
  variations: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    changes: string[];
  }>;
}

export interface StudyPlanGeneration {
  userId: string;
  goals: string[];
  timeAvailable: number;
  currentSkillLevel: string;
  plan: Array<{
    week: number;
    topics: string[];
    exercises: string[];
    estimatedHours: number;
    milestones: string[];
  }>;
  adaptiveAdjustments: boolean;
}
