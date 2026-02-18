import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface WorkdayConfig {
  tenantName: string;
  username: string;
  password: string;
  apiVersion?: string;
  baseUrl?: string;
}

export interface WorkdayEmployee {
  workerId: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  status?: string;
  manager?: string;
}

export interface LearningRecord {
  workerId: string;
  courseName: string;
  courseId: string;
  status: 'In Progress' | 'Completed' | 'Not Started';
  enrollmentDate: string;
  completionDate?: string;
  score?: number;
  credits?: number;
  dueDate?: string;
}

export interface ComplianceTraining {
  workerId: string;
  trainingName: string;
  trainingId: string;
  requiredBy: string;
  completionDate?: string;
  status: 'Compliant' | 'Non-Compliant' | 'Pending';
  expirationDate?: string;
}

export class WorkdayClient extends EventEmitter {
  private config: WorkdayConfig;
  private apiClient: AxiosInstance;
  private baseUrl: string;

  constructor(config: WorkdayConfig) {
    super();
    this.config = {
      ...config,
      apiVersion: config.apiVersion || 'v1',
    };

    this.baseUrl = config.baseUrl ||
      `https://wd2-impl-services1.workday.com/ccx/service/${config.tenantName}`;

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: config.username,
        password: config.password,
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Get employee by ID
   */
  async getEmployee(workerId: string): Promise<WorkdayEmployee | null> {
    try {
      const response = await this.apiClient.get(
        `/Human_Resources/${this.config.apiVersion}/workers/${workerId}`
      );

      const worker = response.data;
      return this.parseEmployeeData(worker);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      this.emit('error', error);
      throw new Error(`Failed to get Workday employee: ${error.message}`);
    }
  }

  /**
   * Get employee by email
   */
  async getEmployeeByEmail(email: string): Promise<WorkdayEmployee | null> {
    try {
      const response = await this.apiClient.get(
        `/Human_Resources/${this.config.apiVersion}/workers`,
        {
          params: {
            email,
          },
        }
      );

      const workers = response.data.data || [];
      if (workers.length > 0) {
        return this.parseEmployeeData(workers[0]);
      }

      return null;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Sync employee data
   */
  async syncEmployees(limit: number = 100, offset: number = 0): Promise<WorkdayEmployee[]> {
    try {
      const response = await this.apiClient.get(
        `/Human_Resources/${this.config.apiVersion}/workers`,
        {
          params: {
            limit,
            offset,
          },
        }
      );

      const workers = response.data.data || [];
      const employees = workers.map((worker: any) => this.parseEmployeeData(worker));

      this.emit('employees_synced', employees.length);
      return employees;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create learning record
   */
  async createLearningRecord(record: LearningRecord): Promise<string> {
    try {
      const response = await this.apiClient.post(
        `/Learning/${this.config.apiVersion}/learner_enrollments`,
        {
          worker: {
            id: record.workerId,
          },
          learning_content: {
            id: record.courseId,
            descriptor: record.courseName,
          },
          enrollment_date: record.enrollmentDate,
          completion_date: record.completionDate,
          status: record.status,
          score: record.score,
          credits: record.credits,
          due_date: record.dueDate,
        }
      );

      const enrollmentId = response.data.id;
      this.emit('learning_record_created', enrollmentId);
      return enrollmentId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create learning record: ${error.message}`);
    }
  }

  /**
   * Update learning record
   */
  async updateLearningRecord(
    enrollmentId: string,
    updates: Partial<LearningRecord>
  ): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.status) updateData.status = updates.status;
      if (updates.completionDate) updateData.completion_date = updates.completionDate;
      if (updates.score !== undefined) updateData.score = updates.score;
      if (updates.credits !== undefined) updateData.credits = updates.credits;

      await this.apiClient.patch(
        `/Learning/${this.config.apiVersion}/learner_enrollments/${enrollmentId}`,
        updateData
      );

      this.emit('learning_record_updated', enrollmentId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get learning records for an employee
   */
  async getLearningRecords(workerId: string): Promise<LearningRecord[]> {
    try {
      const response = await this.apiClient.get(
        `/Learning/${this.config.apiVersion}/learner_enrollments`,
        {
          params: {
            worker: workerId,
          },
        }
      );

      const enrollments = response.data.data || [];
      return enrollments.map((enrollment: any) => this.parseLearningRecord(enrollment));
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Track compliance training
   */
  async trackComplianceTraining(training: ComplianceTraining): Promise<string> {
    try {
      const response = await this.apiClient.post(
        `/Learning/${this.config.apiVersion}/compliance_trainings`,
        {
          worker: {
            id: training.workerId,
          },
          training: {
            id: training.trainingId,
            descriptor: training.trainingName,
          },
          required_by: training.requiredBy,
          completion_date: training.completionDate,
          status: training.status,
          expiration_date: training.expirationDate,
        }
      );

      const recordId = response.data.id;
      this.emit('compliance_tracked', recordId);
      return recordId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to track compliance training: ${error.message}`);
    }
  }

  /**
   * Get compliance training status
   */
  async getComplianceStatus(workerId: string): Promise<ComplianceTraining[]> {
    try {
      const response = await this.apiClient.get(
        `/Learning/${this.config.apiVersion}/compliance_trainings`,
        {
          params: {
            worker: workerId,
          },
        }
      );

      const trainings = response.data.data || [];
      return trainings.map((training: any) => this.parseComplianceTraining(training));
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Provision user account
   */
  async provisionUser(employee: WorkdayEmployee): Promise<string> {
    try {
      const response = await this.apiClient.post(
        `/Human_Resources/${this.config.apiVersion}/workers`,
        {
          first_name: employee.firstName,
          last_name: employee.lastName,
          email: employee.email,
          employee_id: employee.employeeId,
          job_title: employee.jobTitle,
          department: employee.department,
          hire_date: employee.hireDate,
          status: employee.status || 'Active',
        }
      );

      const workerId = response.data.id;
      this.emit('user_provisioned', workerId);
      return workerId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to provision user: ${error.message}`);
    }
  }

  /**
   * Update employee data
   */
  async updateEmployee(
    workerId: string,
    updates: Partial<WorkdayEmployee>
  ): Promise<void> {
    try {
      await this.apiClient.patch(
        `/Human_Resources/${this.config.apiVersion}/workers/${workerId}`,
        updates
      );

      this.emit('employee_updated', workerId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get learning plan for employee
   */
  async getLearningPlan(workerId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `/Learning/${this.config.apiVersion}/learning_plans`,
        {
          params: {
            worker: workerId,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Sync learning plan
   */
  async syncLearningPlan(
    workerId: string,
    courses: Array<{ courseId: string; courseName: string; dueDate?: string }>
  ): Promise<void> {
    try {
      await this.apiClient.post(
        `/Learning/${this.config.apiVersion}/learning_plans`,
        {
          worker: {
            id: workerId,
          },
          items: courses.map(course => ({
            learning_content: {
              id: course.courseId,
              descriptor: course.courseName,
            },
            due_date: course.dueDate,
          })),
        }
      );

      this.emit('learning_plan_synced', workerId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get performance data
   */
  async getPerformanceData(workerId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `/Performance/${this.config.apiVersion}/performance_reviews`,
        {
          params: {
            worker: workerId,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Parse employee data from Workday format
   */
  private parseEmployeeData(worker: any): WorkdayEmployee {
    return {
      workerId: worker.id,
      firstName: worker.first_name || worker.firstName,
      lastName: worker.last_name || worker.lastName,
      email: worker.email,
      employeeId: worker.employee_id || worker.employeeId,
      jobTitle: worker.job_title || worker.jobTitle,
      department: worker.department,
      hireDate: worker.hire_date || worker.hireDate,
      status: worker.status,
      manager: worker.manager?.id,
    };
  }

  /**
   * Parse learning record from Workday format
   */
  private parseLearningRecord(enrollment: any): LearningRecord {
    return {
      workerId: enrollment.worker?.id,
      courseName: enrollment.learning_content?.descriptor,
      courseId: enrollment.learning_content?.id,
      status: enrollment.status,
      enrollmentDate: enrollment.enrollment_date,
      completionDate: enrollment.completion_date,
      score: enrollment.score,
      credits: enrollment.credits,
      dueDate: enrollment.due_date,
    };
  }

  /**
   * Parse compliance training from Workday format
   */
  private parseComplianceTraining(training: any): ComplianceTraining {
    return {
      workerId: training.worker?.id,
      trainingName: training.training?.descriptor,
      trainingId: training.training?.id,
      requiredBy: training.required_by,
      completionDate: training.completion_date,
      status: training.status,
      expirationDate: training.expiration_date,
    };
  }
}

export default WorkdayClient;
