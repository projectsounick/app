import {
  ApiResponseInterface,
  ComplaintInterface,
} from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "@/store";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
const baseUrl = `${config.apiUrl}/api`;

function getServiceErrorMessage(error: any, fallbackMessage: string) {
  if (typeof error === "string") {
    return error;
  }

  return error?.message || fallbackMessage;
}
///// Exporting userservice functions --------------------------------------/
export const userService = {
  sendLoginOtp,
  verifyLoginOtp,
  updateUser,
  logout,
  getStorageAccountDetails,
  generateRefreshToken,
  deleteaccount,
  addUserComplain,
  getActiveDietPlans,
  blockUser,
  googleSignIn,
  appleSignIn,
  getUserTrainers,
  initDbConnection,
};

//// Function for sending the otp to the user ---------------/
async function sendLoginOtp(email: string): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.post(`${baseUrl}/user-app-login`, {
      email,
    });

    return response;
  } catch (error: any) {
    throw new Error(
      "Error sending OTP: " +
        getServiceErrorMessage(error, "Unable to send OTP")
    );
  }
}

//// Function for verifying the otp sent to the user ---------------/
async function verifyLoginOtp(data: {
  email: string;
  otp: string;
  expoPushToken: string;
  appPlatform?: "ios" | "android";
}): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.post(`${baseUrl}/user-otp-verify`, {
      email: data.email,
      otp: data.otp,
      expoPushToken: data.expoPushToken,
      appPlatform: data.appPlatform,
    });

    return response;
  } catch (error: any) {
    throw new Error(
      getServiceErrorMessage(error, "Unable to verify OTP")
    );
  }
}

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function updateUser(userData: any): Promise<any> {
  try {
    console.log("updateUser: Sending request to update-user endpoint");
    const response = await fetchWrapper.put(`${baseUrl}/update-user`, { data: userData });
    console.log("updateUser: Response received:", JSON.stringify(response));
    
    // If update is successful and response contains user data, update AsyncStorage
    if (response.success && response.user) {
      try {
        await asyncStorageUtils.updateUserDataInAsyncStorage(response.user);
      } catch (storageError) {
        // Don't throw error - the backend update was successful
      }
    }
    
    return response;
  } catch (error: any) {
    // fetchWrapper rejects with string error, not Error object
    const errorMessage = getServiceErrorMessage(error, "Unknown error");
    console.log("updateUser: Error:", errorMessage);
    throw new Error("Error updating user: " + errorMessage);
  }
}

///// Function for loging out the user ------------------------------------------------/
async function logout() {
  try {

    await AsyncStorage.clear();
    store.dispatch({ type: "RESET_STORE" });

    // ✅ Wait for layout mount and router availability
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          if (router?.replace) {
            router.replace("/"); // Navigate to root
          }
        } catch (err) {
          // Router navigation failed
        }
      }, 150);
    });
  } catch (error) {
    // Logout error
  }
}

async function deleteaccount() {
  try {
    return fetchWrapper.delete(`${baseUrl}/delete-user`);
  } catch (error) {
    // Error deleting account
  }
}

///// Function for getting the storage account details ------------------------------/
async function getStorageAccountDetails(folderName: string) {
  try {
    return fetchWrapper.get(
      `${baseUrl}/get-storageaccount-details?container=${folderName}`
    );
  } catch (error: any) {
    throw new Error(
      "Error updating user: " +
        getServiceErrorMessage(error, "Unable to fetch storage details")
    );
  }
}
async function updateAccessTokenInStorage(newAccessToken: string) {
  try {
    const userDataString = await AsyncStorage.getItem("user");

    if (!userDataString) {
      return;
    }

    const userData = JSON.parse(userDataString);
    userData.accessToken = newAccessToken;

    await AsyncStorage.setItem("user", JSON.stringify(userData));
  } catch (e) {
    // Error updating accessToken
  }
}
///// Function for getting the getting new refresh token  ------------------------------/
async function generateRefreshToken(userId: string) {
  try {
    const response = await fetchWrapper.get(
      `${baseUrl}/generate-refreshtoken?userId=${userId}`
    );

    // If refresh is successful, update the access token in storage
    if (response.success && response.accessToken) {
      await updateAccessTokenInStorage(response.accessToken);
    }

    return response;
  } catch (error: any) {
    throw new Error(
      "Error updating user: " +
        getServiceErrorMessage(error, "Unable to refresh session")
    );
  }
}
//// Funciton for Complaining ----/
async function addUserComplain(data: ComplaintInterface): Promise<any> {
  try {
    return fetchWrapper.post(`${baseUrl}/add-user-complain`, { ...data });
  } catch (error: any) {
    throw new Error(
      "Error updating user: " +
        getServiceErrorMessage(error, "Unable to submit complaint")
    );
  }
}
//// Funciton for userblocking ----/
async function blockUser(data: any): Promise<any> {
  try {
    return fetchWrapper.post(`${baseUrl}/block-user`, { ...data });
  } catch (error: any) {
    throw new Error(
      "Error updating user: " +
        getServiceErrorMessage(error, "Unable to block user")
    );
  }
}

////Function for getting the user active diet plans ----------------------------/
async function getActiveDietPlans() {
  try {
    return fetchWrapper.get(`${baseUrl}/get-active-diets`);
  } catch (error: any) {
    throw new Error(
      "Error updating user: " +
        getServiceErrorMessage(error, "Unable to fetch active diets")
    );
  }
}

//// Function for getting user trainers ---------------/
async function getUserTrainers(): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.get(`${baseUrl}/get-user-trainers`);
  } catch (error: any) {
    throw new Error(
      "Error fetching trainers: " +
        getServiceErrorMessage(error, "Unable to fetch trainers")
    );
  }
}

//// Function for Google Sign-In ---------------/
async function googleSignIn(data: {
  idToken: string;
  expoPushToken?: string;
  appPlatform?: "ios" | "android";
}): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.post(`${baseUrl}/google-signin`, {
      idToken: data.idToken,
      expoPushToken: data.expoPushToken,
      appPlatform: data.appPlatform,
    });
    return response;
  } catch (error: any) {
    throw new Error(
      "Error with Google sign-in: " +
        getServiceErrorMessage(error, "Google sign-in failed")
    );
  }
}

//// Function for Apple Sign-In ---------------/
async function appleSignIn(data: {
  identityToken: string;
  userIdentifier: string;
  email?: string;
  fullName?: { givenName?: string; familyName?: string };
  expoPushToken?: string;
  appPlatform?: "ios" | "android";
}): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.post(`${baseUrl}/apple-signin`, {
      identityToken: data.identityToken,
      userIdentifier: data.userIdentifier,
      email: data.email,
      fullName: data.fullName,
      expoPushToken: data.expoPushToken,
      appPlatform: data.appPlatform,
    });
    return response;
  } catch (error: any) {
    throw new Error(
      "Error with Apple sign-in: " +
        getServiceErrorMessage(error, "Apple sign-in failed")
    );
  }
}

//// Function for initializing database connection ---------------/
async function initDbConnection(): Promise<ApiResponseInterface> {
  try {
    // Use GET method for simplicity, no body needed
    const response = await fetchWrapper.get(`${baseUrl}/init-db-connection`);
    return response;
  } catch (error: any) {
    // Don't throw error - this is a background optimization, app should continue even if it fails
    return {
      success: false,
      message: error?.message || "Failed to initialize database connection",
      statusCode: 500,
      data: null,
    };
  }
}
