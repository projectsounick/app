import { router, Stack } from "expo-router";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store";
import * as Notifications from "expo-notifications";
import {
  storeNotification,
  storePendingNavigation,

} from "@/utils/notificationUtils";
import { useEffect } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text, LogBox } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import eventBus from "@/event";
import * as NavigationBar from "expo-navigation-bar";

import SystemNavigationBar from "react-native-system-navigation-bar";
import React from "react";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import {
  handleNotificationNavigation,
  NotificationData,
  NotificationNavigationData,
} from "@/app/utils/notificationRouter";
import { ThemeProvider } from "@/app/Theme/ThemeContext";

// Fonts
SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs(["useInsertionEffect must not schedule updates."]);

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
  const [layoutReady, setLayoutReady] = React.useState(false);
  const [fontsLoaded] = useFonts({
    SatoshiRegular: require("../assets/fonts/Satoshi-Regular.otf"),
    SatoshiMedium: require("../assets/fonts/Satoshi-Medium.otf"),
    SatoshiBold: require("../assets/fonts/Satoshi-Bold.otf"),
  });
  useEffect(() => {
    setLayoutReady(true);
  }, []);

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
    // ✅ Only check user once after fonts are loaded
    const checkUser = async () => {
      try {
        const hasSession = await asyncStorageUtils.hasAuthenticatedUserSession();
        const userResponse =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        if (hasSession && userResponse.exists) {
          if (userResponse.data?.onboarding) {
            router.replace("/secondsplashscreen");
          } else {
            router.replace("/Onboarding");
          }
        } else if (hasSession) {
          router.replace("/secondsplashscreen");
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };
    if (layoutReady) {
      checkUser();
    }
  }, [fontsLoaded, layoutReady]);

  // Check if app was opened from a notification (when app was closed)
  // Only store the notification data, don't navigate yet - navigation will happen after app is ready
  useEffect(() => {
    const checkInitialNotification = async () => {
      try {
        // Wait a bit for the app to initialize
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if app was opened from a notification
        const lastResponse = await Notifications.getLastNotificationResponseAsync();

        if (lastResponse) {
          const notification = lastResponse.notification;
          const data = notification.request.content.data;



          // Extract navigation data from notification
          let notificationData: NotificationData | null = null;

          if (data) {
            // Check if navigationData is nested and has screen
            if (data.navigationData && typeof data.navigationData === 'object' && 'screen' in data.navigationData) {
              notificationData = {
                type: (data.type as any) || undefined,
                navigationData: data.navigationData as NotificationNavigationData,
              };
            } else if (data.type) {
              // Data has type but no navigationData, construct it
              let screen = "/dashboard/tabs";
              let params: Record<string, any> = (data.params as Record<string, any>) || {};

              if (data.type === "support_message") {
                screen = "/dashboard/supportchat";
              } else if (data.type === "post_like" || data.type === "comment") {
                screen = "/dashboard/tabs/feed";
              } else if (data.type === "session") {
                screen = "/dashboard/tabs";
              } else if (data.type === "trainer_chat") {
                screen = "/dashboard/trainerchat";
                // Include trainer chat params if available
                if (data.chatId && data.trainerId) {
                  params = {
                    chatId: data.chatId,
                    trainerId: data.trainerId,
                    trainerName: data.trainerName || "Trainer",
                  };
                }
              }

              notificationData = {
                type: data.type as any,
                navigationData: {
                  screen: screen,
                  params: params,
                },
              };
            } else if (data.screen) {
              // Has screen directly
              notificationData = {
                type: (data.type as any) || undefined,
                navigationData: {
                  screen: String(data.screen),
                  params: (data.params as Record<string, any>) || {},
                },
              };
            } else {
              // Fallback: try to extract from data object itself
              notificationData = data as NotificationData;
            }
          }

          if (notificationData) {
            // Store for later navigation (after app is fully ready)
            await storePendingNavigation(notificationData);
          }

          // Clear the consumed response so stale notification taps
          // don't get replayed on the next cold app launch.
          if (typeof Notifications.clearLastNotificationResponseAsync === "function") {
            await Notifications.clearLastNotificationResponseAsync();
          }
        }
      } catch (error) {
        console.error("Error checking initial notification:", error);
      }
    };

    if (fontsLoaded) {
      checkInitialNotification();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Listener: store notification on receipt
    const receivedSubscription = Notifications.addNotificationReceivedListener(
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

    // Listener: handle notification tap/click (when app is running)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const notification = response.notification;
        const data = notification.request.content.data;

        // Extract navigation data from notification
        // The data might be nested in navigationData or directly in data
        let notificationData: NotificationData | null = null;

        if (data) {
          // Check if navigationData is nested and has screen
          if (data.navigationData && typeof data.navigationData === 'object' && 'screen' in data.navigationData) {
            notificationData = {
              type: (data.type as any) || undefined,
              navigationData: data.navigationData as NotificationNavigationData,
            };
          } else if (data.type) {
            // Data has type but no navigationData, construct it
            let screen = "/dashboard/tabs";
            let params: Record<string, any> = data.params || {};

            if (data.type === "support_message") {
              screen = "/dashboard/supportchat";
            } else if (data.type === "post_like" || data.type === "comment") {
              screen = "/dashboard/tabs/feed";
            } else if (data.type === "session") {
              screen = "/dashboard/tabs";
            } else if (data.type === "trainer_chat") {
              screen = "/dashboard/trainerchat";
              // Include trainer chat params if available
              if (data.chatId && data.trainerId) {
                params = {
                  chatId: data.chatId,
                  trainerId: data.trainerId,
                  trainerName: data.trainerName || "Trainer",
                };
              }
            }

            notificationData = {
              type: data.type as any,
              navigationData: {
                screen: screen,
                params: params,
              },
            };
          } else if (data.screen) {
            // Has screen directly
            notificationData = {
              type: (data.type as any) || undefined,
              navigationData: {
                screen: String(data.screen),
                params: (data.params as Record<string, any>) || {},
              },
            };
          }
        }

        if (!notificationData) {
          return; // No valid notification data
        }

        // If this listener is called, app is running, so navigate immediately
        // Also store it in case navigation fails
        try {
          await storePendingNavigation(notificationData);

          // Navigate immediately when app is running
          setTimeout(() => {
            try {

              handleNotificationNavigation(router, notificationData);
            } catch (error) {
              console.error("Error handling notification navigation:", error);
            }
          }, 300);
        } catch (error) {
          console.error("Error storing notification navigation:", error);
        }
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
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
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
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
