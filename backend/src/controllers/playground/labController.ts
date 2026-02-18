import { Request, Response } from 'express';
import sandboxService from '../../services/playground/sandboxService.js';

export interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'nodejs' | 'python' | 'java' | 'fullstack' | 'database';
  duration: number; // minutes
  instructions: LabInstruction[];
  checkpoints: LabCheckpoint[];
  resources: LabResource[];
  template: string;
  completionCriteria: CompletionCriteria;
}

export interface LabInstruction {
  step: number;
  title: string;
  content: string;
  code?: string;
  hints?: string[];
}

export interface LabCheckpoint {
  id: string;
  title: string;
  description: string;
  validation: {
    type: 'command' | 'file' | 'output' | 'test';
    criteria: string;
  };
}

export interface LabResource {
  type: 'documentation' | 'tutorial' | 'video' | 'link';
  title: string;
  url: string;
}

export interface CompletionCriteria {
  checkpoints: number; // minimum checkpoints to complete
  tests?: string[];
  files?: string[];
}

export interface LabSession {
  id: string;
  labId: string;
  userId: string;
  sandboxId: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  progress: {
    currentStep: number;
    completedCheckpoints: string[];
    timeSpent: number; // minutes
  };
  startedAt: Date;
  completedAt?: Date;
}

class LabController {
  private labs: Map<string, Lab> = new Map();
  private labSessions: Map<string, LabSession> = new Map();

  constructor() {
    this.initializeLabs();
  }

