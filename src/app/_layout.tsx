import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DATABASE_NAME, initDatabase } from '../lib/db';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#1f2430' },
              headerTintColor: '#fff',
              contentStyle: { backgroundColor: '#1f2430' },
            }}
          >
            <Stack.Screen name="index" options={{ title: 'LevelUp' }} />
            <Stack.Screen name="log-workout" options={{ title: 'Log Workout', presentation: 'modal' }} />
          </Stack>
          <StatusBar style="light" />
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
