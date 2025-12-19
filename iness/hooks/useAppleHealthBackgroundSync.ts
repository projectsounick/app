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
    console.log(`${LOG_PREFIX.BACKGROUND} Starting background sync...`);

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
   * Refresh display with current data (backend + today's Apple Health)
   */
  const refreshDisplayData = useCallback(async (): Promise<void> => {
    if (!isAvailable || !syncStatus) return;

    try {
      // Get current day data from backend
      const response = await trackService.getCurrentDayTrackData();
      if (!response.success || !response.data) return;

      // Update steps display
      if (syncStatus.stepSync && response.data.steps) {
        const backendSteps = response.data.steps.steps || 0;
        const displaySteps = await SyncManager.getDisplayValue(
          "steps",
          backendSteps,
          syncStatus
        );

        if (mountedRef.current) {
          dispatch(
            updateTrackingField({
              type: "steps",
              data: { ...response.data.steps, steps: displaySteps },
            })
          );
        }
      }

      // Update sleep display
      if (syncStatus.sleepSync && response.data.sleep) {
        const backendSleep = response.data.sleep.sleepDuration || 0;
        const displaySleep = await SyncManager.getDisplayValue(
          "sleep",
          backendSleep,
          syncStatus
        );

        if (mountedRef.current) {
          dispatch(
            updateTrackingField({
              type: "sleep",
              data: { ...response.data.sleep, sleepDuration: displaySleep },
            })
          );
        }
      }
    } catch (error) {
      console.error(`${LOG_PREFIX.BACKGROUND} Display refresh error:`, error);
    }
  }, [isAvailable, syncStatus, dispatch]);

  /**
   * Full sync routine (display + backend + retry)
   */
  const runFullSync = useCallback(async (): Promise<void> => {
    if (!isAvailable || !syncStatus) return;
    if (!syncStatus.stepSync && !syncStatus.sleepSync) return;

    console.log(`${LOG_PREFIX.BACKGROUND} Running full sync routine...`);

    // 1. Update display immediately with Apple Health data
    await refreshDisplayData();

    // 2. Sync new data to backend (in background)
    await syncToBackend();

    // 3. Retry any pending syncs
    await retryPending();
  }, [isAvailable, syncStatus, refreshDisplayData, syncToBackend, retryPending]);

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
          console.log(`${LOG_PREFIX.BACKGROUND} App came to foreground`);
          runFullSync();
        }

        appStateRef.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, [runFullSync]);

  // ============================================
  // Initial Sync on Mount
  // ============================================

  useEffect(() => {
    mountedRef.current = true;

    if (isAvailable && isInitialized && syncStatus) {
      // Delay initial sync to let app initialize
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          runFullSync();
        }
      }, HEALTH_SYNC_CONFIG.initialSyncDelayMs);

      return () => clearTimeout(timer);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [isAvailable, isInitialized, syncStatus, runFullSync]);

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
