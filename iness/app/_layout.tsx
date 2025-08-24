import { router, Stack } from "expo-router";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store";
import * as Notifications from "expo-notifications";
import { storeNotification } from "@/utils/notificationUtils";
import { useEffect } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import eventBus from "@/event";
import * as NavigationBar from "expo-navigation-bar";

import SystemNavigationBar from "react-native-system-navigation-bar";
// Fonts
SplashScreen.preventAutoHideAsync();

// Notification handler config
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Satoshi-Regular": require("../assets/fonts/Satoshi.otf"),
  });
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();

      // Safe defaultProps set
      (Text as any).defaultProps = {
        ...(Text as any).defaultProps,
        style: {
          fontFamily: "Satoshi-Regular",
        },
      };
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Listener: store notification on receipt
    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const content = notification.request.content;

        // ✅ Store notification details
        await storeNotification({
          title: content.title ?? null,
          body: content.body ?? null,
          data: content.data,
        });
        eventBus.emit("notification-received", notification);
      }
    );
    async function hideNavBar() {
      // For background color
      await NavigationBar.setBackgroundColorAsync("#000000");

      // Hide nav bar (expo-navigation-bar)
      await NavigationBar.setVisibilityAsync("hidden");

      // Force immersive mode (react-native-system-navigation-bar)
      SystemNavigationBar.stickyImmersive();
    }
    hideNavBar();
    return () => {
      subscription.remove();
    };
  }, []);
  // Do not render anything until font is loaded
  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
        </Stack>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
