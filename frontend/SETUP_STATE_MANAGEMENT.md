# State Management System - Setup Guide

## Installation

The state management system is already implemented. To complete the setup, add the React Query Devtools dependency:

```bash
npm install @tanstack/react-query-devtools --save-dev
```

All other required dependencies are already in package.json:
- ✅ `zustand` (^4.4.0)
- ✅ `@tanstack/react-query` (^5.0.0)
- ✅ `idb` (^8.0.0)

## Quick Start

### 1. Update your main.tsx or App.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './lib/providers';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
```

### 2. Use stores in components

```typescript
import { useAuthStore, showSuccessToast } from '@/stores';

function MyComponent() {
  const { user, login, isLoading } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      showSuccessToast('Welcome back!');
    } catch (error) {
      // Error is already handled in store
    }
  };

  return <div>...</div>;
}
```

### 3. Use React Query for server data

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/stores';

function LessonList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.lessons.lists(),
    queryFn: async () => {
      const res = await fetch('/api/lessons');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render lessons */}</div>;
}
```

## File Structure

```
frontend/src/
├── stores/
│   ├── authStore.ts          # Authentication state
│   ├── progressStore.ts      # Learning progress
│   ├── srsStore.ts          # Spaced repetition
│   ├── settingsStore.ts     # User preferences
│   ├── uiStore.ts           # UI state (toasts, modals, etc)
│   └── index.ts             # Central exports
│
├── lib/
│   ├── query/
│   │   └── client.ts        # React Query setup
│   ├── store/
│   │   ├── persistence.ts   # localStorage/IndexedDB
│   │   └── devtools.ts      # Redux DevTools integration
│   └── providers.tsx        # App providers wrapper
│
└── types/
    └── store.ts             # TypeScript type definitions
```

## Features Implemented

### ✅ Zustand Stores
- **authStore**: User authentication and session management
- **progressStore**: Learning progress, streaks, study time
- **srsStore**: Flashcard reviews with SM-2 algorithm
- **settingsStore**: Theme, language, notifications, privacy
- **uiStore**: Sidebar, toasts, modals, sync status

### ✅ React Query
- Query client with smart defaults
- Query key factory for consistency
- Cache invalidation strategies
- Optimistic updates support
- Automatic background refetching
- DevTools integration (development)

### ✅ Persistence
- localStorage for small data
- IndexedDB for large datasets
- Automatic state hydration
- Version migration support
- Partial state persistence
- Import/export functionality

### ✅ DevTools
- Redux DevTools integration
- Named actions for debugging
- Time-travel debugging
- State inspection
- Performance monitoring
- Browser console access (dev mode)

### ✅ Type Safety
- Comprehensive TypeScript types
- Strict mode enabled
- Type-safe selectors
- Utility function types
- Store action types

## Development Tools

### Redux DevTools
Install the browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/redux-devtools)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

All stores will automatically connect in development mode.

### Console Access (Development)
```javascript
// Access stores from browser console
__ZUSTAND_STORES__.auth.getState()
__ZUSTAND_STORES__.progress.getState()
__ZUSTAND_STORES__.srs.getState()

// Manually trigger actions
__ZUSTAND_STORES__.ui.showToast({ type: 'success', message: 'Test!' })
```

### Query Stats
```typescript
import { logQueryStats } from '@/stores';

// Log React Query cache statistics
logQueryStats();
```

## Testing

### Store Testing
```typescript
import { useAuthStore } from '@/stores';

describe('authStore', () => {
  it('should handle login', async () => {
    const { login, user, isAuthenticated } = useAuthStore.getState();

    await login('test@example.com', 'password');

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toBeDefined();
  });
});
```

### Query Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('fetches data', async () => {
  const { result } = renderHook(() => useQuery(...), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
});
```

## Migration from Existing Code

If you have existing state management, migrate gradually:

1. **Keep existing code working**
2. **Add new features using new stores**
3. **Migrate one component at a time**
4. **Remove old state management last**

### Example Migration

Before:
```typescript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);

const login = async (email, password) => {
  setLoading(true);
  try {
    const res = await fetch('/api/login', { ... });
    const data = await res.json();
    setUser(data.user);
  } catch (error) {
    // handle error
  } finally {
    setLoading(false);
  }
};
```

After:
```typescript
const { user, login, isLoading } = useAuthStore();
// login function is already implemented!
```

## Performance Tips

1. **Use selective subscriptions**
   ```typescript
   // ❌ Bad - subscribes to entire store
   const store = useAuthStore();

   // ✅ Good - subscribes to specific fields
   const user = useAuthStore(state => state.user);
   const login = useAuthStore(state => state.login);
   ```

2. **Memoize selectors**
   ```typescript
   const selector = useCallback(
     (state) => state.lessons[lessonId],
     [lessonId]
   );
   const lesson = useProgressStore(selector);
   ```

3. **Use React Query for server data**
   - Don't duplicate server data in Zustand
   - Let React Query handle caching
   - Use Zustand only for client state

4. **Debounce frequent updates**
   ```typescript
   import { createDebouncedPersist } from '@/stores';

   const debouncedPersist = createDebouncedPersist(1000);
   // Use in store configuration
   ```

## Troubleshooting

### "Cannot read property of undefined"
- Store not initialized. Wrap app with `<AppProviders>`
- State not rehydrated yet. Check loading states

### State not persisting
- Check browser storage permissions
- Verify `partialize` configuration
- Clear old data with `clearAllStores()`

### DevTools not showing stores
- Install Redux DevTools extension
- Verify `NODE_ENV === 'development'`
- Check browser console for errors

### Type errors
- Run `npm run type-check`
- Update `@types/*` packages
- Check import paths are correct

## Next Steps

1. **Read the documentation**: `STATE_MANAGEMENT.md`
2. **Explore example hooks**: `lib/providers.tsx`
3. **Set up your components**: Use stores and React Query
4. **Test your implementation**: Write tests for critical paths
5. **Monitor performance**: Use DevTools and profiling

## Support

For questions or issues:
1. Check `STATE_MANAGEMENT.md` for detailed documentation
2. Review example implementations in `lib/providers.tsx`
3. Inspect store implementations in `stores/` directory
4. Check type definitions in `types/store.ts`

Happy coding! 🚀
