# Accessibility Integration Example

This file demonstrates how to integrate accessibility features into your existing React application.

## Complete Example Application

```tsx
// App.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SkipLink } from './components/accessibility';
import { useAnnouncer } from './hooks/useAnnouncer';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { KeyboardShortcutsDialog } from './components/accessibility';
import './styles/accessibility.css';

// Define keyboard shortcuts
const keyboardShortcuts = [
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Help' },
  { keys: ['Ctrl', 'K'], description: 'Open search', category: 'Navigation' },
  { keys: ['Ctrl', '/'], description: 'Go to dashboard', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close dialog', category: 'General' }
];

function App() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { announceNavigation } = useAnnouncer();
  const location = useLocation();

  // Announce page changes to screen readers
  useEffect(() => {
    const pageTitle = document.title;
    announceNavigation(pageTitle);
  }, [location, announceNavigation]);

  // Setup keyboard shortcuts
  useKeyboardNavigation([
    {
      key: '?',
      shiftKey: true,
      handler: () => setShowShortcuts(true),
      description: 'Show keyboard shortcuts'
    },
    {
      key: 'k',
      ctrlKey: true,
      handler: () => {
        // Open search
        document.getElementById('search-input')?.focus();
      },
      description: 'Open search'
    },
    {
      key: '/',
      ctrlKey: true,
      handler: () => {
        window.location.href = '/dashboard';
      },
      description: 'Go to dashboard'
    }
  ]);

  return (
    <>
      {/* Skip Navigation Links */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      {/* Header */}
      <header role="banner" className="header">
        <h1>Learning Platform</h1>
      </header>

      {/* Navigation */}
      <nav id="navigation" role="navigation" aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/lessons">Lessons</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1}>
        {/* Your routes/content here */}
      </main>

      {/* Footer */}
      <footer role="contentinfo">
        <p>&copy; 2024 Learning Platform</p>
      </footer>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={keyboardShortcuts}
      />
    </>
  );
}

export default App;
```

## Example: Accessible Form Component

```tsx
// components/LoginForm.tsx
import { useState } from 'react';
import { AccessibleInput, AccessibleButton } from './accessibility';
import { useAnnouncer } from '../hooks/useAnnouncer';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { announceError, announceSuccess } = useAnnouncer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      announceError('Please fix the form errors');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await onLogin(email, password);
      announceSuccess('Login successful');
    } catch (error) {
      announceError('Login failed. Please try again.');
      setErrors({ password: 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      <h2>Log In</h2>

      <AccessibleInput
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        autoComplete="email"
        hint="Enter your registered email address"
      />

      <AccessibleInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="current-password"
        hint="Minimum 8 characters"
      />

      <AccessibleButton
        type="submit"
        variant="primary"
        loading={isLoading}
        loadingText="Logging in..."
        disabled={isLoading}
      >
        Log In
      </AccessibleButton>
    </form>
  );
}
```

## Example: Accessible Modal Component

```tsx
// components/ConfirmDialog.tsx
import { AccessibleModal, AccessibleButton } from './accessibility';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnEscape
      footer={
        <div className="flex gap-2 justify-end">
          <AccessibleButton
            variant="secondary"
            onClick={onClose}
          >
            {cancelText}
          </AccessibleButton>
          <AccessibleButton
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmText}
          </AccessibleButton>
        </div>
      }
    >
      <p>{message}</p>
    </AccessibleModal>
  );
}

// Usage
function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    console.log('Item deleted');
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Delete Item
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
```

## Example: Accessible List with Keyboard Navigation

```tsx
// components/TaskList.tsx
import { useEffect, useRef } from 'react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ScreenReaderOnly } from './accessibility';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

export function TaskList({ tasks, onToggle }: TaskListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const { createRovingTabIndex } = useKeyboardNavigation();

  useEffect(() => {
    if (listRef.current) {
      // Setup roving tabindex for arrow key navigation
      const cleanup = createRovingTabIndex(
        listRef.current,
        '[role="checkbox"]',
        'vertical'
      );
      return cleanup;
    }
  }, [tasks, createRovingTabIndex]);

  return (
    <div role="region" aria-label="Task list">
      <h2>Tasks</h2>
      <p id="task-instructions" className="sr-only">
        Use arrow keys to navigate tasks, space to toggle completion.
      </p>

      <ul ref={listRef} aria-describedby="task-instructions">
        {tasks.map((task, index) => (
          <li key={task.id}>
            <div
              role="checkbox"
              aria-checked={task.completed}
              tabIndex={index === 0 ? 0 : -1}
              onClick={() => onToggle(task.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onToggle(task.id);
                }
              }}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <ScreenReaderOnly>
                {task.completed ? 'Completed' : 'Not completed'}
              </ScreenReaderOnly>
              {task.title}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Example: Accessible Search Component

```tsx
// components/SearchBar.tsx
import { useState, useId } from 'react';
import { AccessibleInput } from './accessibility';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { LiveRegion } from './accessibility';

