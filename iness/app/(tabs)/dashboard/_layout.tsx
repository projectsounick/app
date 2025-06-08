import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function DashboardStackLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false, // or true depending on your header
          // Add any global screenOptions here
        }}
      />
    </SafeAreaProvider>
  );
}
