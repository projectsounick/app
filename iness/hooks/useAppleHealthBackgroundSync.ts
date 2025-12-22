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
   * Sync new data to backend (runs in background)
   */
  const syncToBackend = useCallback(async (): Promise<void> => {
    if (!isAvailable || !syncStatus || syncInProgressRef.current) return;
    if (!syncStatus.stepSync && !syncStatus.sleepSync) return;

    syncInProgressRef.current = true;

    try {
      const success = await SyncManager.syncNewData(syncStatus);

      if (success && mountedRef.current) {
        // Refresh data from backend
        await refreshDisplayData();
      }
    } catch (error) {
      console.error(`${LOG_PREFIX.BACKGROUND} Error:`, error);
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isAvailable, syncStatus]);

  /**
   * Retry any pending syncs
   */
  const retryPending = useCallback(async (): Promise<void> => {
    if (!isAvailable) return;

    try {
      await SyncManager.retryPendingSync(syncStatus);
    } catch (error) {
      console.error(`${LOG_PREFIX.BACKGROUND} Retry error:`, error);
    }
  }, [isAvailable, syncStatus]);

  /**
   * Refresh display with current data from backend ONLY
   * NEVER calls HealthKit - prevents UI freeze
   */
  const refreshDisplayData = useCallback(async (): Promise<void> => {
    if (!isAvailable || !syncStatus) return;

    // Defer to next event loop to prevent blocking
    setTimeout(async () => {
      try {
        // Get current day data from backend
        const response = await trackService.getCurrentDayTrackData();
        if (!response.success || !response.data) return;

        // CRITICAL: Just use backend value - NEVER call HealthKit here
        // Backend already has the correct synced data
        if (syncStatus.stepSync && response.data.steps) {
          if (mountedRef.current) {
            dispatch(
              updateTrackingField({
                type: "steps",
                data: response.data.steps,
              })
            );
          }
        }

        if (syncStatus.sleepSync && response.data.sleep) {
          if (mountedRef.current) {
            dispatch(
              updateTrackingField({
                type: "sleep",
                data: response.data.sleep,
              })
            );
          }
        }
      } catch (error) {
        console.error(`${LOG_PREFIX.BACKGROUND} Display refresh error:`, error);
      }
    }, 0);
  }, [isAvailable, syncStatus, dispatch]);

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
