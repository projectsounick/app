import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";

/**
 * Type-safe generic utility to check and navigate to a stored screen name.
 */
export const checkAndNavigateToStoredScreen = async <
  T extends Record<string, undefined>
>(
  navigation: NavigationProp<T>,
  storageKey: string = "screenName"
): Promise<void> => {
  try {
    const storedValue = await AsyncStorage.getItem(storageKey);

    if (storedValue) {
      const screenName = JSON.parse(storedValue);

      if (typeof screenName === "string" && screenName in navigation) {
        navigation.navigate(screenName as any);
      }
    }
  } catch (error) {
    console.error("Failed to check and navigate to stored screen:", error);
  }
};
