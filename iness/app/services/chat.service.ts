import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { ChatMessage } from "../interfaces/chatInterface";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const chatService = {
  getSupportConversation,
  addSupportMessage,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getSupportConversation(): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.get(`${baseUrl}/get-supportchat`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

async function addSupportMessage(
  data: ChatMessage
): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.post(`${baseUrl}/add-supportmessage`, { data });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
