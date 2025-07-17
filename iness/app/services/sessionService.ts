import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { ChatMessage } from "../interfaces/chatInterface";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const sessionService = {
  getSessions,
  updateSession,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getSessions(): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.get(`${baseUrl}/get-sessions`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

////// Function for updating the session ---------------------------------/
async function updateSession(payload: any) {
  try {
    const { sessionId, data } = payload;
    return fetchWrapper.put(`${baseUrl}/update-session/${sessionId}`, {
      ...data,
    });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
