import { Router } from "expo-router";
import eventBus from "@/event";

/**
 * Notification Router Utility
 * 
 * This utility handles routing based on notification type and navigation data.
 * It's designed to be easily extensible for adding new notification types.
 */

export interface NotificationNavigationData {
  screen: string;
  params?: Record<string, any>;
}

export interface NotificationData {
  type?: "video" | "post_like" | "session" | "support_message" | "comment" | "post_deleted" | "blog" | "podcast";
  navigationData?: NotificationNavigationData;
  [key: string]: any; // Allow other data fields
}

/**
 * Routes to the appropriate screen based on notification data
 * @param router - Expo Router instance
 * @param notificationData - Notification data object containing type and navigationData
 */
export function handleNotificationNavigation(
  router: Router,
  notificationData: NotificationData | null | undefined
): void {
  // If no data provided, do nothing
  if (!notificationData) {
    console.log("No notification data provided");
    return;
  }

  try {
    // If navigationData is provided, use it directly
    if (notificationData.navigationData) {
      const { screen, params } = notificationData.navigationData;
      
      // Special handling for session notifications - open calendar
      // Only treat as session if type is explicitly "session", not if screen includes "tabs"
      if (notificationData.type === "session") {
        // Navigate to dashboard first
        router.push("/dashboard/tabs" as any);
        // Emit event to open calendar after a delay to ensure dashboard is ready
        setTimeout(() => {
          try {
            eventBus.emit("open-session-calendar");
          } catch (error) {
            console.error("Error emitting calendar event:", error);
          }
        }, 1500);
        return;
      }

      // Navigate to the specified screen
      // Use push (not replace) to maintain navigation stack for back button
      if (params && Object.keys(params).length > 0) {
        router.push({
          pathname: screen as any,
          params: params,
        } as any);
      } else if (screen) {
        router.push(screen as any);
      }
      return;
    }

    // Fallback: Route based on notification type if navigationData is not provided
    switch (notificationData.type) {
      case "post_like":
      case "comment":
      case "post_deleted":
        // Use push to maintain navigation stack
        router.push("/dashboard/tabs/feed" as any);
        break;

      case "session":
        router.push("/dashboard/tabs" as any);
        // Emit event to open calendar after a delay
        setTimeout(() => {
          try {
            eventBus.emit("open-session-calendar");
          } catch (error) {
            console.error("Error emitting calendar event:", error);
          }
        }, 1500);
        break;

      case "support_message":
        // Use push to maintain navigation stack for back button
        router.push("/dashboard/supportchat" as any);
        break;

      case "video":
        // Video calls navigate to notification screen
        router.push("/dashboard/notification" as any);
        break;

      case "blog":
        // Blog notifications navigate to dashboard (home) where blogs are shown
        router.push("/dashboard/tabs" as any);
        break;

      case "podcast":
        // Podcast notifications navigate to media/podcast screen
        router.push("/dashboard/media" as any);
        break;

      default:
        // Default: navigate to dashboard
        router.push("/dashboard/tabs" as any);
        console.log("Unknown notification type, defaulting to dashboard");
        break;
    }
  } catch (error) {
    console.error("Error in handleNotificationNavigation:", error);
    // Fallback: just go to dashboard if navigation fails
    try {
      router.push("/dashboard/tabs" as any);
    } catch (fallbackError) {
      console.error("Error in fallback navigation:", fallbackError);
    }
  }
}

/**
 * Get the display icon and color based on notification type
 * @param notificationData - Notification data object
 * @returns Object with icon name and color
 */
export function getNotificationIcon(
  notificationData: NotificationData | null | undefined
): { icon: string; color: string; bgColor: string } {
  if (!notificationData) {
    return {
      icon: "notifications-outline",
      color: "#67C694",
      bgColor: "#E8F5E9",
    };
  }

  switch (notificationData.type) {
    case "post_like":
    case "comment":
      return {
        icon: "heart-outline",
        color: "#9747FF",
        bgColor: "#F3EDFF",
      };

    case "session":
      return {
        icon: "calendar-outline",
        color: "#9747FF",
        bgColor: "#F3EDFF",
      };

    case "support_message":
      return {
        icon: "chatbubble-ellipses-outline",
        color: "#67C694",
        bgColor: "#E8F5E9",
      };

    case "video":
      return {
        icon: "videocam-outline",
        color: "#9747FF",
        bgColor: "#F3EDFF",
      };

    case "blog":
      return {
        icon: "document-text-outline",
        color: "#9747FF",
        bgColor: "#F3EDFF",
      };

    case "podcast":
      return {
        icon: "podcast", // MaterialCommunityIcons icon name
        color: "#9747FF",
        bgColor: "#F3EDFF",
      };

    default:
      return {
        icon: "notifications-outline",
        color: "#67C694",
        bgColor: "#E8F5E9",
      };
  }
}

