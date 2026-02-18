export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  suspendedAt?: string;
  suspendedBy?: string;
  suspendedReason?: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  lessonsCompleted: string[];
  quizzesCompleted: string[];
  exercisesCompleted: string[];
  flashcardsReviewed: number;
  totalStudyTime: number;
  streak: number;
  achievements: string[];
}

export interface UserWithProgress {
  user: User;
  progress?: UserProgress;
}

export interface UserFilters {
  search: string;
  role: 'all' | 'student' | 'instructor' | 'admin';
  status: 'all' | 'active' | 'suspended' | 'deleted';
  sortBy: 'createdAt' | 'lastName' | 'email' | 'lastLogin';
  sortOrder: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  deleted: number;
  newRegistrations: {
    thisWeek: number;
    thisMonth: number;
  };
  activeUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  roleDistribution: {
    student?: number;
    instructor?: number;
    admin?: number;
  };
}

export interface Activity {
  type: 'lesson_completed' | 'quiz_completed' | 'exercise_completed' | 'review_session' | 'achievement_unlocked';
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Role {
  name: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface BulkOperation {
  operation: 'suspend' | 'activate' | 'delete' | 'export';
  userIds: string[];
  data?: {
    reason?: string;
  };
}
