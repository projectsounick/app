import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const userService = {
  sendLoginOtp,
  verifyLoginOtp,
  updateUser,
  logout,
  getStorageAccountDetails,
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
    console.log("this is data");

    console.log(data);

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
    await AsyncStorage.clear();
    router.replace("/"); // Navigate to root (login/home) screen
  } catch (error) {
    console.error("Logout error:", error);
  }
}

///// Function for getting the storage account details ------------------------------/
async function getStorageAccountDetails() {
  try {
    return fetchWrapper.get(`${baseUrl}/get-storageaccount-details`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
