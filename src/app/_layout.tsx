import {
  PixelifySans_400Regular,
  PixelifySans_500Medium,
  PixelifySans_700Bold,
  useFonts,
} from '@expo-google-fonts/pixelify-sans';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DATABASE_NAME, initDatabase } from '../lib/db';
import { colors, fonts } from '../theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PixelifySans_400Regular,
    PixelifySans_500Medium,
    PixelifySans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.night },
              headerTintColor: colors.parchment,
              headerTitleStyle: { fontFamily: fonts.bold, fontSize: 20 },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.night },
            }}
          >
            <Stack.Screen name="index" options={{ title: 'LevelUp' }} />
            <Stack.Screen name="log-workout" options={{ title: 'Log Workout', presentation: 'modal' }} />
            <Stack.Screen name="log-meal" options={{ title: 'Log Meal', presentation: 'modal' }} />
          </Stack>
          <StatusBar style="light" />
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
