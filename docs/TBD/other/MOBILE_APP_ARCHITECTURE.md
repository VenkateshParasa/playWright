# Mobile App Architecture

## Architecture Overview

The mobile application follows a clean architecture pattern with clear separation of concerns, making it maintainable, testable, and scalable.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Screens   │  │ Components │  │ Navigation │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Hooks    │  │   State    │  │  Services  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Entities  │  │   Types    │  │  Business  │            │
│  │            │  │            │  │   Logic    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │    API     │  │   Storage  │  │   Cache    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Presentation Layer

**Purpose**: User interface and user interaction

**Components**:
- **Screens**: Full-page views
- **Components**: Reusable UI elements
- **Navigation**: Screen routing and navigation

**Principles**:
- No business logic
- Minimal state management
- Delegates to Application Layer
- Focuses on UI/UX

**Example**:
```typescript
// LoginScreen.tsx
const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Delegate to Application Layer
    await dispatch(login({ email, password }));
  };

  return (
    <View>
      <Input value={email} onChangeText={setEmail} />
      <Input value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};
```

### 2. Application Layer

**Purpose**: Application-specific business rules

**Components**:
- **Hooks**: Custom React hooks for shared logic
- **State Management**: Redux, React Query
- **Services**: API integration, notifications

**Principles**:
- Orchestrates use cases
- Manages application state
- Handles side effects
- No UI code

**Example**:
```typescript
// useAuth.ts
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  const login = useCallback(async (credentials) => {
    try {
      await dispatch(loginAction(credentials)).unwrap();
      await analytics.logEvent('login_success');
    } catch (error) {
      await crashlytics.recordError(error);
      throw error;
    }
  }, [dispatch]);

  return { user, isAuthenticated, login };
};
```

### 3. Domain Layer

**Purpose**: Core business entities and logic

**Components**:
- **Entities**: Core business objects
- **Types**: TypeScript interfaces and types
- **Business Logic**: Pure business rules

**Principles**:
- Framework independent
- No external dependencies
- Pure functions
- Domain-driven design

**Example**:
```typescript
// types/Lesson.ts
export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

// Business logic
export const calculateProgress = (lesson: Lesson): number => {
  return lesson.isCompleted ? 100 : 0;
};

export const canStartLesson = (lesson: Lesson, userLevel: string): boolean => {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const lessonLevel = levels.indexOf(lesson.difficulty);
  const currentLevel = levels.indexOf(userLevel);
  return currentLevel >= lessonLevel;
};
```

### 4. Data Layer

**Purpose**: Data persistence and retrieval

**Components**:
- **API Client**: HTTP requests
- **Storage**: AsyncStorage, SecureStore
- **Cache**: Query cache, image cache

**Principles**:
- Single source of truth
- Data transformation
- Error handling
- Retry logic

**Example**:
```typescript
// services/api.ts
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// services/lesson.service.ts
export const lessonService = {
  getLessons: async (): Promise<Lesson[]> => {
    const response = await api.get('/lessons');
    return response.data.map(transformLessonDTO);
  },

  completeLesson: async (id: string): Promise<void> => {
    await api.post(`/lessons/${id}/complete`);
    await storage.set(`lesson_${id}_completed`, true);
  },
};
```

## State Management Architecture

### Global State (Redux)

**Purpose**: Application-wide state

**Use Cases**:
- User authentication
- App settings
- Theme preferences
- Offline data

**Structure**:
```
store/
├── index.ts              # Store configuration
├── slices/
│   ├── authSlice.ts      # Authentication state
│   ├── settingsSlice.ts  # App settings
│   └── offlineSlice.ts   # Offline queue
└── middleware/
    └── offline.ts         # Offline sync middleware
```

**Example**:
```typescript
// authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    tokens: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    },
  },
});
```

### Server State (React Query)

**Purpose**: API data caching and synchronization

