import { Stack } from "expo-router";

export default function DashboardStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        animationDuration: 220,
      }}
    />
  );
}
