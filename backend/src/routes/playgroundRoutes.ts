import { Router } from 'express';
import playgroundController from '../controllers/playground/playgroundController.js';
import labController from '../controllers/playground/labController.js';

const router = Router();

// Code Execution Routes
router.post('/execute', playgroundController.executeCode);
router.get('/languages', playgroundController.getSupportedLanguages);
router.get('/health', playgroundController.healthCheck);

// Sandbox Management Routes
router.post('/sandbox', playgroundController.createSandbox);
router.get('/sandbox/:sandboxId', playgroundController.getSandbox);
router.get('/sandboxes', playgroundController.getUserSandboxes);
router.post('/sandbox/:sandboxId/command', playgroundController.executeCommand);
router.post('/sandbox/:sandboxId/file', playgroundController.writeFile);
router.get('/sandbox/:sandboxId/file', playgroundController.readFile);
router.get('/sandbox/:sandboxId/files', playgroundController.listFiles);
router.delete('/sandbox/:sandboxId/file', playgroundController.deleteFile);
router.post('/sandbox/:sandboxId/stop', playgroundController.stopSandbox);
router.delete('/sandbox/:sandboxId', playgroundController.deleteSandbox);
router.post('/sandbox/:sandboxId/save', playgroundController.saveSandboxState);
router.get('/sandbox/:sandboxId/stats', playgroundController.getSandboxStats);

// Playwright Session Routes
router.post('/playwright/session', playgroundController.createPlaywrightSession);
router.get('/playwright/:sessionId', playgroundController.getPlaywrightSession);
router.post('/playwright/:sessionId/action', playgroundController.executePlaywrightAction);
router.post('/playwright/:sessionId/script', playgroundController.executePlaywrightScript);
router.post('/playwright/:sessionId/recording/start', playgroundController.startRecording);
router.post('/playwright/:sessionId/recording/stop', playgroundController.stopRecording);
router.get('/playwright/:sessionId/element', playgroundController.getElementInfo);
router.get('/playwright/:sessionId/html', playgroundController.getPageHTML);
router.get('/playwright/:sessionId/console', playgroundController.getConsoleMessages);
router.get('/playwright/:sessionId/network', playgroundController.getNetworkEvents);
router.delete('/playwright/:sessionId', playgroundController.closePlaywrightSession);

// Virtual Lab Routes
router.get('/labs', labController.getAllLabs);
router.get('/labs/:labId', labController.getLabById);
router.post('/labs/:labId/start', labController.startLabSession);
router.get('/labs/session/:sessionId', labController.getLabSession);
router.patch('/labs/:sessionId/progress', labController.updateLabProgress);
router.post('/labs/:sessionId/checkpoints/:checkpointId/validate', labController.validateCheckpoint);
router.post('/labs/:sessionId/complete', labController.completeLabSession);
router.delete('/labs/:sessionId', labController.abandonLabSession);
router.get('/labs/user/sessions', labController.getUserLabSessions);

export default router;