**Use Cases**:
- Fetching lessons
- Loading user progress
- Quiz data
- Real-time updates

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      cacheTime: 10 * 60 * 1000,   // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

**Example**:
```typescript
// Query
const { data: lessons, isLoading } = useQuery({
  queryKey: ['lessons', category],
  queryFn: () => lessonService.getLessons({ category }),
  staleTime: 5 * 60 * 1000,
});

// Mutation
const mutation = useMutation({
  mutationFn: lessonService.completeLesson,
  onSuccess: () => {
    queryClient.invalidateQueries(['lessons']);
    queryClient.invalidateQueries(['progress']);
  },
});
```

### Local State

**Purpose**: Component-specific state

**Use Cases**:
- Form inputs
- UI state (modals, drawers)
- Temporary data

**Example**:
```typescript
const [isModalVisible, setIsModalVisible] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

## Navigation Architecture

### Navigation Structure

```
RootNavigator
│
├─ OnboardingScreen (Modal)
│
├─ AuthNavigator (Stack)
│  ├─ LoginScreen
│  ├─ RegisterScreen
│  └─ ForgotPasswordScreen
│
└─ MainNavigator (BottomTabs)
   ├─ HomeNavigator (Stack)
   │  ├─ DashboardScreen
   │  └─ LessonDetailScreen
   │
   ├─ LessonNavigator (Stack)
   │  ├─ LessonListScreen
   │  ├─ LessonDetailScreen
   │  └─ LessonPlayerScreen
   │
   ├─ FlashcardNavigator (Stack)
   │  ├─ FlashcardListScreen
   │  ├─ FlashcardReviewScreen
   │  └─ FlashcardStatsScreen
   │
   ├─ QuizNavigator (Stack)
   │  ├─ QuizListScreen
   │  ├─ QuizDetailScreen
   │  ├─ QuizTakingScreen
   │  └─ QuizResultScreen
   │
   └─ ProfileNavigator (Stack)
      ├─ ProfileScreen
      ├─ SettingsScreen
      └─ ProgressScreen
```

### Deep Linking

**Configuration**:
```typescript
export const linkingConfiguration = {
  prefixes: ['pwlearning://', 'https://app.pwlearning.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Lessons: {
            screens: {
              LessonDetail: 'lessons/:lessonId',
            },
          },
          Quiz: {
            screens: {
              QuizTaking: 'quizzes/:quizId/take',
            },
          },
        },
      },
    },
  },
};
```

**Usage**:
```typescript
// Open from notification
Linking.openURL('pwlearning://lessons/123');

// Handle incoming links
useEffect(() => {
  const handleDeepLink = (event: { url: string }) => {
    // Parse URL and navigate
    const route = Linking.parse(event.url);
    navigation.navigate(route.path, route.queryParams);
  };

  Linking.addEventListener('url', handleDeepLink);

  return () => {
    Linking.removeEventListener('url', handleDeepLink);
  };
}, []);
```

## Offline-First Architecture

### Offline Strategy

**1. Data Synchronization**
```typescript
// Sync queue
interface SyncAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
}

const syncQueue: SyncAction[] = [];

// Add to queue when offline
const queueAction = async (action: SyncAction) => {
  syncQueue.push(action);
  await storage.set('syncQueue', syncQueue);
};

// Process queue when online
const processSyncQueue = async () => {
  for (const action of syncQueue) {
    try {
      await executeAction(action);
      removeFromQueue(action.id);
    } catch (error) {
      handleSyncError(error);
    }
  }
};
```

**2. Offline Detection**
```typescript
const useOfflineSync = () => {
  const { isConnected } = useNetworkStatus();

  useEffect(() => {
    if (isConnected) {
      processSyncQueue();
    }
  }, [isConnected]);
};
```

**3. Cached Responses**
```typescript
const useCachedQuery = (key, fetcher) => {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    networkMode: 'offlineFirst',
    cacheTime: Infinity,
  });
};
```

## Security Architecture

### Authentication Flow

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│  Login  │─────▶│ Auth API │─────▶│  Token  │
│ Screen  │      │          │      │ Storage │
└─────────┘      └──────────┘      └─────────┘
     │                                    │
     │                                    ▼
     │                            ┌──────────────┐
     │                            │ API Requests │
     │                            │  (with token)│
     │                            └──────────────┘
     │                                    │
     ▼                                    │
┌─────────┐                              │
│Biometric│◀─────────────────────────────┘
│  Auth   │
└─────────┘
```

