import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";

const baseUrl = `${config.apiUrl}/api`;

export interface AiAttachment {
  url: string;
  mimeType: string;
  name?: string;
  size?: number;
}

export interface AiChatMessage {
  _id: string;
  conversationId: string;
  role: "user" | "model" | "system";
  content: string;
  images?: Array<{ url: string; mimeType?: string }>;
  attachments?: AiAttachment[];
  flagged?: boolean;
  createdAt: string;
}

export interface AiConversation {
  _id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface AiConfigData {
  dailyQuestionLimit: number;
  systemPrompt: string;
  expertInstructions?: string;
  disclaimer: string;
  suggestedPrompts: string[];
  enabled: boolean;
  quota: {
    allowed: boolean;
    count: number;
    limit: number;
    remaining: number;
  };
}

export const aiCoachService = {
  // 1. Fetch AI config and current user's remaining quota
  getAiConfigAndQuota: async (): Promise<{ success: boolean; data?: AiConfigData }> => {
    try {
      const response = await fetchWrapper.get(`${baseUrl}/ai-coach-config`);
      return response;
    } catch (error: any) {
      console.error("getAiConfigAndQuota error:", error);
      return { success: false };
    }
  },

  // 2. Fetch list of conversations for user
  getConversations: async (): Promise<{ success: boolean; data: AiConversation[] }> => {
    try {
      const response = await fetchWrapper.get(`${baseUrl}/ai-chat-conversations`);
      return response;
    } catch (error: any) {
      console.error("getConversations error:", error);
      return { success: false, data: [] };
    }
  },

  // 3. Create a new empty conversation
  createConversation: async (title?: string): Promise<{ success: boolean; data?: AiConversation }> => {
    try {
      const response = await fetchWrapper.post(`${baseUrl}/ai-chat-conversations`, {
        title: title || "New Workout Chat",
      });
      return response;
    } catch (error: any) {
      console.error("createConversation error:", error);
      return { success: false };
    }
  },

  // 4. Delete a conversation
  deleteConversation: async (conversationId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetchWrapper.delete(
        `${baseUrl}/ai-chat-conversations/${conversationId}`
      );
      return response;
    } catch (error: any) {
      console.error("deleteConversation error:", error);
      return { success: false, message: error.message };
    }
  },

  // 5. Fetch messages inside a conversation
  getConversationMessages: async (
    conversationId: string
  ): Promise<{ success: boolean; messages: AiChatMessage[]; conversation?: AiConversation }> => {
    try {
      const response = await fetchWrapper.get(
        `${baseUrl}/ai-chat-messages/${conversationId}`
      );
      return response;
    } catch (error: any) {
      console.error("getConversationMessages error:", error);
      return { success: false, messages: [] };
    }
  },

  // 6. Send message to AI Coach (with optional images/documents & 10-day context toggle)
  sendMessage: async (params: {
    conversationId?: string;
    message: string;
    images?: Array<{ base64?: string; url?: string; mimeType?: string }>;
    attachments?: Array<{ base64?: string; url?: string; mimeType?: string; name?: string; size?: number }>;
    personalize?: boolean;
  }): Promise<{
    success: boolean;
    conversationId?: string;
    conversationTitle?: string;
    modelMessage?: AiChatMessage;
    quota?: { count: number; limit: number; remaining: number };
    limitReached?: boolean;
    message?: string;
    disclaimer?: string;
  }> => {
    try {
      const response = await fetchWrapper.post(`${baseUrl}/ai-chat-send`, params);
      return response;
    } catch (error: any) {
      console.error("sendMessage error:", error);
      return {
        success: false,
        message: error?.message || "Failed to reach Iness AI Coach. Please check your connection.",
      };
    }
  },

  // 7. Report AI response (Google Play AI Content compliance)
  reportMessage: async (
    messageId: string,
    reason: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetchWrapper.post(`${baseUrl}/ai-chat-report`, {
        messageId,
        reason,
      });
      return response;
    } catch (error: any) {
      console.error("reportMessage error:", error);
      return { success: false, message: error.message };
    }
  },
};
