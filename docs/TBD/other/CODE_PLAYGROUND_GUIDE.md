# Code Playground Guide

Complete guide to using the interactive code playground for learning Playwright and Selenium.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [Code Editor](#code-editor)
5. [Terminal](#terminal)
6. [Browser Preview](#browser-preview)
7. [Supported Languages](#supported-languages)
8. [Code Execution](#code-execution)
9. [File Management](#file-management)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## Introduction

The Code Playground is an interactive, in-browser development environment that allows you to write, run, and test code without any local setup. It's perfect for learning browser automation with Playwright and Selenium.

### Key Benefits

- **No Installation Required**: Everything runs in your browser
- **Multiple Languages**: JavaScript, TypeScript, Python, Java, and more
- **Isolated Environments**: Safe sandboxes with resource limits
- **Real-time Feedback**: Instant code execution and output
- **Collaborative**: Share code snippets with others

## Getting Started

### Accessing the Playground

1. Navigate to `/playground` in the application
2. The playground loads with a default JavaScript template
3. Start coding immediately!

### Quick Start Example

```javascript
// Write a simple Playwright script
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  console.log(await page.title());
  await browser.close();
})();
```

Click **Run** (or press `Cmd/Ctrl + Enter`) to execute.

## Features

### Monaco Editor

The playground uses Monaco Editor (the same engine as VS Code) with:

- **Syntax Highlighting**: 20+ languages supported
- **IntelliSense**: Smart code completion
- **Error Detection**: Real-time syntax and semantic errors
- **Code Formatting**: Built-in Prettier integration
- **Multiple Files**: Work with multiple files simultaneously
- **Themes**: Dark and light themes

### Sandboxed Execution

Code runs in isolated Docker containers with:

- **Resource Limits**: CPU, memory, and storage constraints
- **Timeout Protection**: Automatic termination of long-running code
- **Security**: No access to host system
- **Clean Environment**: Fresh container for each session

### Persistent Workspaces

- **Auto-save**: Changes saved automatically
- **Session Persistence**: Resume where you left off
- **File Storage**: Save and retrieve files from sandboxes

## Code Editor

### Interface Overview

```
┌─────────────────────────────────────────────┐
│  [Run] [Save] │ Format Copy Download Settings│
├─────────────┬───────────────────────────────┤
│  Files      │   Code Editor Area            │
│  ├─ file1   │   Your code goes here...      │
│  ├─ file2   │                               │
│  └─ file3   │                               │
└─────────────┴───────────────────────────────┘
```

### Toolbar Actions

| Button | Action | Shortcut |
|--------|--------|----------|
| Run | Execute code | `Cmd/Ctrl + Enter` |
| Save | Save file to sandbox | `Cmd/Ctrl + S` |
| Format | Format code | `Shift + Alt + F` |
| Copy | Copy to clipboard | - |
| Download | Download file | - |
| Settings | Editor preferences | - |

### Multi-File Support

Create and manage multiple files:

1. Click the **+** icon in the file explorer
2. Enter filename and select language
3. Switch between files by clicking in the explorer
4. Delete files with the **×** icon

### IntelliSense

Get smart suggestions as you type:

```javascript
page.// IntelliSense shows available methods
// - goto()
// - click()
// - fill()
// - ...
```

### Code Formatting

Format your code automatically:

```javascript
// Before formatting
const x={a:1,b:2};function test(){return x;}

// After formatting (Shift + Alt + F)
const x = { a: 1, b: 2 };

function test() {
  return x;
}
```

## Terminal

### Opening the Terminal

The terminal is available in the following layouts:
- **Editor + Terminal**: Code editor with terminal below
- **Full Layout**: Editor, preview, and terminal

### Using the Terminal

Execute commands in your sandbox:

```bash
$ node --version
v18.0.0

$ npm install axios
+ axios@1.4.0

$ ls -la
total 12
drwxr-xr-x 2 sandbox sandbox 4096 Jan 1 12:00 .
drwxr-xr-x 3 sandbox sandbox 4096 Jan 1 12:00 ..
-rw-r--r-- 1 sandbox sandbox  234 Jan 1 12:00 index.js
```

### Terminal Features

- **Command History**: Arrow up/down to navigate history
- **Copy/Paste**: Standard clipboard operations
- **Clear Screen**: `Ctrl + L` or `clear` command
- **Interrupt**: `Ctrl + C` to stop running commands
- **Fullscreen**: Expand terminal to full screen

### Built-in Commands

If not connected to a sandbox:

```bash
help      - Show available commands
clear     - Clear terminal screen
echo      - Print text
history   - Show command history
```

## Browser Preview

### Preview Modes

The playground supports three preview modes:

1. **HTML Preview**: View rendered HTML
2. **Browser Automation**: See Playwright/Selenium actions
3. **Live Server**: Run and preview web applications

### DevTools

The browser preview includes built-in DevTools:

#### Console Tab
View console output from your web pages:

```
[log] Page loaded successfully
[info] User clicked button
[error] Failed to fetch data
```

#### Network Tab
Monitor network requests:

```
GET /api/users          200  245ms  2.3KB
POST /api/login         401  102ms  156B
GET /assets/style.css   200  89ms   12KB
```

#### Elements Tab
Inspect page HTML structure:

```html
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <div id="app">...</div>
  </body>
</html>
```

### Viewport Sizes

Toggle between different viewport sizes:

- **Desktop**: 1280 x 720
- **Tablet**: 768 x 1024
- **Mobile**: 375 x 667

## Supported Languages

### JavaScript / Node.js

```javascript
const { chromium } = require('playwright');

console.log('Running Playwright script...');
```

**Available packages**:
- playwright
- playwright-test
- axios
- lodash

### TypeScript

```typescript
import { chromium, Browser, Page } from 'playwright';

const run = async (): Promise<void> => {
  const browser: Browser = await chromium.launch();
  // ...
};
```

### Python

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('https://example.com')
    browser.close()
```

### Java

```java
import com.microsoft.playwright.*;

public class Example {
  public static void main(String[] args) {
    try (Playwright playwright = Playwright.create()) {
      Browser browser = playwright.chromium().launch();
      Page page = browser.newPage();
      page.navigate("https://example.com");
      browser.close();
    }
  }
}
```

### Other Languages

- C/C++
- Go
- Rust
- Ruby
- PHP

## Code Execution

### Execution Flow

```
Write Code → Validate → Execute in Sandbox → Return Results
```

### Security Validation

Code is validated before execution:

- ❌ Blocked: `eval()`, `exec()`, `system()`
- ❌ Blocked: Direct file system access outside workspace
- ❌ Blocked: Network access to internal resources
- ✅ Allowed: Standard library functions
- ✅ Allowed: Approved packages

### Resource Limits

Each execution has limits:

- **Timeout**: 30 seconds (default)
- **Memory**: 512MB
- **CPU**: 1 core
- **Storage**: 1GB
- **Processes**: 100 max

### Output Formats

#### Success Output

```
✓ Execution completed in 1.234s

Output:
Hello, World!
Page title: Example Domain
```

#### Error Output

```
✗ Execution failed

Error: ReferenceError: chromium is not defined
  at line 1:7

Hint: Did you forget to import playwright?
```

## File Management

### Creating Files

1. Click **+ New File** in the file explorer
2. Enter filename (e.g., `test.js`, `helpers.py`)
3. Select language
4. Start coding

### Saving Files

Files are saved:
- **Automatically**: Every few seconds
- **Manually**: Click Save or press `Cmd/Ctrl + S`
- **To Sandbox**: Persisted in the sandbox filesystem

### Uploading Files

Upload local files to sandbox:

```bash
# In terminal
$ cat > config.json << EOF
{
  "baseUrl": "https://example.com",
  "timeout": 30000
}
EOF
```

### Downloading Files

Download sandbox files:

1. Select file in explorer
2. Click **Download** button
3. File downloads to your computer

## Keyboard Shortcuts

### Editor Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Run code | `Ctrl + Enter` | `Cmd + Enter` |
| Save file | `Ctrl + S` | `Cmd + S` |
| Format code | `Shift + Alt + F` | `Shift + Option + F` |
| Comment line | `Ctrl + /` | `Cmd + /` |
| Find | `Ctrl + F` | `Cmd + F` |
| Replace | `Ctrl + H` | `Cmd + Option + F` |
| Go to line | `Ctrl + G` | `Cmd + G` |
| Command palette | `F1` | `F1` |
| Multi-cursor | `Ctrl + Alt + ↑/↓` | `Cmd + Option + ↑/↓` |

### Terminal Shortcuts

| Action | Shortcut |
|--------|----------|
| Clear screen | `Ctrl + L` |
| Interrupt | `Ctrl + C` |
| Previous command | `↑` |
| Next command | `↓` |

## Best Practices

### 1. Start Simple

Begin with basic examples:

```javascript
// Good: Simple, focused example
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  console.log('Title:', await page.title());
  await browser.close();
})();
```

### 2. Use Error Handling

Always handle errors:

```javascript
try {
  const browser = await chromium.launch();
  // ... your code
  await browser.close();
} catch (error) {
  console.error('Error:', error.message);
}
```

### 3. Clean Up Resources

Always close browsers and connections:

```javascript
const browser = await chromium.launch();
try {
  // ... your code
} finally {
  await browser.close(); // Always close
}
```

### 4. Organize Code

Use multiple files for better organization:

```
project/
├── main.js          # Entry point
├── helpers.js       # Utility functions
├── config.js        # Configuration
└── tests/
    ├── test1.js
    └── test2.js
```

### 5. Comment Your Code

```javascript
// Configure browser options
const browser = await chromium.launch({
  headless: true,  // Run without UI
  slowMo: 50,      // Slow down for debugging
});
```

## Troubleshooting

### Issue: Code Doesn't Run

**Solutions**:
- Check for syntax errors (highlighted in red)
- Ensure all required imports are present
- Verify the language is set correctly
- Check browser console for errors

### Issue: Timeout Errors

```
Error: Execution timeout (30000ms)
```

**Solutions**:
- Optimize slow operations
- Remove infinite loops
- Use pagination for large datasets
- Request longer timeout if needed

### Issue: Memory Errors

```
Error: Container memory limit exceeded
```

**Solutions**:
- Reduce data size
- Process data in chunks
- Close unused resources
- Optimize algorithms

### Issue: Import Errors

```
Error: Cannot find module 'playwright'
```

**Solutions**:
- Verify package is supported
- Check spelling of import
- Use require() in JavaScript (not ES6 import)
- Contact support for package requests

### Issue: Network Errors

```
Error: net::ERR_CONNECTION_REFUSED
```

**Solutions**:
- Check URL is accessible
- Verify no firewall blocks
- Use public URLs (not localhost)
- Check if site requires authentication

## Advanced Features

### Sharing Code

Share your code with others:

1. Click **Share** button
2. Copy generated link
3. Send to others
4. Recipients can view and fork your code

### Code Templates

Start with pre-built templates:

- Playwright basic navigation
- Selenium form automation
- API testing examples
- Web scraping patterns

### Custom Packages

Request additional packages:

1. Go to Settings
2. Request Package
3. Specify package name and version
4. Wait for approval (usually 24-48 hours)

## API Reference

### Execute Code

```javascript
POST /api/playground/execute

{
  "code": "console.log('Hello');",
  "language": "javascript",
  "timeout": 30000,
  "memoryLimit": "512m"
}

Response:
{
  "success": true,
  "output": "Hello\n",
  "executionTime": 123,
  "exitCode": 0
}
```

### Create Sandbox

```javascript
POST /api/playground/sandbox

{
  "type": "nodejs",
  "duration": 60,
  "resources": {
    "memory": "512m",
    "cpu": "1"
  }
}

Response:
{
  "id": "sandbox-abc123",
  "status": "running",
  "port": 8080
}
```

## Support

Need help?

- **Documentation**: /docs
- **Community**: /community
- **Email**: support@example.com
- **GitHub**: github.com/yourrepo/issues

## What's Next?

- Try [Virtual Labs](./VIRTUAL_LABS_GUIDE.md) for guided exercises
- Explore [Interactive Tutorials](./INTERACTIVE_TUTORIALS.md) for step-by-step learning
- Join our community for tips and tricks
