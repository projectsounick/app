import AsyncStorage from "@react-native-async-storage/async-storage";

type NavigationLike<T extends Record<string, undefined>> = {
  navigate(screenName: keyof T & string): void;
};

/**
 * Type-safe generic utility to check and navigate to a stored screen name.
 */
export const checkAndNavigateToStoredScreen = async <
  T extends Record<string, undefined>
>(
  navigation: NavigationLike<T>,
  storageKey: string = "screenName"
): Promise<void> => {
  try {
    const storedValue = await AsyncStorage.getItem(storageKey);

    if (storedValue) {
      const screenName = JSON.parse(storedValue);

      if (typeof screenName === "string") {
        navigation.navigate(screenName as keyof T & string);
      }
    }
  } catch (error) {
    console.error("Failed to check and navigate to stored screen:", error);
  }
};
