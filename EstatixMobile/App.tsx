import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from "expo-splash-screen";

import AppNavigator from './src/navigation/AppNavigator';
import CustomSplash from './CustomSplash';

import { useAuthStore } from './src/store/authStore';
import { useThemeStore } from './src/store/themeStore';
import { usePushNotifications } from './src/hooks/usePushNotifications';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const { loadStoredAuth } = useAuthStore();
  const { loadTheme } = useThemeStore();

  usePushNotifications();

  useEffect(() => {
    loadStoredAuth();
    loadTheme();

    const prepare = async () => {
      setTimeout(async () => {
        setShowSplash(false);

        await SplashScreen.hideAsync();
      }, 2500);
    };

    prepare();
  }, []);

  if (showSplash) {
    return <CustomSplash />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}