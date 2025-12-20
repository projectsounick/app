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
      if (!isAvailable) {
        return { success: false, value: 0, error: "HealthKit not available" };
      }

      if (isSyncing) {
        return { success: false, value: 0, error: "Sync already in progress" };
      }

      setIsSyncing(true);

      try {
        // Get current syncStatus from ref (always latest, no dependency issues)
        const currentStatus = syncStatusRef.current;
        const result = await SyncManager.syncDataType(type, currentStatus);

        // Clear syncing state IMMEDIATELY - don't wait for anything
        setIsSyncing(false);

        // Update sync status in next frame to avoid blocking (but still fast for button to disappear)
        if (result.success) {
          // Use requestAnimationFrame to ensure it's non-blocking but still fast
          requestAnimationFrame(() => {
            setSyncStatus((prevStatus) => {
              if (prevStatus) {
                const updatedStatus: SyncStatus = {
                  ...prevStatus,
                  ...(type === "steps" ? { stepSync: true } : {}),
                  ...(type === "sleep" ? { sleepSync: true } : {}),
                  lastSyncIOS: new Date(), // Update last sync time
                };
                syncStatusRef.current = updatedStatus;
                return updatedStatus;
              } else {
                // If no status yet, create one
                const newStatus: SyncStatus = {
                  stepSync: type === "steps",
                  sleepSync: type === "sleep",
                  lastSyncIOS: new Date(),
                  lastSyncAndroid: null,
                };
                syncStatusRef.current = newStatus;
                return newStatus;
              }
            });
          });
          
          // Refresh status from backend in background (non-blocking) to confirm
          // Use setTimeout with delay to ensure immediate update is not overwritten
          setTimeout(() => {
            // Fetch status directly to avoid overwriting immediate update
            SyncManager.fetchSyncStatus().then((status) => {
              // Only update if the immediate update hasn't changed the status
              // This prevents overwriting the immediate update
              if (mountedRef.current && status) {
                setSyncStatus((prev) => {
                  // If prev already has sync enabled, keep it (don't overwrite with backend)
                  if (prev && (prev.stepSync || prev.sleepSync)) {
                    return prev;
                  }
                  // Otherwise use backend status
                  syncStatusRef.current = status;
                  return status;
                });
              }
            }).catch((err) => {
              console.error("[useAppleHealthSync] fetchSyncStatus error (non-blocking):", err);
            });
          }, 100); // Small delay to ensure immediate update is applied first
        }

        return result;
      } catch (error: any) {
        console.error("[useAppleHealthSync] EXCEPTION in syncData:", error);
        console.error("[useAppleHealthSync] Error message:", error?.message);
        console.error("[useAppleHealthSync] Error stack:", error?.stack);
        setIsSyncing(false);
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
