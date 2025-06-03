// utils/notifications.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Get token and request permission
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permission not granted!");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "d80cbfa4-17b7-44ae-9955-a47743e5be15", // Replace with your real ID
  });

  const token = tokenData.data;

  // Android: set notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
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
