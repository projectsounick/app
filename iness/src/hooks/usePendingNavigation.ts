import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "expo-router";
import {
  getPendingNavigation,
  clearPendingNavigation,
  isNavigationProcessing,
  setNavigationProcessing,
} from "@/utils/notificationUtils";
import {
  handleNotificationNavigation,
  NotificationData,
} from "@/src/utils/notificationRouter";

/**
 * Custom hook to handle pending navigation from notifications
 * Waits for dashboard to be ready before navigating
 */
export const usePendingNavigation = (loading: boolean) => {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const navigationHandledRef = useRef(false);

  useEffect(() => {
    const isDashboardHome =
      pathname === "/dashboard/tabs" ||
      pathname === "/(tabs)/dashboard/tabs" ||
      pathname?.endsWith("/tabs/index") ||
      pathname?.endsWith("/tabs");

    // If the user already switched away from Home, don't let delayed
    // startup navigation pull them back to the default tab.
    if (!isDashboardHome) {
      navigationHandledRef.current = true;
      clearPendingNavigation();
      setNavigationProcessing(false);
      return;
    }

    // Early return checks
    if (loading) return; // Wait for loading
    if (navigationHandledRef.current) return; // Already handled

    let isMounted = true; // Track if component is still mounted
    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleTimeout = (fn: () => void, delay: number) => {
      const timer = setTimeout(() => {
        if (isMounted && isCurrentlyOnDashboardHome()) {
          fn();
        }
      }, delay);
      timers.push(timer);
      return timer;
    };

    const isCurrentlyOnDashboardHome = () => {
      const p = pathnameRef.current;
      return (
        p === "/dashboard/tabs" ||
        p === "/(tabs)/dashboard/tabs" ||
        p?.endsWith("/tabs/index") ||
        p?.endsWith("/tabs")
      );
    };

    let retryCount = 0;
    const maxRetries = 5;

    const checkPendingNavigation = async (retry = false) => {
      try {
        // Wait longer to ensure dashboard is fully ready, especially when app was closed
        // First check: wait longer (3 seconds) to ensure dashboard is fully loaded
        // Retry: shorter wait (1 second) since dashboard should be ready
        const waitTime = retry ? 1000 : 3000;
        await new Promise((resolve) => {
          const t = setTimeout(resolve, waitTime);
          timers.push(t);
        });

        if (!isMounted || !isCurrentlyOnDashboardHome()) {
          navigationHandledRef.current = true;
          return;
        }

        // Additional check: Ensure router is ready and dashboard is loaded
        // Wait a bit more if loading is still true
        if (loading && retryCount < maxRetries) {
          retryCount++;
          scheduleTimeout(() => checkPendingNavigation(true), 1500);
          return;
        }

        // Check if we're already on target screens (skip if already navigated)
        const currentPath = pathnameRef.current || "";
        if (
          currentPath.includes("/supportchat") ||
          currentPath.includes("/feed") ||
          currentPath.includes("/train") ||
          currentPath.includes("/store") ||
          currentPath.includes("/trainerchat")
        ) {
          // Already navigated, mark as handled
          navigationHandledRef.current = true;
          return;
        }

        // Check if navigation is already being processed
        const isProcessing = await isNavigationProcessing();
        if (isProcessing) {
          // If processing, wait a bit and retry
          if (retryCount < maxRetries && !retry) {
            retryCount++;
            scheduleTimeout(() => checkPendingNavigation(true), 1500);
          } else {
            navigationHandledRef.current = true;
          }
          return;
        }

        const pending = await getPendingNavigation();

        if (!pending) {
          // No pending navigation, but retry a few times in case it's being stored
          if (retryCount < maxRetries && !retry) {
            retryCount++;
            scheduleTimeout(() => checkPendingNavigation(true), 1500);
          } else {
            navigationHandledRef.current = true;
          }
          return;
        }

        // Check if navigation data is still valid
        const pendingTime = new Date(pending.timestamp).getTime();
        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - pendingTime >= fiveMinutes) {
          // Too old, clear and mark as handled
          clearPendingNavigation();
          navigationHandledRef.current = true;
          return;
        }

        // Mark as processing and handled IMMEDIATELY before any async operations
        await setNavigationProcessing(true);
        navigationHandledRef.current = true;

        // Merge notification data properly, preserving all fields including chatId, trainerId, trainerName
        let notificationData: NotificationData;

        if (pending.data?.navigationData) {
          notificationData = {
            ...pending.data,
            navigationData: pending.data.navigationData,
            // Preserve top-level fields that might be needed
            chatId:
              pending.data.chatId ||
              pending.data.navigationData?.params?.chatId,
            trainerId:
              pending.data.trainerId ||
              pending.data.navigationData?.params?.trainerId,
            trainerName:
              pending.data.trainerName ||
              pending.data.navigationData?.params?.trainerName,
          };
        } else if (pending.data) {
          // If no navigationData, try to construct it from type and params
          notificationData = { ...pending.data };

          if (
            pending.data.type === "trainer_chat" &&
            pending.data.chatId &&
            pending.data.trainerId
          ) {
            notificationData.navigationData = {
              screen: "/dashboard/trainerchat",
              params: {
                chatId: pending.data.chatId,
                trainerId: pending.data.trainerId,
                trainerName: pending.data.trainerName || "Trainer",
              },
            };
          }
        } else {
          notificationData = {};
        }

        // Get target screen path
        const targetScreen =
          notificationData.navigationData?.screen ||
          (notificationData.type === "support_message"
            ? "/dashboard/supportchat"
            : notificationData.type === "post_like" ||
              notificationData.type === "comment"
            ? "/dashboard/tabs/feed"
            : notificationData.type === "session"
            ? "/dashboard/tabs"
            : notificationData.type === "trainer_chat"
            ? "/dashboard/trainerchat"
            : null);

        // Check if we're already on the target screen
        if (targetScreen) {
          if (
            notificationData.type === "support_message" &&
            currentPath.includes("/supportchat")
          ) {
            clearPendingNavigation();
            setNavigationProcessing(false);
            return;
          }
          if (
            (notificationData.type === "post_like" ||
              notificationData.type === "comment") &&
            currentPath.includes("/feed")
          ) {
            clearPendingNavigation();
            setNavigationProcessing(false);
            return;
          }
          if (
            notificationData.type === "trainer_chat" &&
            currentPath.includes("/trainerchat")
          ) {
            clearPendingNavigation();
            setNavigationProcessing(false);
            return;
          }
        }

        // Clear navigation data IMMEDIATELY to prevent other checks
        clearPendingNavigation();

        // Navigate with longer delay to ensure dashboard is fully ready
        // Especially important when app was closed and just opened
        if (isMounted && isCurrentlyOnDashboardHome()) {
          scheduleTimeout(() => {
            if (isMounted && isCurrentlyOnDashboardHome()) {
              try {
                // Additional small delay before actual navigation to ensure router is ready
                scheduleTimeout(() => {
                  if (isMounted && isCurrentlyOnDashboardHome()) {
                    handleNotificationNavigation(router, notificationData);
                  }
                }, 500);
              } catch (error) {
                console.error("Error handling pending navigation:", error);
              } finally {
                // Clear processing flag after navigation
                scheduleTimeout(() => {
                  setNavigationProcessing(false);
                }, 3000);
              }
            }
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking pending navigation:", error);
        clearPendingNavigation();
        setNavigationProcessing(false);
        navigationHandledRef.current = true;
      }
    };

    // Execute when loading is done
    checkPendingNavigation();

    return () => {
      isMounted = false;
      timers.forEach((t) => clearTimeout(t));
    };
  }, [router, loading, pathname]);
};
