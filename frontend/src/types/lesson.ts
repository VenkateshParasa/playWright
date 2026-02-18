export interface LessonIndex {
  version: string;
  lastUpdated: string;
  totalLessons: number;
  tracks: {
    [key: string]: {
      name: string;
      description: string;
      totalLessons: number;
      categories: {
        [key: string]: {
          count: number;
          estimatedHours: number;
          description: string;
        };
      };
    };
  };
  categories: Array<{
    id: string;
    name: string;
    description: string;
    difficulty: number;
  }>;
  statistics: {
    totalEstimatedHours: number;
    totalXP: number;
    tracksAvailable: number;
    categoriesPerTrack: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  track: 'playwright' | 'selenium';
  category: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  duration: number;
  description: string;
  objectives: string[];
  prerequisites: string[];
  content: {
    sections: LessonSection[];
  };
  keyTakeaways: string[];
  resources: LessonResource[];
  quiz?: string;
  nextLesson?: string;
  estimatedXP: number;
  tags: string[];
}

export interface LessonSection {
  title: string;
  type: 'text' | 'code' | 'video' | 'interactive';
  content?: string;
  language?: string;
  code?: string;
  explanation?: string;
  videoUrl?: string;
}

export interface LessonResource {
  title: string;
  url: string;
  type: 'documentation' | 'article' | 'video' | 'repository' | 'tutorial';
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  completed: boolean;
  progress: number;
  timeSpent: number;
  lastAccessed: Date;
  completedAt?: Date;
}