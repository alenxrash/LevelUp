import {
  PixelifySans_400Regular,
  PixelifySans_500Medium,
  PixelifySans_700Bold,
  useFonts,
} from '@expo-google-fonts/pixelify-sans';
import { Silkscreen_400Regular, Silkscreen_700Bold } from '@expo-google-fonts/silkscreen';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProblemScreen } from '../components/ProblemScreen';
import { DATABASE_NAME, initDatabase } from '../lib/db';
import { colors, fonts } from '../theme';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ProblemScreen title="Something went wrong" detail={String(error?.stack ?? error)} onRetry={retry} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PixelifySans_400Regular,
    PixelifySans_500Medium,
    PixelifySans_700Bold,
    Silkscreen_400Regular,
    Silkscreen_700Bold,
  });
  const [dbError, setDbError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  // On web the database worker can fail outside React (another tab holds the file), which would otherwise leave a blank page.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onError = (event: ErrorEvent) => {
      if (/createSyncAccessHandle|Access Handle/i.test(event.message)) setDbError(new Error(event.message));
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const message = String(event.reason?.message ?? event.reason);
      if (/createSyncAccessHandle|Access Handle/i.test(message)) setDbError(new Error(message));
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  // A font failure falls back to the system font rather than leaving a blank screen.
  if (!fontsLoaded && !fontError) return null;

  if (dbError) {
    return (
      <ProblemScreen
        title="Couldn't open the database"
        hint="On web, the database can only be open in one tab at a time. Close other LevelUp tabs, then try again."
        detail={String(dbError.message ?? dbError)}
        onRetry={() => {
          setDbError(null);
          setAttempt((a) => a + 1);
        }}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider key={attempt} databaseName={DATABASE_NAME} onInit={initDatabase} onError={setDbError}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.text,
              headerTitleStyle: { fontFamily: fonts.bodyBold, fontSize: 20 },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="workout" options={{ title: 'Workout', presentation: 'modal' }} />
            <Stack.Screen name="log-meal" options={{ title: 'Log Meal', presentation: 'modal' }} />
            <Stack.Screen name="cookbook" options={{ title: 'Cookbook' }} />
            <Stack.Screen name="recipe" options={{ title: 'Recipe' }} />
            <Stack.Screen name="recipe-editor" options={{ title: 'Your recipe' }} />
          </Stack>
          <StatusBar style="light" />
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
