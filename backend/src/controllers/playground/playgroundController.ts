import { Request, Response } from 'express';
import codeExecutionService from '../../services/playground/codeExecutionService.js';
import sandboxService from '../../services/playground/sandboxService.js';
import playwrightSandbox from '../../services/playground/playwrightSandbox.js';

export class PlaygroundController {
  /**
   * Execute code
   */
  async executeCode(req: Request, res: Response): Promise<void> {
    try {
      const { code, language, input, timeout, memoryLimit, files } = req.body;

      if (!code || !language) {
        res.status(400).json({ error: 'Code and language are required' });
        return;
      }

      // Validate code
      const validation = codeExecutionService.validateCode(code, language);
      if (!validation.valid) {
        res.status(400).json({
          error: 'Code validation failed',
          details: validation.errors
        });
        return;
      }

      // Execute code
      const result = await codeExecutionService.executeCode({
        code,
        language,
        input,
        timeout,
        memoryLimit,
        files,
      });

      res.json(result);
    } catch (error) {
      console.error('Code execution error:', error);
      res.status(500).json({
        error: 'Failed to execute code',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = codeExecutionService.getSupportedLanguages();
      const configs = languages.map(lang => ({
        language: lang,
        config: codeExecutionService.getLanguageConfig(lang),
      }));

      res.json({ languages, configs });
    } catch (error) {
      console.error('Error getting supported languages:', error);
      res.status(500).json({ error: 'Failed to get supported languages' });
    }
  }

  /**
   * Health check
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await codeExecutionService.healthCheck();
      res.json({
        healthy: isHealthy,
        service: 'code-execution',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        healthy: false,
        error: 'Health check failed'
      });
    }
  }

  /**
   * Create sandbox
   */
  async createSandbox(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const { type, template, duration, resources, environment } = req.body;

      if (!type) {
        res.status(400).json({ error: 'Sandbox type is required' });
        return;
      }

      const sandbox = await sandboxService.createSandbox({
        userId,
        type,
        template,
        duration,
        resources,
        environment,
      });

      res.status(201).json(sandbox);
    } catch (error) {
      console.error('Sandbox creation error:', error);
      res.status(500).json({
        error: 'Failed to create sandbox',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get sandbox
   */
  async getSandbox(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      const sandbox = sandboxService.getSandbox(sandboxId);

      if (!sandbox) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }

      res.json(sandbox);
    } catch (error) {
      console.error('Error getting sandbox:', error);
      res.status(500).json({ error: 'Failed to get sandbox' });
    }
  }

  /**
   * Get user sandboxes
   */
  async getUserSandboxes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const sandboxes = sandboxService.getUserSandboxes(userId);

      res.json({ sandboxes, count: sandboxes.length });
    } catch (error) {
      console.error('Error getting user sandboxes:', error);
      res.status(500).json({ error: 'Failed to get sandboxes' });
    }
  }

  /**
   * Execute command in sandbox
   */
  async executeCommand(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      const { command, workDir, timeout } = req.body;

      if (!command) {
        res.status(400).json({ error: 'Command is required' });
        return;
      }

      const result = await sandboxService.executeCommand(sandboxId, {
        command,
        workDir,
        timeout,
      });

      res.json(result);
    } catch (error) {
      console.error('Command execution error:', error);
      res.status(500).json({
        error: 'Failed to execute command',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Write file to sandbox
   */
  async writeFile(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      const { path, content, encoding } = req.body;

      if (!path || !content) {
        res.status(400).json({ error: 'Path and content are required' });
        return;
      }

      await sandboxService.writeFile(sandboxId, { path, content, encoding });
      res.json({ success: true, message: 'File written successfully' });
    } catch (error) {
      console.error('File write error:', error);
      res.status(500).json({
        error: 'Failed to write file',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Read file from sandbox
   */
  async readFile(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      const { path } = req.query;

      if (!path || typeof path !== 'string') {
        res.status(400).json({ error: 'Path is required' });
        return;
      }

      const content = await sandboxService.readFile(sandboxId, path);
      res.json({ content, path });
    } catch (error) {
      console.error('File read error:', error);
      res.status(500).json({
        error: 'Failed to read file',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * List files in sandbox
   */
  async listFiles(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      const { path = '/' } = req.query;

      const files = await sandboxService.listFiles(sandboxId, path as string);
      res.json({ files, path });
    } catch (error) {
      console.error('File list error:', error);
      res.status(500).json({
        error: 'Failed to list files',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete file from sandbox
   */
  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      const { path } = req.body;

      if (!path) {
        res.status(400).json({ error: 'Path is required' });
        return;
      }

      await sandboxService.deleteFile(sandboxId, path);
      res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
      console.error('File delete error:', error);
      res.status(500).json({
        error: 'Failed to delete file',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Stop sandbox
   */
  async stopSandbox(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      await sandboxService.stopSandbox(sandboxId);
      res.json({ success: true, message: 'Sandbox stopped successfully' });
    } catch (error) {
      console.error('Sandbox stop error:', error);
      res.status(500).json({
        error: 'Failed to stop sandbox',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete sandbox
   */
  async deleteSandbox(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      await sandboxService.deleteSandbox(sandboxId);
      res.json({ success: true, message: 'Sandbox deleted successfully' });
    } catch (error) {
      console.error('Sandbox delete error:', error);
      res.status(500).json({
        error: 'Failed to delete sandbox',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Save sandbox state
   */
  async saveSandboxState(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      const { name } = req.body;

      const snapshotId = await sandboxService.saveSandboxState(sandboxId, name);
      res.json({
        success: true,
        snapshotId,
        message: 'Sandbox state saved successfully'
      });
    } catch (error) {
      console.error('Sandbox save error:', error);
      res.status(500).json({
        error: 'Failed to save sandbox state',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get sandbox statistics
   */
  async getSandboxStats(req: Request, res: Response): Promise<void> {
    try {
      const { sandboxId } = req.params;
      const stats = await sandboxService.getSandboxStats(sandboxId);
      res.json(stats);
    } catch (error) {
      console.error('Error getting sandbox stats:', error);
      res.status(500).json({
        error: 'Failed to get sandbox statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create Playwright session
   */
  async createPlaywrightSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || 'anonymous';
      const { browser = 'chromium', duration = 30 } = req.body;

      const session = await playwrightSandbox.createSession(userId, browser, duration);
      res.status(201).json(session);
    } catch (error) {
      console.error('Playwright session creation error:', error);
      res.status(500).json({
        error: 'Failed to create Playwright session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get Playwright session
   */
  async getPlaywrightSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = playwrightSandbox.getSession(sessionId);

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json(session);
    } catch (error) {
      console.error('Error getting Playwright session:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  }

  /**
   * Execute Playwright action
   */
  async executePlaywrightAction(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const action = req.body;

      if (!action.type) {
        res.status(400).json({ error: 'Action type is required' });
        return;
      }

      const result = await playwrightSandbox.executeAction(sessionId, action);
      res.json(result);
    } catch (error) {
      console.error('Playwright action execution error:', error);
      res.status(500).json({
        error: 'Failed to execute action',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute Playwright script
   */
  async executePlaywrightScript(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { code, language = 'javascript' } = req.body;

      if (!code) {
        res.status(400).json({ error: 'Code is required' });
        return;
      }

      const result = await playwrightSandbox.executeScript(sessionId, code, language);
      res.json(result);
    } catch (error) {
      console.error('Playwright script execution error:', error);
      res.status(500).json({
        error: 'Failed to execute script',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Start recording
   */
  async startRecording(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      await playwrightSandbox.startRecording(sessionId);
      res.json({ success: true, message: 'Recording started' });
    } catch (error) {
      console.error('Start recording error:', error);
      res.status(500).json({
        error: 'Failed to start recording',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { language = 'javascript' } = req.body;

      const recording = await playwrightSandbox.stopRecording(sessionId, language);
      res.json(recording);
    } catch (error) {
      console.error('Stop recording error:', error);
      res.status(500).json({
        error: 'Failed to stop recording',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get element info
   */
  async getElementInfo(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { selector } = req.query;

      if (!selector || typeof selector !== 'string') {
        res.status(400).json({ error: 'Selector is required' });
        return;
      }

      const elementInfo = await playwrightSandbox.getElementInfo(sessionId, selector);

      if (!elementInfo) {
        res.status(404).json({ error: 'Element not found' });
        return;
      }

      res.json(elementInfo);
    } catch (error) {
      console.error('Get element info error:', error);
      res.status(500).json({
        error: 'Failed to get element info',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get page HTML
   */
  async getPageHTML(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const html = await playwrightSandbox.getPageHTML(sessionId);
      res.json({ html });
    } catch (error) {
      console.error('Get page HTML error:', error);
      res.status(500).json({
        error: 'Failed to get page HTML',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get console messages
   */
  async getConsoleMessages(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const messages = playwrightSandbox.getConsoleMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error('Get console messages error:', error);
      res.status(500).json({
        error: 'Failed to get console messages',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get network events
   */
  async getNetworkEvents(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const events = playwrightSandbox.getNetworkEvents(sessionId);
      res.json({ events });
    } catch (error) {
      console.error('Get network events error:', error);
      res.status(500).json({
        error: 'Failed to get network events',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Close Playwright session
   */
  async closePlaywrightSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      await playwrightSandbox.closeSession(sessionId);
      res.json({ success: true, message: 'Session closed successfully' });
    } catch (error) {
      console.error('Close session error:', error);
      res.status(500).json({
        error: 'Failed to close session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new PlaygroundController();
