import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { NotificationProvider } from './src/services/notifications';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { setupInterceptors } from './src/services/api';
import { linkingConfiguration } from './src/navigation/linking';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          'Roboto-Regular': require('./src/assets/fonts/Roboto-Regular.ttf'),
          'Roboto-Bold': require('./src/assets/fonts/Roboto-Bold.ttf'),
          'Roboto-Medium': require('./src/assets/fonts/Roboto-Medium.ttf'),
        });

        // Setup API interceptors
        setupInterceptors(store);

        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide the splash screen once the app is ready
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Provider store={store}>
            <PersistGate loading={<LoadingScreen />} persistor={persistor}>
              <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                  <NavigationContainer linking={linkingConfiguration}>
                    <RootNavigator />
                    <StatusBar style="auto" />
                  </NavigationContainer>
                </NotificationProvider>
              </QueryClientProvider>
            </PersistGate>
          </Provider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
