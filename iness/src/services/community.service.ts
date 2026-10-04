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
  reportPostComment,
  deletePostComment,
  getUserCommunityById,
  deletePost,
  getFeedHub,
  feedAction,
  createStory,
  getFeedExtras,
  feedExtraAction,
  trackEngagement,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getCommunityPosts(
  communityId: string,
  page: number,
  limit: number,
  allPost: any,
  search?: string,
  sort?: string
): Promise<any> {
  try {
    const searchParam =
      search && search.trim()
        ? `&search=${encodeURIComponent(search.trim())}`
        : "";
    const sortParam =
      sort && sort.trim()
        ? `&sort=${encodeURIComponent(sort.trim())}`
        : "";
    return fetchWrapper.get(
      `${baseUrl}/get-community-posts/?communityId=${communityId}&page=${page}&limit=${limit}&allPost=${allPost}${searchParam}${sortParam}`
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
async function getPostComment(postId: string, page?: number, limit?: number) {
  try {
    const query = new URLSearchParams();
    if (page) {
      query.set("page", String(page));
    }
    if (limit) {
      query.set("limit", String(limit));
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return fetchWrapper.get(`${baseUrl}/get-post-comments/${postId}${suffix}`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

async function reportPostComment(
  commentId: string,
  reason: string,
  details: string,
  targetType: "comment" | "user" = "comment"
) {
  try {
    return fetchWrapper.post(`${baseUrl}/report-post-comment/${commentId}`, {
      reason,
      details,
      targetType,
    });
  } catch (error: any) {
    throw new Error("Unable to submit report: " + error.message);
  }
}

async function deletePostComment(commentId: string) {
  try {
    return fetchWrapper.delete(`${baseUrl}/delete-post-comment/${commentId}`);
  } catch (error: any) {
    throw new Error("Unable to delete comment: " + error.message);
  }
}

async function getFeedHub(communityId: string) {
  return fetchWrapper.get(`${baseUrl}/get-feed-hub?communityId=${communityId}`);
}

async function feedAction(data: Record<string, unknown>) {
  return fetchWrapper.post(`${baseUrl}/feed-action`, data);
}

async function createStory(data: Record<string, unknown>) {
  return fetchWrapper.post(`${baseUrl}/create-story`, data);
}

async function getFeedExtras(communityId: string, section: string, storyId?: string) {
  const params = new URLSearchParams({ communityId, section });
  if (storyId) params.set("storyId", storyId);
  return fetchWrapper.get(`${baseUrl}/get-feed-extras?${params.toString()}`);
}

async function feedExtraAction(data: Record<string, unknown>) {
  return fetchWrapper.post(`${baseUrl}/feed-extra-action`, data);
}

async function trackEngagement(data: Record<string, unknown>) {
  return fetchWrapper.post(`${baseUrl}/track-engagement`, data);
}
