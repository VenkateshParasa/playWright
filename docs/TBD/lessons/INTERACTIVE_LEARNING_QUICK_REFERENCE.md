# Interactive Learning Platform - Quick Reference

Quick reference guide for developers and users of the Interactive Learning Platform.

## 🚀 Quick Start

### For Users

```bash
# Access the platform
1. Navigate to: http://localhost:5173/playground
2. Choose your learning mode:
   - Code Playground: Free-form coding
   - Virtual Labs: Guided projects
   - Interactive Tutorials: Step-by-step lessons
```

### For Developers

```bash
# Setup
git clone <repo>
cd project

# Install dependencies
cd backend && npm install
cd frontend && npm install

# Build Docker images
cd docker/sandbox && docker-compose build

# Start development
Terminal 1: cd backend && npm run dev
Terminal 2: cd frontend && npm run dev
Terminal 3: cd docker/sandbox && docker-compose up
```

## 📂 File Locations

### Backend Files
```
backend/src/
├── services/playground/
│   ├── codeExecutionService.ts     # Code execution
│   ├── sandboxService.ts           # Sandbox management
│   └── playwrightSandbox.ts        # Browser automation
├── controllers/playground/
│   ├── playgroundController.ts     # Main controller
│   └── labController.ts            # Lab controller
└── routes/playgroundRoutes.ts      # API routes
```

### Frontend Files
```
frontend/src/
├── components/playground/
│   ├── CodeEditor.tsx              # Code editor
│   ├── Terminal.tsx                # Terminal
│   └── BrowserPreview.tsx          # Browser preview
└── pages/playground/
    ├── Playground.tsx              # Main playground
    ├── VirtualLab.tsx              # Lab page
    └── InteractiveTutorial.tsx     # Tutorial page
```

### Docker Files
```
docker/sandbox/
├── Dockerfile.nodejs               # Node.js sandbox
├── Dockerfile.python               # Python sandbox
├── Dockerfile.playwright           # Playwright sandbox
├── Dockerfile.fullstack            # Full-stack sandbox
└── docker-compose.yml              # Orchestration
```

## 🔌 API Endpoints

### Code Execution
```bash
# Execute code
POST /api/playground/execute
{
  "code": "console.log('Hello');",
  "language": "javascript"
}

# Get supported languages
GET /api/playground/languages
```

### Sandbox Management
```bash
# Create sandbox
POST /api/playground/sandbox
{
  "type": "nodejs",
  "duration": 60
}

# Execute command
POST /api/playground/sandbox/:id/command
{
  "command": "npm install express"
}

# Delete sandbox
DELETE /api/playground/sandbox/:id
```

### Playwright Sessions
```bash
# Create session
POST /api/playground/playwright/session
{
  "browser": "chromium",
  "duration": 30
}

# Execute action
POST /api/playground/playwright/:sessionId/action
{
  "type": "navigate",
  "url": "https://example.com"
}
```

### Virtual Labs
```bash
# Get all labs
GET /api/playground/labs

# Start lab
POST /api/playground/labs/:labId/start

# Validate checkpoint
POST /api/playground/labs/:sessionId/checkpoints/:checkpointId/validate
```

## ⌨️ Keyboard Shortcuts

### Code Editor
| Action | Shortcut |
|--------|----------|
| Run code | `Cmd/Ctrl + Enter` |
| Save file | `Cmd/Ctrl + S` |
| Format code | `Shift + Alt + F` |
| Comment line | `Cmd/Ctrl + /` |
| Find | `Cmd/Ctrl + F` |
| Command palette | `F1` |

### Terminal
| Action | Shortcut |
|--------|----------|
| Clear screen | `Ctrl + L` |
| Interrupt | `Ctrl + C` |
| Previous command | `↑` |
| Next command | `↓` |

## 🎨 Component Usage

### CodeEditor Component

```tsx
import CodeEditor from '@/components/playground/CodeEditor';

<CodeEditor
  files={files}
  activeFileId="1"
  language="javascript"
  theme="vs-dark"
  onRun={(code, language) => handleRun(code, language)}
  onSave={(file) => handleSave(file)}
  onFileChange={(id, content) => handleChange(id, content)}
/>
```

### Terminal Component

```tsx
import Terminal from '@/components/playground/Terminal';

<Terminal
  sandboxId={sandboxId}
  onCommand={async (cmd) => {
    const result = await executeCommand(cmd);
    return result;
  }}
/>
```

### BrowserPreview Component

```tsx
import BrowserPreview from '@/components/playground/BrowserPreview';

<BrowserPreview
  url="https://example.com"
  sessionId={playwrightSessionId}
  onNavigate={(url) => handleNavigate(url)}
  onScreenshot={() => handleScreenshot()}
  showDevTools={true}
/>
```

## 🐳 Docker Commands

