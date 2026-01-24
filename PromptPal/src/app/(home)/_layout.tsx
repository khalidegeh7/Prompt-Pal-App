import { Stack, useRouter, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Layout() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect to sign-in if not signed in and trying to access home
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="flex-row items-center mb-6">
            <Text className="text-primary text-4xl font-bold">Prompt</Text>
            <Text className="text-secondary text-4xl font-bold">Pal</Text>
          </View>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text className="text-onSurfaceVariant text-base mt-4 text-center">
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="game/[id]" />
    </Stack>
  );
}