interface SearchBarProps {
  onSearch: (query: string) => Promise<any[]>;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const searchId = useId();
  const resultsId = useId();

  const handleSearch = async (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setAnnouncement('');
      return;
    }

    setIsSearching(true);
    setAnnouncement('Searching...');

    try {
      const data = await onSearch(value);
      setResults(data);
      setAnnouncement(`${data.length} results found`);
    } catch (error) {
      setAnnouncement('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div role="search">
      <AccessibleInput
        id={searchId}
        label="Search"
        type="search"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Type to search..."
        aria-controls={resultsId}
        aria-expanded={results.length > 0}
        autoComplete="off"
      />

      {/* Screen reader announcement */}
      <LiveRegion message={announcement} politeness="polite" />

      {/* Results */}
      {results.length > 0 && (
        <ul
          id={resultsId}
          role="listbox"
          aria-label="Search results"
          className="search-results"
        >
          {results.map((result, index) => (
            <li
              key={result.id}
              role="option"
              aria-selected={false}
              tabIndex={0}
            >
              {result.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Example: Accessible Tabs Component

```tsx
// components/TabPanel.tsx
import { useState } from 'react';
import { ScreenReaderOnly } from './accessibility';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabPanelProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabPanel({ tabs, defaultTab }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    setActiveTab(tabs[newIndex].id);
    document.getElementById(`tab-${tabs[newIndex].id}`)?.focus();
  };

  return (
    <div className="tab-panel">
      <ScreenReaderOnly as="h2">
        Tabbed content. Use arrow keys to navigate tabs.
      </ScreenReaderOnly>

      <div role="tablist" aria-label="Content sections">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={activeTab === tab.id ? 'active' : ''}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

// Usage
function MyPage() {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <div>Overview content</div>
    },
    {
      id: 'details',
      label: 'Details',
      content: <div>Details content</div>
    },
    {
      id: 'settings',
      label: 'Settings',
      content: <div>Settings content</div>
    }
  ];

  return <TabPanel tabs={tabs} />;
}
```

## Example: Accessible Toast Notifications

```tsx
// components/Toast.tsx
import { useEffect } from 'react';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const { announce } = useAnnouncer();

  useEffect(() => {
    // Announce to screen readers
    const politeness = type === 'error' ? 'assertive' : 'polite';
    announce(message, { politeness });

    // Auto-dismiss
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [message, type, duration, announce, onClose]);

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`toast toast-${type}`}
    >
      <p>{message}</p>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="toast-close"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast Manager Hook
import { useState } from 'react';

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type: ToastData['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
    warning: (message: string) => addToast(message, 'warning')
  };
}

// Usage
function MyComponent() {
  const { toasts, removeToast, success, error } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      success('Data saved successfully');
    } catch (err) {
      error('Failed to save data');
    }
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>

      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}
```

## Full Integration Steps

1. **Import accessibility styles in main.tsx:**
```tsx
import './styles/accessibility.css';
```

2. **Wrap app with keyboard shortcuts:**
```tsx
// In App.tsx
useKeyboardNavigation(shortcuts);
```

3. **Add skip links:**
```tsx
<SkipLink href="#main-content">Skip to main content</SkipLink>
```

4. **Use accessible components:**
```tsx
import { AccessibleButton, AccessibleInput, AccessibleModal } from './components/accessibility';
```

5. **Add screen reader announcements:**
```tsx
const { announce } = useAnnouncer();
announce('Action completed');
```

6. **Test regularly:**
```bash
npm run test:a11y
```

---

**Remember:** These examples follow WCAG 2.1 Level AA guidelines. Test with keyboard and screen reader!
