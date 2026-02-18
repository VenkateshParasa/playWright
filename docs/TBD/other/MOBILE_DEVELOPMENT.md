# Mobile Development Guide

## Development Environment Setup

### Prerequisites Installation

#### 1. Node.js and npm
```bash
# Install Node.js 18+ (LTS)
# macOS
brew install node@18

# Verify installation
node --version  # Should be 18+
npm --version   # Should be 9+
```

#### 2. Expo CLI
```bash
npm install -g expo-cli eas-cli
```

#### 3. iOS Development (macOS only)
```bash
# Install Xcode from App Store
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Install iOS Simulator
# Open Xcode → Preferences → Components → Install simulators
```

#### 4. Android Development
```bash
# Download Android Studio from https://developer.android.com/studio
# Install Android SDK and emulator through Android Studio

# Set environment variables (add to ~/.zshrc or ~/.bash_profile)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload shell
source ~/.zshrc
```

#### 5. Watchman (Recommended)
```bash
brew install watchman
```

### IDE Setup

#### VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "msjsdiag.vscode-react-native",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

#### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.tsx": "typescriptreact"
  }
}
```

## Project Setup

### 1. Clone and Install
```bash
# Clone repository
git clone <repository-url>
cd mobile

# Install dependencies
npm install

# iOS: Install pods
cd ios && pod install && cd ..
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Environment Variables**
```bash
# API Configuration
API_BASE_URL=http://localhost:3001/api

# Expo Configuration
EXPO_PROJECT_ID=your-project-id

# Firebase Configuration (Optional)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id

# Sentry (Optional)
SENTRY_DSN=your-sentry-dsn
```

### 3. Start Development
```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on physical device (scan QR code with Expo Go)
# Just run: npm start
```

## Development Workflow

### Branch Strategy
```
main           → Production releases
develop        → Development branch
feature/*      → New features
bugfix/*       → Bug fixes
hotfix/*       → Production hotfixes
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature develop

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# After approval, merge to develop
```

### Commit Convention
```
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes
refactor: Code refactoring
test: Test changes
chore: Build/tool changes
```

## Code Style Guide

### TypeScript Guidelines

**Component Structure**
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@constants/theme';

// Props interface
interface MyComponentProps {
  title: string;
  onPress: () => void;
  children?: React.ReactNode;
}

// Component
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onPress,
  children,
}) => {
  const theme = useTheme();
  const [state, setState] = useState(false);

  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

**Hooks Pattern**
```typescript
// Custom hook
export const useCustomHook = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
```

**Service Pattern**
```typescript
// Service file
export const userService = {
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
};
```

### Styling Guidelines

**Theme Usage**
```typescript
import { useTheme } from '@constants/theme';

const Component = () => {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Themed Text
      </Text>
    </View>
  );
};
```

**StyleSheet Best Practices**
```typescript
// ❌ Bad: Inline styles
<View style={{ padding: 16, backgroundColor: '#fff' }} />

// ✅ Good: StyleSheet
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
});
<View style={styles.container} />

// ✅ Good: Dynamic with theme
<View style={[styles.container, { backgroundColor: theme.colors.background }]} />
```

**Responsive Design**
```typescript
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: width > 768 ? '50%' : '100%',
    padding: Platform.select({
      ios: 16,
      android: 12,
    }),
  },
});
```

## State Management

### Redux Usage

**Creating a Slice**
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchItems = createAsyncThunk(
  'items/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/items');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearItems: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearItems } = itemsSlice.actions;
export default itemsSlice.reducer;
```

**Using Redux in Components**
```typescript
import { useAppDispatch, useAppSelector } from '@hooks';
import { fetchItems, clearItems } from '@store/slices/itemsSlice';

const Component = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.items);

  useEffect(() => {
    dispatch(fetchItems());
  }, []);

  return (
    <View>
      {loading && <ActivityIndicator />}
      {items.map(item => <Text key={item.id}>{item.name}</Text>)}
    </View>
  );
};
```

### React Query Usage

**Query Hook**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Component = () => {
  const queryClient = useQueryClient();

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => lessonService.getLessons(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutate data
  const mutation = useMutation({
    mutationFn: (id: string) => lessonService.completeLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  return (
    <View>
      {isLoading && <ActivityIndicator />}
      {data?.map(lesson => (
        <TouchableOpacity
          key={lesson.id}
          onPress={() => mutation.mutate(lesson.id)}
        >
          <Text>{lesson.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

## Navigation

### Screen Navigation
```typescript
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<StackParamList>;

const Component = () => {
  const navigation = useNavigation<NavigationProp>();

  const goToDetail = (id: string) => {
    navigation.navigate('Detail', { id });
  };

  return (
    <Button title="Go to Detail" onPress={() => goToDetail('123')} />
  );
};
```

### Route Parameters
```typescript
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

type DetailRouteProp = RouteProp<StackParamList, 'Detail'>;

const DetailScreen = () => {
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  return <Text>Detail ID: {id}</Text>;
};
```

## API Integration

### API Service Setup
```typescript
import axios from 'axios';
import { API_CONFIG } from '@constants';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await storage.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Performance Optimization

### List Optimization
```typescript
import { FlatList, memo } from 'react-native';

// Memoize list item
const ListItem = memo(({ item }: { item: Item }) => {
  return (
    <View>
      <Text>{item.name}</Text>
    </View>
  );
});

// Optimized list
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ListItem item={item} />}
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

### Image Optimization
```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
  }}
  resizeMode={FastImage.resizeMode.cover}
  style={styles.image}
/>
```

### Code Splitting
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

## Debugging

### React Native Debugger
```bash
# Install
brew install --cask react-native-debugger

# Launch
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### Debug Menu
```
iOS Simulator: Cmd + D
Android Emulator: Cmd + M (Mac) or Ctrl + M (Windows/Linux)
Physical Device: Shake device
```

### Useful Debug Commands
```bash
# View logs
npx react-native log-ios
npx react-native log-android

# Debug bundle
npx react-devtools

# Performance monitor
# Enable in app: Debug Menu → Show Perf Monitor
```

## Testing Strategy

### Unit Tests
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@components/common';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test" onPress={() => {}} />
    );
    expect(getByText('Test')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test" onPress={onPress} />
    );

    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Tests
```typescript
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LessonList } from '@screens/Lessons';

const queryClient = new QueryClient();

describe('LessonList', () => {
  it('loads and displays lessons', async () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <LessonList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByText('Lesson 1')).toBeTruthy();
    });
  });
});
```

## Continuous Integration

See `.github/workflows/mobile-ci.yml` for CI/CD configuration.

## Best Practices

### 1. Performance
- Use FlatList for long lists
- Implement image lazy loading
- Memoize expensive calculations
- Use native animations

### 2. Security
- Store sensitive data in SecureStore
- Validate all user input
- Use HTTPS for all API calls
- Implement certificate pinning

### 3. Accessibility
- Add accessibility labels
- Support screen readers
- Ensure sufficient color contrast
- Support dynamic font sizes

### 4. Error Handling
- Use Error Boundaries
- Log errors to monitoring service
- Show user-friendly error messages
- Implement retry logic

### 5. Code Quality
- Follow TypeScript strict mode
- Write tests for critical features
- Use ESLint and Prettier
- Review code before merging

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Query](https://tanstack.com/query)
