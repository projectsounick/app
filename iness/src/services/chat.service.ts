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
  getTrainerChat,
  getTrainerChats,
  addTrainerMessage,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getSupportConversation(
  targetUserId?: string
): Promise<ApiResponseInterface> {
  try {
    const loggedUser = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
      "user"
    );
    let userId;
    if (loggedUser.exists) {
      userId = loggedUser.data._id;
    }
    return fetchWrapper.get(
      `${baseUrl}/get-supportchat/${targetUserId || userId}`
    );
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

async function getTrainerChat(chatId: string): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.get(`${baseUrl}/trainerchat/${chatId}`);
  } catch (error: any) {
    throw new Error("Error getting trainer chat: " + error.message);
  }
}

async function getTrainerChats(
  trainerId?: string
): Promise<ApiResponseInterface> {
  try {
    const endpoint = trainerId
      ? `${baseUrl}/get-trainerchats/${trainerId}`
      : `${baseUrl}/get-trainerchats`;

    return fetchWrapper.get(endpoint);
  } catch (error: any) {
    throw new Error("Error getting trainer chats: " + error.message);
  }
}

async function addTrainerMessage(
  data: ChatMessage,
  chatId: string
): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.post(`${baseUrl}/trainerchat/${chatId}`, {
      data,
    });
  } catch (error: any) {
    throw new Error("Error adding trainer message: " + error.message);
  }
}
