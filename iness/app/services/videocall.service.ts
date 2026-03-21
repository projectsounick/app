import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";

const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const videocallService = {
  joinVideoCall,
  getActiveVideoCall,
  createOpenVideoCall,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function joinVideoCall(data: any): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.post(`${baseUrl}/get-videocall-token`, {
      ...data,
    });

    return response;
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

//// Funciton for getting the video call which is active----/
async function getActiveVideoCall(): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.get(`${baseUrl}/get-video-call-details`);

    return response;
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

//// Function for creating an open video call----/
async function createOpenVideoCall(data: any): Promise<ApiResponseInterface> {
  try {
    let response = await fetchWrapper.post(`${baseUrl}/create-open-videocall`, {
      ...data,
    });

    return response;
  } catch (error: any) {
    throw new Error("Error creating video call: " + error.message);
  }
}
