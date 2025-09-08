import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function DashboardStackLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerShown: false, // or true depending on your header
            // Add any global screenOptions here
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
