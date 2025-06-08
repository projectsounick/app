import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Constants.isDevice) {
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

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo push token:", token);

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  } else {
    alert("Must use physical device for Push Notifications");
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