### Build Images
```bash
# Build all
docker-compose build

# Build specific
docker build -f Dockerfile.nodejs -t playground-nodejs:latest .
```

### Run Containers
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d nodejs-sandbox

# View logs
docker-compose logs -f
```

### Manage Containers
```bash
# List running containers
docker ps

# Execute command in container
docker exec <container-id> node --version

# Stop all
docker-compose down

# Remove all (including volumes)
docker-compose down -v
```

## 🔧 Configuration

### Environment Variables
```env
# .env file
SANDBOX_TIMEOUT=30000
SANDBOX_MEMORY=512m
SANDBOX_CPU=1
MAX_CONCURRENT_EXECUTIONS=10
SESSION_DURATION=7200000
```

### Language Configuration
```typescript
// Add new language
LANGUAGE_CONFIGS['newlang'] = {
  extension: 'ext',
  dockerImage: 'image:tag',
  runCommand: 'runner {file}',
  timeout: 10000,
  memoryLimit: '256m',
};
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Frontend Tests
```bash
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🐛 Troubleshooting

### Common Issues

**Container won't start**
```bash
# Check logs
docker logs <container-id>

# Rebuild image
docker-compose build --no-cache
```

**Code execution fails**
```bash
# Check Docker daemon
docker ps

# Verify sandbox service
curl http://localhost:3000/api/playground/health
```

**Terminal not responding**
```bash
# Restart sandbox
POST /api/playground/sandbox/:id/stop
POST /api/playground/sandbox (create new)
```

## 📊 Monitoring

### Health Checks
```bash
# Playground health
curl http://localhost:3000/api/playground/health

# Docker health
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Resource Usage
```bash
# Container stats
docker stats

# Sandbox stats
GET /api/playground/sandbox/:id/stats
```

## 🔒 Security

### Blocked Code Patterns
```javascript
// These will be rejected
require('child_process')
eval()
exec()
system()
subprocess
os.system
```

### Resource Limits
```yaml
Default Limits:
  CPU: 1 core
  Memory: 512MB
  Storage: 1GB
  Timeout: 30s
  Processes: 100
```

## 📚 Documentation Links

- [Code Playground Guide](./docs/CODE_PLAYGROUND_GUIDE.md)
- [Virtual Labs Guide](./docs/VIRTUAL_LABS_GUIDE.md)
- [Interactive Tutorials](./docs/INTERACTIVE_TUTORIALS.md)
- [Docker Sandbox README](./docker/sandbox/README.md)
- [Implementation Summary](./INTERACTIVE_LEARNING_SUMMARY.md)

## 🎯 Common Tasks

### Add New Language Support

1. Update language config:
```typescript
// backend/src/services/playground/codeExecutionService.ts
LANGUAGE_CONFIGS['mylang'] = {
  extension: 'ml',
  dockerImage: 'mylang:latest',
  runCommand: 'mylang {file}',
  timeout: 15000,
  memoryLimit: '512m',
};
```

2. Add to frontend language options:
```tsx
// frontend/src/components/playground/CodeEditor.tsx
{ value: 'mylang', label: 'My Language' }
```

### Create New Lab

```typescript
// backend/src/controllers/playground/labController.ts
this.labs.set('my-lab', {
  id: 'my-lab',
  title: 'My Custom Lab',
  description: '...',
  difficulty: 'beginner',
  duration: 45,
  type: 'nodejs',
  template: 'express-api',
  instructions: [...],
  checkpoints: [...],
  resources: [...],
  completionCriteria: {...},
});
```

### Add New Sandbox Type

1. Create Dockerfile:
```dockerfile
# docker/sandbox/Dockerfile.mytype
FROM base-image:tag
# ... setup
```

2. Add to docker-compose.yml:
```yaml
mytype-sandbox:
  build:
    dockerfile: Dockerfile.mytype
  image: playground-mytype-sandbox:latest
```

3. Update sandbox service:
```typescript
// backend/src/services/playground/sandboxService.ts
const configs = {
  mytype: {
    image: 'mytype-image',
    internalPort: 8080,
    command: 'tail -f /dev/null',
  },
};
```

## 💡 Tips & Best Practices

### Performance
- Use container pooling for frequently used sandboxes
- Implement caching for Docker images
- Clean up expired sandboxes regularly
- Monitor resource usage

### Security
- Always validate user input
- Keep Docker images updated
- Use minimal base images
- Implement rate limiting
- Audit security logs

### Development
- Use TypeScript for type safety
- Write comprehensive tests
- Document all APIs
- Follow code style guide
- Review security implications

## 📞 Support

- **Documentation**: `/docs`
- **Issues**: GitHub Issues
- **Email**: support@example.com
- **Community**: Discord/Forum

---

**Quick Links**:
- [Main Summary](./INTERACTIVE_LEARNING_SUMMARY.md)
- [API Documentation](./docs/)
- [GitHub Repository](https://github.com/...)
