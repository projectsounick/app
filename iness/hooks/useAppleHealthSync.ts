/**
 * useAppleHealthSync Hook
 * Main hook for Apple Health sync functionality
 * Provides sync status, actions, and state management
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  HealthDataType,
  SyncStatus,
  SyncResult,
  UseHealthSyncReturn,
  HealthKit,
  SyncManager,
} from "@/services/healthSync";

export function useAppleHealthSync(): UseHealthSyncReturn {
  // ============================================
  // State
  // ============================================
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const isAvailable = HealthKit.isHealthKitAvailable();
  const mountedRef = useRef(true);
  const syncStatusRef = useRef<SyncStatus | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    syncStatusRef.current = syncStatus;
  }, [syncStatus]);

  // ============================================
  // Initialization
  // ============================================

  useEffect(() => {
    mountedRef.current = true;
    
    if (isAvailable) {
      initializeSync();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [isAvailable]);

  const initializeSync = async () => {
    try {
      const status = await SyncManager.fetchSyncStatus();
      if (mountedRef.current) {
        setSyncStatus(status);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("[useAppleHealthSync] Init error:", error);
      if (mountedRef.current) {
        setIsInitialized(true);
      }
    }
  };

  // ============================================
  // Actions
  // ============================================

  /**
   * Refresh sync status from backend
   */
  const refreshSyncStatus = useCallback(async (): Promise<void> => {
    try {
      const status = await SyncManager.fetchSyncStatus();
      if (mountedRef.current) {
        setSyncStatus(status);
        syncStatusRef.current = status;
      }
    } catch (error) {
      console.error("[useAppleHealthSync] Error refreshing sync status:", error);
    }
  }, []);

  /**
   * Check if sync is allowed for a type
   */
  const canSync = useCallback(
    (type: HealthDataType): boolean => {
      return SyncManager.canSyncType(type, syncStatus);
    },
    [syncStatus]
  );

  /**
   * Sync data for a specific type (manual trigger)
   */
  const syncData = useCallback(
    async (type: HealthDataType): Promise<SyncResult> => {
      console.log("========== [useAppleHealthSync] syncData START ==========");
      console.log(`[useAppleHealthSync] Type: ${type}`);
      console.log(`[useAppleHealthSync] Timestamp:`, new Date().toISOString());
      console.log(`[useAppleHealthSync] Current isSyncing state:`, isSyncing);
      console.log(`[useAppleHealthSync] isAvailable:`, isAvailable);
      
      if (!isAvailable) {
        console.log("[useAppleHealthSync] HealthKit not available, returning");
        return { success: false, value: 0, error: "HealthKit not available" };
      }

      if (isSyncing) {
        console.log("[useAppleHealthSync] Sync already in progress, returning");
        return { success: false, value: 0, error: "Sync already in progress" };
      }

      console.log("[useAppleHealthSync] Setting isSyncing = true");
      setIsSyncing(true);
      console.log("[useAppleHealthSync] isSyncing set to true");

      try {
        // Get current syncStatus from ref (always latest, no dependency issues)
        const currentStatus = syncStatusRef.current;
        console.log("[useAppleHealthSync] About to call SyncManager.syncDataType...");
        console.log("[useAppleHealthSync] Current status from ref:", JSON.stringify(currentStatus));
        const startTime = Date.now();
        const result = await SyncManager.syncDataType(type, currentStatus);
        const duration = Date.now() - startTime;
        console.log(`[useAppleHealthSync] SyncManager returned after ${duration}ms`);
        console.log(`[useAppleHealthSync] SyncManager result:`, JSON.stringify(result));

        // Clear syncing state IMMEDIATELY - don't wait for anything
        console.log("[useAppleHealthSync] Setting isSyncing = false (IMMEDIATELY)");
        setIsSyncing(false);
        console.log("[useAppleHealthSync] isSyncing cleared");

        // Update sync status IMMEDIATELY to hide sync button (use functional update to avoid dependency)
        if (result.success) {
          console.log("[useAppleHealthSync] Updating local sync status immediately...");
          setSyncStatus((prevStatus) => {
            if (prevStatus) {
              const updatedStatus: SyncStatus = {
                ...prevStatus,
                ...(type === "steps" ? { stepSync: true } : {}),
                ...(type === "sleep" ? { sleepSync: true } : {}),
                lastSyncIOS: new Date(), // Update last sync time
              };
              console.log("[useAppleHealthSync] New sync status:", JSON.stringify(updatedStatus));
              return updatedStatus;
            } else {
              // If no status yet, create one
              const newStatus: SyncStatus = {
                stepSync: type === "steps",
                sleepSync: type === "sleep",
                lastSyncIOS: new Date(),
                lastSyncAndroid: null,
              };
              console.log("[useAppleHealthSync] New sync status created:", JSON.stringify(newStatus));
              return newStatus;
            }
          });
          console.log("[useAppleHealthSync] Local sync status updated - button should disappear now");
          
          // Refresh status from backend in background (non-blocking) to confirm
          // Use setTimeout with delay to ensure immediate update is not overwritten
          setTimeout(() => {
            console.log("[useAppleHealthSync] Starting refreshSyncStatus in background (fire-and-forget)");
            // Fetch status directly to avoid overwriting immediate update
            SyncManager.fetchSyncStatus().then((status) => {
              // Only update if the immediate update hasn't changed the status
              // This prevents overwriting the immediate update
              if (mountedRef.current && status) {
                setSyncStatus((prev) => {
                  // If prev already has sync enabled, keep it (don't overwrite with backend)
                  if (prev && (prev.stepSync || prev.sleepSync)) {
                    console.log("[useAppleHealthSync] Keeping immediate update, not overwriting with backend");
                    return prev;
                  }
                  // Otherwise use backend status
                  console.log("[useAppleHealthSync] Using backend status");
                  syncStatusRef.current = status;
                  return status;
                });
              }
            }).catch((err) => {
              console.error("[useAppleHealthSync] fetchSyncStatus error (non-blocking):", err);
            });
          }, 100); // Small delay to ensure immediate update is applied first
        }

        console.log("========== [useAppleHealthSync] syncData END ==========");
        return result;
      } catch (error: any) {
        console.error("[useAppleHealthSync] EXCEPTION in syncData:", error);
        console.error("[useAppleHealthSync] Error message:", error?.message);
        console.error("[useAppleHealthSync] Error stack:", error?.stack);
        console.log("[useAppleHealthSync] Setting isSyncing = false (in catch)");
        setIsSyncing(false);
        console.log("========== [useAppleHealthSync] syncData END (error) ==========");
        return { success: false, value: 0, error: error.message };
      }
    },
    [isAvailable, isSyncing, refreshSyncStatus]
  );

  /**
   * Get today's value from Apple Health
   */
  const getTodayValue = useCallback(
    async (type: HealthDataType): Promise<number> => {
      if (!isAvailable) return 0;
      return HealthKit.getTodayValue(type);
    },
    [isAvailable]
  );

  // ============================================
  // Return
  // ============================================

  return {
    // State
    isAvailable,
    isSyncing,
    syncStatus,
    isInitialized,

    // Actions
    canSync,
    syncData,
    refreshSyncStatus,
    getTodayValue,
  };
}

// Re-export type for convenience
export type { HealthDataType } from "@/services/healthSync";
