import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store"; // adjust path if needed
import * as Notifications from "expo-notifications";
import { storeNotification } from "@/utils/notificationUtils";
import { useEffect } from "react";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true, // this is important!
  }),
});
export default function RootLayout() {
  useEffect(() => {
    console.log("Notification listener initialized");

    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const content = notification.request.content;
        console.log("called");

        await storeNotification({
          title: content.title ?? null,
          body: content.body ?? null,
          data: content.data,
        });
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
      });

    return () => {
      subscription.remove();
      responseListener.remove();
    };
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
