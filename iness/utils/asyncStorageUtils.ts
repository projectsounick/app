import { AsyncStorageCheckResult } from "@/app/interfaces/otherInterfaces";
import { UserData } from "@/app/interfaces/UserInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";

/// Exporting the Utility functions for AsyncStorage --------------------------------------/
export const asyncStorageUtils = {
  storeUserInAsyncStorage,
  checkIfKeyExistsInAsyncStorage,
  storeScreenName,
  updateUserDataInAsyncStorage,
  updateUserAccessToken,
};

async function storeUserInAsyncStorage(userData: any) {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem("user", jsonValue);
  } catch (e) {
    console.error("Error saving user data to AsyncStorage:", e);
  }
}

async function updateUserAccessToken(newAccessToken: string) {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (!storedUser) return;

    const userObj = JSON.parse(storedUser);

    // Update the token in the user object
    userObj.jwtToken = newAccessToken;

    // Save the updated object back to AsyncStorage
    await AsyncStorage.setItem("user", JSON.stringify(userObj));
  } catch (error) {
    console.error("Error updating access token:", error);
  }
}
/// Function to check if a key exists in AsyncStorage and return its value
async function checkIfKeyExistsInAsyncStorage<T = any>(
  key: string
): Promise<AsyncStorageCheckResult<T>> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue !== null) {
      const parsed: T = JSON.parse(jsonValue);
      return { data: parsed, exists: true };
    } else {
      return { data: null, exists: false };
    }
  } catch (error) {
    console.error(`Error reading key "${key}" from AsyncStorage:`, error);
    return { data: null, exists: false };
  }
}

/// Function to store screen name in AsyncStorage
async function storeScreenName(
  screenName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await AsyncStorage.setItem("screenName", JSON.stringify(screenName));
    return { success: true };
  } catch (error: any) {
    console.error("Error storing screen name:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/// Function to update user data in AsyncStorage
async function updateUserDataInAsyncStorage(updates: Partial<UserData>) {
  try {
    const existing = await AsyncStorage.getItem("user");
    const user: UserData = existing ? JSON.parse(existing) : {};
    const updated = { ...user, ...updates };

    let response = await AsyncStorage.setItem("user", JSON.stringify(updated));
  } catch (error) {
    throw new Error("some error has occurred , try again later");
  }
}