### Security Measures

**1. Secure Storage**
```typescript
import * as SecureStore from 'expo-secure-store';

// Store sensitive data
await SecureStore.setItemAsync('auth_token', token);

// Retrieve sensitive data
const token = await SecureStore.getItemAsync('auth_token');
```

**2. Certificate Pinning**
```typescript
import { certificatePinning } from 'react-native-ssl-pinning';

await certificatePinning.fetch(API_URL, {
  method: 'GET',
  sslPinning: {
    certs: ['certificate'],
  },
});
```

**3. Biometric Authentication**
```typescript
import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
    });

    return result.success;
  }

  return false;
};
```

## Performance Architecture

### Optimization Strategies

**1. List Virtualization**
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <ListItem item={item} />}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

**2. Image Optimization**
```typescript
<FastImage
  source={{ uri: imageUrl, priority: FastImage.priority.normal }}
  resizeMode={FastImage.resizeMode.cover}
  style={styles.image}
/>
```

**3. Memoization**
```typescript
const MemoizedComponent = memo(({ data }) => {
  return <View>{/* Render data */}</View>;
});

const processedData = useMemo(() => {
  return expensiveCalculation(rawData);
}, [rawData]);

const handlePress = useCallback(() => {
  // Handle press
}, [dependencies]);
```

## Testing Architecture

### Testing Pyramid

```
       ┌─────────────┐
       │   E2E Tests │ (Few)
       └─────────────┘
      ┌───────────────┐
      │Integration Tests│ (Some)
      └───────────────┘
     ┌─────────────────┐
     │   Unit Tests    │ (Many)
     └─────────────────┘
```

### Test Structure

**Unit Tests**: Test individual functions/components
```typescript
describe('calculateProgress', () => {
  it('returns 100 for completed lesson', () => {
    const lesson = { isCompleted: true };
    expect(calculateProgress(lesson)).toBe(100);
  });
});
```

**Integration Tests**: Test component interactions
```typescript
describe('LoginScreen', () => {
  it('logs in user successfully', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
    });
  });
});
```

**E2E Tests**: Test complete user flows
```typescript
describe('Login Flow', () => {
  it('should login and navigate to dashboard', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard'))).toBeVisible();
  });
});
```

## Monitoring Architecture

### Crash Reporting
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  beforeSend(event, hint) {
    // Scrub sensitive data
    return event;
  },
});
```

### Analytics
```typescript
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('lesson_completed', {
  lesson_id: '123',
  duration: 300,
  score: 95,
});
```

### Performance Monitoring
```typescript
import perf from '@react-native-firebase/perf';

const trace = await perf().startTrace('lesson_load');
await fetchLesson();
await trace.stop();
```

## Scalability Considerations

1. **Modular Architecture**: Easy to add new features
2. **Code Splitting**: Lazy load heavy components
3. **Caching Strategy**: Reduce network requests
4. **Pagination**: Handle large data sets
5. **Background Processing**: Offload heavy tasks
6. **Resource Optimization**: Minimize bundle size

## Best Practices

1. **Separation of Concerns**: Each layer has single responsibility
2. **Dependency Injection**: Easy to test and mock
3. **Error Boundaries**: Graceful error handling
4. **Type Safety**: TypeScript for compile-time checks
5. **Documentation**: Clear code comments
6. **Code Review**: Peer review before merge
7. **Performance Monitoring**: Track metrics
8. **Security First**: Secure by default
