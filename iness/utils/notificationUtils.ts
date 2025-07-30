import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  Platform,
  Alert,
  Linking,
  AppState,
  AppStateStatus,
} from "react-native";
import * as Device from "expo-device";

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token: string | undefined;

  try {
    if (!Device.isDevice) {
      alert("Push notifications require a physical device.");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return new Promise((resolve) => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
          if (nextAppState === "active") {
            subscription.remove(); // ✅ use `.remove()` from returned subscription
            const { status } = await Notifications.getPermissionsAsync();
            if (status === "granted") {
              const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

              const pushTokenResponse = projectId
                ? await Notifications.getExpoPushTokenAsync({ projectId })
                : await Notifications.getExpoPushTokenAsync();

              token = pushTokenResponse.data;

              if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("default", {
                  name: "default",
                  importance: Notifications.AndroidImportance.MAX,
                  vibrationPattern: [0, 250, 250, 250],
                  lightColor: "#FF231F7C",
                });
              }

              resolve(token);
            } else {
              resolve(undefined);
            }
          }
        };

        const subscription = AppState.addEventListener(
          "change",
          handleAppStateChange
        );

        Alert.alert(
          "Enable Notifications",
          "Please enable push notifications in settings to get updates.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve(undefined),
            },
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings();
              },
            },
          ]
        );
      });
    }

    // Already granted
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const pushTokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    token = pushTokenResponse.data;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  } catch (error) {
    console.error("Error getting push token:", error);
  }

  return token;
}
//// Funciton for storing the coming notificaiton in asyncstorage -------------/
// utils/storeNotification.ts

const STORAGE_KEY = "notifications";

export const storeNotification = async (notification: {
  title: string | null;
  body: string | null;
  data: any;
}) => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : [];

    const newNotification = {
      ...notification,
      receivedAt: new Date().toISOString(),
    };

    const updated = [newNotification, ...parsed].slice(0, 10); // Keep only 10 latest

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("❌ Failed to store notification:", error);
  }
};

/// Function for getting the notificaitons -----------------------------------/
export const getStoredNotifications = async (): Promise<
  {
    title: string | null;
    body: string | null;
    data: any;
    receivedAt: string;
  }[]
> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("❌ Failed to load notifications:", error);
    return [];
  }
};
export const deleteNotificationByIndex = async (indexToDelete: number) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const notifications = JSON.parse(stored);
    notifications.splice(indexToDelete, 1); // remove by index

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("❌ Failed to delete notification:", error);
  }
};
