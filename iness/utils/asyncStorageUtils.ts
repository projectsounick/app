import { AsyncStorageCheckResult } from "@/src/interfaces/otherInterfaces";
import { UserData } from "@/src/interfaces/UserInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";

/// Exporting the Utility functions for AsyncStorage --------------------------------------/
export const asyncStorageUtils = {
  storeUserInAsyncStorage,
  checkIfKeyExistsInAsyncStorage,
  storeScreenName,
  updateUserDataInAsyncStorage,
  updateUserAccessToken,
  storeDataInAsyncStorage,
  removeKeyFromAsyncStorage,
  hasAuthenticatedUserSession,
};

async function storeUserInAsyncStorage(userData: any) {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem("user", jsonValue);
  } catch {
    console.error("Failed to save user data to AsyncStorage");
  }
}
//// Store data in async storage ------------------------------------------/
async function storeDataInAsyncStorage(data: any, key: string) {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch {
    console.error("Failed to save data to AsyncStorage");
  }
}

async function removeKeyFromAsyncStorage(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    console.error("Failed to remove data from AsyncStorage");
  }
}
async function updateUserAccessToken(
  newAccessToken: string,
  refreshToken?: string,
  refreshTokenExpiresAt?: string
) {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (!storedUser) return;

    const userObj = JSON.parse(storedUser);

    // Update the token in the user object
    userObj.jwtToken = newAccessToken;
    userObj.accessToken = newAccessToken;
    if (refreshToken) {
      userObj.refreshToken = refreshToken;
    }
    if (refreshTokenExpiresAt) {
      userObj.refreshTokenExpiresAt = refreshTokenExpiresAt;
    }

    // Save the updated object back to AsyncStorage
    await AsyncStorage.setItem("user", JSON.stringify(userObj));
  } catch {
    console.error("Failed to update access token");
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
  } catch {
    console.error("Failed to read data from AsyncStorage");
    return { data: null, exists: false };
  }
}

async function hasAuthenticatedUserSession(): Promise<boolean> {
  try {
    const userResponse =
      await checkIfKeyExistsInAsyncStorage<Record<string, any>>("user");

    if (!userResponse.exists || !userResponse.data) {
      return false;
    }

    const token =
      userResponse.data.jwtToken || userResponse.data.accessToken;

    return Boolean(token);
  } catch {
    console.error("Failed to check authenticated session");
    return false;
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
    
    // Preserve the original _id from stored user data
    // Backend might return userDetails._id which should not overwrite user._id
    // userDetails has userId field that references user._id, not its own _id
    const originalUserId = user._id;
    
    // Merge updates with existing user data
    const updated = { ...user, ...updates };
    
    // Always preserve the original user._id unless it's explicitly being updated
    // This prevents userDetails._id (if present in backend response) from overwriting user._id
    // For theme changes and other updates, we should never change the _id
    if (originalUserId) {
      // Only keep the original _id if updates._id is undefined or matches original
      // If updates explicitly provides a different _id, we still preserve original (shouldn't happen)
      updated._id = originalUserId;
    }

    let response = await AsyncStorage.setItem("user", JSON.stringify(updated));
  } catch (error) {
    throw new Error("some error has occurred , try again later");
  }
}
