import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store"; // adjust path if needed
import * as Notifications from "expo-notifications";
import { storeNotification } from "@/utils/notificationUtils";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    console.log("called");

    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const content = notification.request.content;

        await storeNotification({
          title: content.title ?? null,
          body: content.body ?? null,
          data: content.data,
        });
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          headerShown: false, // Removes header for all screens
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
      </Stack>
    </Provider>
  );
}