  /**
   * Initialize predefined labs
   */
  private initializeLabs(): void {
    // Express API Lab
    this.labs.set('express-api-basics', {
      id: 'express-api-basics',
      title: 'Build a RESTful API with Express',
      description: 'Learn to build a RESTful API with Express.js, including routing, middleware, and error handling.',
      difficulty: 'beginner',
      type: 'nodejs',
      duration: 60,
      template: 'express-api',
      instructions: [
        {
          step: 1,
          title: 'Setup Express Server',
          content: 'Create a basic Express server with CORS and JSON middleware.',
          code: `const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
          hints: ['Import required packages', 'Configure middleware', 'Start the server'],
        },
        {
          step: 2,
          title: 'Create User Routes',
          content: 'Implement CRUD operations for a user resource.',
          hints: ['Use appropriate HTTP methods', 'Add route handlers', 'Return proper status codes'],
        },
        {
          step: 3,
          title: 'Add Error Handling',
          content: 'Implement centralized error handling middleware.',
          hints: ['Create error middleware', 'Handle 404 errors', 'Log errors appropriately'],
        },
      ],
      checkpoints: [
        {
          id: 'checkpoint-1',
          title: 'Server is running',
          description: 'Express server starts successfully on port 3000',
          validation: {
            type: 'command',
            criteria: 'curl http://localhost:3000',
          },
        },
        {
          id: 'checkpoint-2',
          title: 'GET /users endpoint',
          description: 'GET endpoint returns user list',
          validation: {
            type: 'command',
            criteria: 'curl http://localhost:3000/users',
          },
        },
        {
          id: 'checkpoint-3',
          title: 'POST /users endpoint',
          description: 'POST endpoint creates a new user',
          validation: {
            type: 'command',
            criteria: 'curl -X POST http://localhost:3000/users -d \'{"name":"Test"}\'',
          },
        },
      ],
      resources: [
        {
          type: 'documentation',
          title: 'Express.js Documentation',
          url: 'https://expressjs.com/',
        },
        {
          type: 'tutorial',
          title: 'REST API Design Best Practices',
          url: 'https://restfulapi.net/',
        },
      ],
      completionCriteria: {
        checkpoints: 3,
        files: ['src/index.js', 'src/routes/users.js'],
      },
    });

    // Playwright Testing Lab
    this.labs.set('playwright-testing-basics', {
      id: 'playwright-testing-basics',
      title: 'Automated Testing with Playwright',
      description: 'Learn browser automation and testing with Playwright.',
      difficulty: 'intermediate',
      type: 'nodejs',
      duration: 90,
      template: 'playwright-testing',
      instructions: [
        {
          step: 1,
          title: 'Setup Playwright',
          content: 'Install and configure Playwright for browser testing.',
          code: `npm install -D @playwright/test
npx playwright install`,
        },
        {
          step: 2,
          title: 'Write Your First Test',
          content: 'Create a test that navigates to a page and verifies content.',
          code: `const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});`,
        },
        {
          step: 3,
          title: 'Interact with Elements',
          content: 'Learn to click, type, and interact with page elements.',
        },
      ],
      checkpoints: [
        {
          id: 'checkpoint-1',
          title: 'Playwright installed',
          description: 'Playwright is successfully installed',
          validation: {
            type: 'file',
            criteria: 'package.json contains @playwright/test',
          },
        },
        {
          id: 'checkpoint-2',
          title: 'Test file created',
          description: 'Created a test file with at least one test',
          validation: {
            type: 'file',
            criteria: 'tests/*.spec.js exists',
          },
        },
        {
          id: 'checkpoint-3',
          title: 'Tests pass',
          description: 'All tests run successfully',
          validation: {
            type: 'command',
            criteria: 'npx playwright test',
          },
        },
      ],
      resources: [
        {
          type: 'documentation',
          title: 'Playwright Documentation',
          url: 'https://playwright.dev/',
        },
      ],
      completionCriteria: {
        checkpoints: 3,
        tests: ['npx playwright test'],
      },
    });

    // Python Flask Lab
    this.labs.set('python-flask-api', {
      id: 'python-flask-api',
      title: 'Building APIs with Flask',
      description: 'Create a RESTful API using Python and Flask framework.',
      difficulty: 'beginner',
      type: 'python',
      duration: 60,
      template: 'python-flask',
      instructions: [
        {
          step: 1,
          title: 'Setup Flask Application',
          content: 'Create a basic Flask application structure.',
          code: `from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify(message='Hello, World!')

if __name__ == '__main__':
    app.run(debug=True)`,
        },
        {
          step: 2,
          title: 'Create API Endpoints',
          content: 'Implement CRUD endpoints for a resource.',
        },
        {
          step: 3,
          title: 'Add Request Validation',
          content: 'Validate incoming request data.',
        },
      ],
      checkpoints: [
        {
          id: 'checkpoint-1',
          title: 'Flask server running',
          description: 'Flask application starts successfully',
          validation: {
            type: 'command',
            criteria: 'curl http://localhost:5000',
          },
        },
      ],
      resources: [
        {
          type: 'documentation',
          title: 'Flask Documentation',
          url: 'https://flask.palletsprojects.com/',
        },
      ],
      completionCriteria: {
        checkpoints: 1,
      },
    });
  }

  /**
   * Get all labs
   */
  async getAllLabs(req: Request, res: Response): Promise<void> {
    try {
      const { difficulty, type } = req.query;

      let labs = Array.from(this.labs.values());

      // Filter by difficulty
      if (difficulty && typeof difficulty === 'string') {
        labs = labs.filter((lab) => lab.difficulty === difficulty);
      }

      // Filter by type
      if (type && typeof type === 'string') {
        labs = labs.filter((lab) => lab.type === type);
      }

      res.json({ labs, count: labs.length });
    } catch (error) {
      console.error('Error getting labs:', error);
      res.status(500).json({ error: 'Failed to get labs' });
    }
  }

  /**
   * Get lab by ID
   */
  async getLabById(req: Request, res: Response): Promise<void> {
    try {
      const { labId } = req.params;
      const lab = this.labs.get(labId);

      if (!lab) {
        res.status(404).json({ error: 'Lab not found' });
        return;
      }

      res.json(lab);
    } catch (error) {
      console.error('Error getting lab:', error);
      res.status(500).json({ error: 'Failed to get lab' });
    }
  }

  /**
   * Start lab session
   */
  async startLabSession(req: Request, res: Response): Promise<void> {
    try {
      const { labId } = req.params;
      const userId = (req as any).user?.id || 'anonymous';

      const lab = this.labs.get(labId);
      if (!lab) {
        res.status(404).json({ error: 'Lab not found' });
        return;
      }

      // Create sandbox for the lab
      const sandbox = await sandboxService.createSandbox({
        userId,
        type: lab.type,
        template: lab.template,
        duration: lab.duration,
      });

      // Create lab session
      const sessionId = `lab-session-${Date.now()}`;
      const session: LabSession = {
        id: sessionId,
        labId,
        userId,
        sandboxId: sandbox.id,
        status: 'in-progress',
        progress: {
          currentStep: 1,
          completedCheckpoints: [],
          timeSpent: 0,
        },
        startedAt: new Date(),
      };

      this.labSessions.set(sessionId, session);

      res.status(201).json({
        session,
        sandbox,
        lab: {
          id: lab.id,
          title: lab.title,
          instructions: lab.instructions,
          checkpoints: lab.checkpoints,
        },
      });
    } catch (error) {
      console.error('Error starting lab session:', error);
      res.status(500).json({
        error: 'Failed to start lab session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get lab session
   */
  async getLabSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = this.labSessions.get(sessionId);

      if (!session) {
        res.status(404).json({ error: 'Lab session not found' });
        return;
      }

      const lab = this.labs.get(session.labId);
      const sandbox = sandboxService.getSandbox(session.sandboxId);

      res.json({
        session,
        lab,
        sandbox,
      });
    } catch (error) {
      console.error('Error getting lab session:', error);
      res.status(500).json({ error: 'Failed to get lab session' });
    }
  }

  /**
   * Update lab progress
   */
  async updateLabProgress(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { currentStep, completedCheckpoints, timeSpent } = req.body;

      const session = this.labSessions.get(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Lab session not found' });
        return;
      }

      // Update progress
      if (currentStep !== undefined) {
        session.progress.currentStep = currentStep;
      }
      if (completedCheckpoints !== undefined) {
        session.progress.completedCheckpoints = completedCheckpoints;
      }
      if (timeSpent !== undefined) {
        session.progress.timeSpent = timeSpent;
      }

      // Check if lab is completed
      const lab = this.labs.get(session.labId);
      if (lab) {
        const completedCount = session.progress.completedCheckpoints.length;
        if (completedCount >= lab.completionCriteria.checkpoints) {
          session.status = 'completed';
          session.completedAt = new Date();
        }
      }

      res.json(session);
    } catch (error) {
      console.error('Error updating lab progress:', error);
      res.status(500).json({ error: 'Failed to update lab progress' });
    }
  }

  /**
   * Validate checkpoint
   */
  async validateCheckpoint(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, checkpointId } = req.params;

      const session = this.labSessions.get(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Lab session not found' });
        return;
      }

      const lab = this.labs.get(session.labId);
      if (!lab) {
        res.status(404).json({ error: 'Lab not found' });
        return;
      }

      const checkpoint = lab.checkpoints.find((cp) => cp.id === checkpointId);
      if (!checkpoint) {
        res.status(404).json({ error: 'Checkpoint not found' });
        return;
      }

      // Validate checkpoint based on type
      let isValid = false;
      let details = '';

      switch (checkpoint.validation.type) {
        case 'command':
          try {
            const result = await sandboxService.executeCommand(session.sandboxId, {
              command: checkpoint.validation.criteria,
              timeout: 30000,
            });
            isValid = result.success && result.exitCode === 0;
            details = result.stdout || result.stderr;
          } catch (error) {
            isValid = false;
            details = error instanceof Error ? error.message : 'Command failed';
          }
          break;

        case 'file':
          try {
            const files = await sandboxService.listFiles(session.sandboxId, '/');
            isValid = this.checkFileCriteria(files, checkpoint.validation.criteria);
            details = isValid ? 'File exists' : 'File not found';
          } catch (error) {
            isValid = false;
            details = 'Failed to check file';
          }
          break;

        case 'output':
          // Check if specific output was produced
          isValid = false;
          details = 'Output validation not implemented';
          break;

        case 'test':
          // Run tests
          try {
            const result = await sandboxService.executeCommand(session.sandboxId, {
              command: checkpoint.validation.criteria,
              timeout: 60000,
            });
            isValid = result.success && result.exitCode === 0;
            details = result.stdout || result.stderr;
          } catch (error) {
            isValid = false;
            details = 'Tests failed';
          }
          break;
      }

      // Update session if valid
      if (isValid && !session.progress.completedCheckpoints.includes(checkpointId)) {
        session.progress.completedCheckpoints.push(checkpointId);
      }

      res.json({
        valid: isValid,
        checkpointId,
        details,
        progress: session.progress,
      });
    } catch (error) {
      console.error('Error validating checkpoint:', error);
      res.status(500).json({
        error: 'Failed to validate checkpoint',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Complete lab session
   */
  async completeLabSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const session = this.labSessions.get(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Lab session not found' });
        return;
      }

      session.status = 'completed';
      session.completedAt = new Date();

      // Clean up sandbox
      await sandboxService.stopSandbox(session.sandboxId);

      res.json({
        success: true,
        session,
        message: 'Lab completed successfully!',
      });
    } catch (error) {
      console.error('Error completing lab session:', error);
      res.status(500).json({ error: 'Failed to complete lab session' });
    }
  }

  /**
   * Abandon lab session
   */
  async abandonLabSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const session = this.labSessions.get(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Lab session not found' });
        return;
      }

      session.status = 'abandoned';

      // Clean up sandbox
      await sandboxService.deleteSandbox(session.sandboxId);
      this.labSessions.delete(sessionId);

      res.json({ success: true, message: 'Lab session abandoned' });
    } catch (error) {
      console.error('Error abandoning lab session:', error);
      res.status(500).json({ error: 'Failed to abandon lab session' });
    }
  }

  /**
   * Get user lab sessions
   */
  async getUserLabSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const sessions = Array.from(this.labSessions.values()).filter(
        (s) => s.userId === userId
      );

      res.json({ sessions, count: sessions.length });
    } catch (error) {
      console.error('Error getting user lab sessions:', error);
      res.status(500).json({ error: 'Failed to get lab sessions' });
    }
  }

  /**
   * Helper: Check file criteria
   */
  private checkFileCriteria(files: any[], criteria: string): boolean {
    // Simple check if file path matches criteria
    return files.some((file) =>
      file.path?.includes(criteria) || file.name?.includes(criteria)
    );
  }
}

export default new LabController();
