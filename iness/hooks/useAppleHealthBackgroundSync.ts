/**
 * useAppleHealthBackgroundSync Hook
 * Handles automatic background syncing on app open/foreground
 */

import { useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useDispatch } from "react-redux";
import { updateTrackingField } from "@/Slices/trackSlice";
import { trackService } from "@/app/services/track.service";
import { useAppleHealthSync } from "./useAppleHealthSync";
import {
  HealthKit,
  SyncManager,
  SyncStorage,
  HEALTH_SYNC_CONFIG,
  LOG_PREFIX,
  isToday,
} from "@/services/healthSync";

export function useAppleHealthBackgroundSync(): void {
  const { isAvailable, syncStatus, isInitialized } = useAppleHealthSync();
  const dispatch = useDispatch();

  // Refs for tracking state
  const syncInProgressRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const mountedRef = useRef(true);

  // ============================================
  // Background Sync Logic
  // ============================================

  /**
   * Refresh display with current data from backend ONLY
   * NEVER calls HealthKit - prevents UI freeze
   * COMPLETELY NON-BLOCKING - uses requestAnimationFrame for smooth updates
   */
  const refreshDisplayData = useCallback((): void => {
    if (!isAvailable || !syncStatus) return;

    // Use requestAnimationFrame to ensure UI is responsive
    requestAnimationFrame(() => {
      // Defer API call to next tick to prevent blocking
      setTimeout(async () => {
        try {
          // Get current day data from backend
          const response = await trackService.getCurrentDayTrackData();
          if (!response.success || !response.data) return;

          // CRITICAL: Just use backend value - NEVER call HealthKit here
          // Backend already has the correct synced data
          // Use requestAnimationFrame for Redux dispatch to prevent blocking
          if (syncStatus.stepSync && response.data.steps) {
            requestAnimationFrame(() => {
              if (mountedRef.current) {
                dispatch(
                  updateTrackingField({
                    type: "steps",
                    data: response.data.steps,
                  })
                );
              }
            });
          }

          if (syncStatus.sleepSync && response.data.sleep) {
            requestAnimationFrame(() => {
              if (mountedRef.current) {
                dispatch(
                  updateTrackingField({
                    type: "sleep",
                    data: response.data.sleep,
                  })
                );
              }
            });
          }
        } catch (error) {
          console.error(`${LOG_PREFIX.BACKGROUND} Display refresh error:`, error);
        }
      }, 0);
    });
  }, [isAvailable, syncStatus, dispatch]);

  /**
   * Sync new data to backend (runs in background)
   * COMPLETELY NON-BLOCKING - fires and forgets
   */
  const syncToBackend = useCallback((): void => {
    if (!isAvailable || !syncStatus || syncInProgressRef.current) return;
    if (!syncStatus.stepSync && !syncStatus.sleepSync) return;

    syncInProgressRef.current = true;

    // Fire sync in background - NO AWAIT, NO BLOCKING
    SyncManager.syncNewData(syncStatus).then((success) => {
      if (success && mountedRef.current) {
        // Refresh data from backend in background
        refreshDisplayData();
      }
      syncInProgressRef.current = false;
    }).catch((error) => {
      console.error(`${LOG_PREFIX.BACKGROUND} Error:`, error);
      syncInProgressRef.current = false;
    });
  }, [isAvailable, syncStatus, refreshDisplayData]);

  /**
   * Retry any pending syncs
   * COMPLETELY NON-BLOCKING - fires and forgets
   */
  const retryPending = useCallback((): void => {
    if (!isAvailable) return;

    // Fire retry in background - NO AWAIT, NO BLOCKING
    SyncManager.retryPendingSync(syncStatus).catch((error) => {
      console.error(`${LOG_PREFIX.BACKGROUND} Retry error:`, error);
    });
  }, [isAvailable, syncStatus]);

  // REMOVED runFullSync - it was causing UI freeze
  // Now we only sync to backend, never refresh display (which was calling HealthKit)

  // ============================================
  // App State Listener
  // ============================================

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        // App came to foreground
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // Only sync to backend - don't refresh display (prevents UI freeze)
          setTimeout(() => {
            syncToBackend();
          }, 1000); // Delay to prevent blocking
        }

        appStateRef.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, [syncToBackend]);

  // ============================================
  // Initial Sync on Mount
  // ============================================

  useEffect(() => {
    mountedRef.current = true;

    if (isAvailable && isInitialized && syncStatus) {
      // Delay initial sync significantly to prevent UI freeze on app open
      // Only sync to backend - don't refresh display (prevents UI freeze)
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          // Only sync to backend - don't refresh display (prevents UI freeze)
          setTimeout(() => {
            syncToBackend();
          }, 500);
        }
      }, HEALTH_SYNC_CONFIG.initialSyncDelayMs + 2000); // Extra 2 second delay

      return () => clearTimeout(timer);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [isAvailable, isInitialized, syncStatus, syncToBackend]);

  // ============================================
  // Periodic Retry
  // ============================================

  useEffect(() => {
    if (!isAvailable) return;

    const interval = setInterval(() => {
      retryPending();
    }, HEALTH_SYNC_CONFIG.retryDelayMs);

    return () => clearInterval(interval);
  }, [isAvailable, retryPending]);
}
