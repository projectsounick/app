import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { ChatMessage } from "../interfaces/chatInterface";
import { AddCartItemsApiCallInterface } from "../interfaces/cartInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { Post } from "../interfaces/communityService";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting cartService functions --------------------------------------/
export const communityService = {
  createPost,
  getCommunityPosts,
  togglePostLike,
  createPostComment,
  getPostComment,
  getUserCommunityById,
  deletePost,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getCommunityPosts(
  communityId: string,
  page: number,
  limit: number,
  allPost: any
): Promise<any> {
  try {
    return fetchWrapper.get(
      `${baseUrl}/get-community-posts/?communityId=${communityId}&page=${page}&limit=${limit}&allPost=${allPost}`
    );
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
async function deletePost(postId: string): Promise<any> {
  try {
    return fetchWrapper.delete(`${baseUrl}/delete-post/${postId}`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
async function getUserCommunityById(): Promise<any> {
  try {
    return fetchWrapper.get(`${baseUrl}/get-user-communityId`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
//// Funciton for deleting the cart items
async function createPost(data: Post): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.post(`${baseUrl}/create-post`, { ...data });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

async function togglePostLike(postId: string, notificationData: any) {
  try {
    return fetchWrapper.post(`${baseUrl}/toggle-post-like/${postId}`, {
      ...notificationData,
    });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
async function createPostComment(postId: string, comment: string) {
  try {
    return fetchWrapper.post(`${baseUrl}/create-post-comment/${postId}`, {
      comment,
    });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
async function getPostComment(postId: string) {
  try {
    return fetchWrapper.get(`${baseUrl}/get-post-comments/${postId}`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
