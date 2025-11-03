import {
  ApiResponseInterface,
  ComplaintInterface,
} from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "@/store";
const baseUrl = `${config.apiUrl}/api`;
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
};

//// Function for sending the otp to the user ---------------/
async function sendLoginOtp(email: string): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.post(`${baseUrl}/user-app-login`, {
      email,
    });

    return response;
  } catch (error: any) {
    throw new Error("Error sending OTP: " + error.message);
  }
}

//// Function for verifying the otp sent to the user ---------------/
async function verifyLoginOtp(data: {
  email: string;
  otp: string;
  expoPushToken: string;
}): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.post(`${baseUrl}/user-otp-verify`, {
      email: data.email,
      otp: data.otp,
      expoPushToken: data.expoPushToken,
    });
    console.log("this is response");
    console.log(response);

    return response;
  } catch (error: any) {
    throw new Error("Error sending OTP: " + error.message);
  }
}

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function updateUser(userData: any): Promise<any> {
  try {
    return fetchWrapper.put(`${baseUrl}/update-user`, { data: userData });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

///// Function for loging out the user ------------------------------------------------/

async function logout() {
  try {
    console.log("Logout called");
    await AsyncStorage.clear();

    const keys = await AsyncStorage.getAllKeys();
    console.log("Remaining keys after clear:", keys);

    const user = await AsyncStorage.getItem("user");
    console.log("User after clear:", user);
    store.dispatch({ type: "RESET_STORE" });
    router.replace("/"); // Navigate to root (login/home) screen
  } catch (error) {
    console.error("Logout error:", error);
  }
}
async function deleteaccount() {
  try {
    return fetchWrapper.delete(`${baseUrl}/delete-user`);
  } catch (error) {
    console.error("Logout error:", error);
  }
}

///// Function for getting the storage account details ------------------------------/
async function getStorageAccountDetails(folderName: string) {
  try {
    return fetchWrapper.get(
      `${baseUrl}/get-storageaccount-details?container=${folderName}`
    );
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
async function updateAccessTokenInStorage(newAccessToken: string) {
  try {
    const userDataString = await AsyncStorage.getItem("user");

    if (!userDataString) {
      console.warn("User not found in AsyncStorage");
      return;
    }

    const userData = JSON.parse(userDataString);
    userData.accessToken = newAccessToken;

    await AsyncStorage.setItem("user", JSON.stringify(userData));
  } catch (e) {
    console.error("Error updating accessToken in AsyncStorage:", e);
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
    throw new Error("Error updating user: " + error.message);
  }
}
//// Funciton for Complaining ----/
async function addUserComplain(data: ComplaintInterface): Promise<any> {
  try {
    return fetchWrapper.post(`${baseUrl}/add-user-complain`, { ...data });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
//// Funciton for userblocking ----/
async function blockUser(data: any): Promise<any> {
  try {
    return fetchWrapper.post(`${baseUrl}/block-user`, { ...data });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

////Function for getting the user active diet plans ----------------------------/
async function getActiveDietPlans() {
  try {
    return fetchWrapper.get(`${baseUrl}/get-active-diets`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
