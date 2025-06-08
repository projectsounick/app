import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { ChatMessage } from "../interfaces/chatInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const chatService = {
  getSupportConversation,
  addSupportMessage,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getSupportConversation(): Promise<ApiResponseInterface> {
  try {
    const loggedUser = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
      "user"
    );
    let userId;
    if (loggedUser.exists) {
      userId = loggedUser.data._id;
    }
    return fetchWrapper.get(`${baseUrl}/get-supportchat/${userId}`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

async function addSupportMessage(
  data: ChatMessage,
  userId: string
): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.post(`${baseUrl}/add-supportmessage/${userId}`, {
      data,
    });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
