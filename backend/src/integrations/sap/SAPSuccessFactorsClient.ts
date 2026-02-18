import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

export interface SAPConfig {
  apiUrl: string;
  companyId: string;
  username: string;
  password: string;
  apiVersion?: string;
}

export interface SAPUser {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
  hireDate?: string;
  department?: string;
  jobTitle?: string;
}

export interface SAPLearningItem {
  itemId: string;
  itemName: string;
  itemType: 'Course' | 'Curriculum' | 'Program';
  status: 'Not Started' | 'In Progress' | 'Completed';
  completionPercentage?: number;
  dueDate?: string;
  completionDate?: string;
}

export interface SAPLearningPlan {
  planId: string;
  userId: string;
  items: SAPLearningItem[];
  startDate: string;
  endDate?: string;
}

export interface SAPPerformanceGoal {
  goalId: string;
  userId: string;
  goalName: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate: string;
  weight?: number;
}

export class SAPSuccessFactorsClient extends EventEmitter {
  private config: SAPConfig;
  private apiClient: AxiosInstance;

  constructor(config: SAPConfig) {
    super();
    this.config = {
      ...config,
      apiVersion: config.apiVersion || 'v1',
    };

    this.apiClient = axios.create({
      baseURL: `${config.apiUrl}/odata/${this.config.apiVersion}`,
      auth: {
        username: `${config.username}@${config.companyId}`,
        password: config.password,
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<SAPUser | null> {
    try {
      const response = await this.apiClient.get(`/User('${userId}')`);
      return this.parseUser(response.data.d);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      this.emit('error', error);
      throw new Error(`Failed to get SAP user: ${error.message}`);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<SAPUser | null> {
    try {
      const response = await this.apiClient.get('/User', {
        params: {
          $filter: `email eq '${email}'`,
        },
      });

      const users = response.data.d.results || [];
      if (users.length > 0) {
        return this.parseUser(users[0]);
      }

      return null;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Provision user
   */
  async provisionUser(user: Omit<SAPUser, 'userId'>): Promise<string> {
    try {
      const response = await this.apiClient.post('/User', {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status || 'Active',
        hireDate: user.hireDate,
        department: user.department,
        jobTitle: user.jobTitle,
      });

      const userId = response.data.d.userId;
      this.emit('user_provisioned', userId);
      return userId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to provision SAP user: ${error.message}`);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<SAPUser>): Promise<void> {
    try {
      await this.apiClient.patch(`/User('${userId}')`, updates);
      this.emit('user_updated', userId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get learning plan for user
   */
  async getLearningPlan(userId: string): Promise<SAPLearningPlan[]> {
    try {
      const response = await this.apiClient.get('/LearningPlan', {
        params: {
          $filter: `userId eq '${userId}'`,
          $expand: 'items',
        },
      });

      const plans = response.data.d.results || [];
      return plans.map((plan: any) => this.parseLearningPlan(plan));
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Sync learning plan
   */
  async syncLearningPlan(plan: SAPLearningPlan): Promise<string> {
    try {
      const response = await this.apiClient.post('/LearningPlan', {
        userId: plan.userId,
        startDate: plan.startDate,
        endDate: plan.endDate,
      });

      const planId = response.data.d.planId;

      // Add learning items to plan
      for (const item of plan.items) {
        await this.addLearningItemToPlan(planId, item);
      }

      this.emit('learning_plan_synced', planId);
      return planId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to sync learning plan: ${error.message}`);
    }
  }

  /**
   * Add learning item to plan
   */
  async addLearningItemToPlan(
    planId: string,
    item: SAPLearningItem
  ): Promise<void> {
    try {
      await this.apiClient.post(`/LearningPlan('${planId}')/items`, {
        itemId: item.itemId,
        itemName: item.itemName,
        itemType: item.itemType,
        status: item.status,
        dueDate: item.dueDate,
      });

      this.emit('learning_item_added', item.itemId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Update learning item status
   */
  async updateLearningItemStatus(
    itemId: string,
    status: string,
    completionPercentage?: number,
    completionDate?: string
  ): Promise<void> {
    try {
      await this.apiClient.patch(`/LearningItem('${itemId}')`, {
        status,
        completionPercentage,
        completionDate,
      });

      this.emit('learning_item_updated', itemId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get user learning history
   */
  async getLearningHistory(userId: string): Promise<SAPLearningItem[]> {
    try {
      const response = await this.apiClient.get('/LearningHistory', {
        params: {
          $filter: `userId eq '${userId}'`,
        },
      });

      const items = response.data.d.results || [];
      return items.map((item: any) => this.parseLearningItem(item));
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get performance goals
   */
  async getPerformanceGoals(userId: string): Promise<SAPPerformanceGoal[]> {
    try {
      const response = await this.apiClient.get('/Goal', {
        params: {
          $filter: `userId eq '${userId}'`,
        },
      });

      const goals = response.data.d.results || [];
      return goals.map((goal: any) => this.parsePerformanceGoal(goal));
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create performance goal
   */
  async createPerformanceGoal(goal: Omit<SAPPerformanceGoal, 'goalId'>): Promise<string> {
    try {
      const response = await this.apiClient.post('/Goal', {
        userId: goal.userId,
        name: goal.goalName,
        description: goal.description,
        status: goal.status,
        dueDate: goal.dueDate,
        weight: goal.weight,
      });

      const goalId = response.data.d.goalId;
      this.emit('performance_goal_created', goalId);
      return goalId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create performance goal: ${error.message}`);
    }
  }

  /**
   * Update performance goal
   */
  async updatePerformanceGoal(
    goalId: string,
    updates: Partial<SAPPerformanceGoal>
  ): Promise<void> {
    try {
      await this.apiClient.patch(`/Goal('${goalId}')`, updates);
      this.emit('performance_goal_updated', goalId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Sync performance data
   */
  async syncPerformanceData(
    userId: string,
    data: {
      rating?: number;
      reviewComments?: string;
      reviewDate?: string;
    }
  ): Promise<void> {
    try {
      await this.apiClient.post('/PerformanceReview', {
        userId,
        rating: data.rating,
        comments: data.reviewComments,
        reviewDate: data.reviewDate || new Date().toISOString(),
      });

      this.emit('performance_data_synced', userId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get user's direct reports
   */
  async getDirectReports(userId: string): Promise<SAPUser[]> {
    try {
      const response = await this.apiClient.get('/User', {
        params: {
          $filter: `manager/userId eq '${userId}'`,
        },
      });

      const users = response.data.d.results || [];
      return users.map((user: any) => this.parseUser(user));
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Batch sync users
   */
  async batchSyncUsers(limit: number = 100, offset: number = 0): Promise<SAPUser[]> {
    try {
      const response = await this.apiClient.get('/User', {
        params: {
          $top: limit,
          $skip: offset,
        },
      });

      const users = response.data.d.results || [];
      const parsedUsers = users.map((user: any) => this.parseUser(user));

      this.emit('users_synced', parsedUsers.length);
      return parsedUsers;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Parse user data
   */
  private parseUser(data: any): SAPUser {
    return {
      userId: data.userId,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      status: data.status,
      hireDate: data.hireDate,
      department: data.department,
      jobTitle: data.jobTitle,
    };
  }

  /**
   * Parse learning plan
   */
  private parseLearningPlan(data: any): SAPLearningPlan {
    return {
      planId: data.planId,
      userId: data.userId,
      items: (data.items?.results || []).map((item: any) => this.parseLearningItem(item)),
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  /**
   * Parse learning item
   */
  private parseLearningItem(data: any): SAPLearningItem {
    return {
      itemId: data.itemId,
      itemName: data.itemName,
      itemType: data.itemType,
      status: data.status,
      completionPercentage: data.completionPercentage,
      dueDate: data.dueDate,
      completionDate: data.completionDate,
    };
  }

  /**
   * Parse performance goal
   */
  private parsePerformanceGoal(data: any): SAPPerformanceGoal {
    return {
      goalId: data.goalId,
      userId: data.userId,
      goalName: data.name,
      description: data.description,
      status: data.status,
      dueDate: data.dueDate,
      weight: data.weight,
    };
  }
}

export default SAPSuccessFactorsClient;
