import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token: string | undefined;
  console.log(Constants);

  try {
    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    // Optional: use project ID for EAS build compatibility
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const pushTokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    token = pushTokenResponse.data;
    console.log("Expo push token:", token);

    // Set notification channel for Android
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
    console.log("called");

    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : [];

    const newNotification = {
      ...notification,
      receivedAt: new Date().toISOString(),
    };

    const updated = [newNotification, ...parsed].slice(0, 10); // Keep only 10 latest

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    console.log("📦 Notification stored.");
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
