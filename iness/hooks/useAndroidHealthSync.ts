/**
 * useAndroidHealthSync Hook
 * Main hook for Android Health Connect sync functionality
 * Provides sync status, actions, and state management
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  HealthDataType,
  SyncStatus,
  SyncResult,
  UseHealthSyncReturn,
} from "@/services/healthSync";
import * as HealthConnect from "@/services/healthSync/healthConnectService";
import * as AndroidSyncManager from "@/services/healthSync/androidSyncManager";
import { trackService } from "@/app/services/track.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAndroidHealthSync(): UseHealthSyncReturn {
  // ============================================
  // State
  // ============================================
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const isAvailable = HealthConnect.isHealthConnectAvailable();
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
      // First try to get from AsyncStorage (fast)
      let status = await AndroidSyncManager.fetchAndroidSyncStatus();
      
      // Also fetch from backend to ensure we have latest data
      try {
        const backendResponse = await trackService.getHealthSyncStatus("android");
        if (backendResponse.success && backendResponse.data) {
          // Update AsyncStorage with backend data
          const userDataStr = await AsyncStorage.getItem("user");
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (!userData.androidHealth) {
              userData.androidHealth = {};
            }
            userData.androidHealth = {
              ...userData.androidHealth,
              stepSync: backendResponse.data.stepSync || false,
              sleepSync: backendResponse.data.sleepSync || false,
              syncModalShown: backendResponse.data.syncModalShown || false,
              lastSyncedStepsValue: backendResponse.data.lastSyncedStepsValue ?? null,
              lastSyncedStepsDate: backendResponse.data.lastSyncedStepsDate 
                ? new Date(backendResponse.data.lastSyncedStepsDate).toISOString() 
                : null,
              lastSyncedSleepValue: backendResponse.data.lastSyncedSleepValue ?? null,
              lastSyncedSleepDate: backendResponse.data.lastSyncedSleepDate 
                ? new Date(backendResponse.data.lastSyncedSleepDate).toISOString() 
                : null,
            };
            await AsyncStorage.setItem("user", JSON.stringify(userData));
          }
          
          // Use backend data
          status = {
            stepSync: backendResponse.data.stepSync || false,
            sleepSync: backendResponse.data.sleepSync || false,
            syncModalShown: backendResponse.data.syncModalShown || false,
            lastSyncedStepsValue: backendResponse.data.lastSyncedStepsValue ?? null,
            lastSyncedStepsDate: backendResponse.data.lastSyncedStepsDate 
              ? new Date(backendResponse.data.lastSyncedStepsDate) 
              : null,
            lastSyncedSleepValue: backendResponse.data.lastSyncedSleepValue ?? null,
            lastSyncedSleepDate: backendResponse.data.lastSyncedSleepDate 
              ? new Date(backendResponse.data.lastSyncedSleepDate) 
              : null,
          };
        }
      } catch (backendError) {
        console.error("[useAndroidHealthSync] Backend fetch error (using AsyncStorage):", backendError);
        // Continue with AsyncStorage data if backend fails
      }

      if (mountedRef.current) {
        setSyncStatus(status);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("[useAndroidHealthSync] Init error:", error);
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
      // Fetch from backend with Android platform
      const backendResponse = await trackService.getHealthSyncStatus("android");
      if (backendResponse.success && backendResponse.data) {
        // Update AsyncStorage with backend data
        const userDataStr = await AsyncStorage.getItem("user");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (!userData.androidHealth) {
            userData.androidHealth = {};
          }
          userData.androidHealth = {
            ...userData.androidHealth,
            stepSync: backendResponse.data.stepSync || false,
            sleepSync: backendResponse.data.sleepSync || false,
            syncModalShown: backendResponse.data.syncModalShown || false,
            lastSyncedStepsValue: backendResponse.data.lastSyncedStepsValue ?? null,
            lastSyncedStepsDate: backendResponse.data.lastSyncedStepsDate 
              ? new Date(backendResponse.data.lastSyncedStepsDate).toISOString() 
              : null,
            lastSyncedSleepValue: backendResponse.data.lastSyncedSleepValue ?? null,
            lastSyncedSleepDate: backendResponse.data.lastSyncedSleepDate 
              ? new Date(backendResponse.data.lastSyncedSleepDate).toISOString() 
              : null,
          };
          await AsyncStorage.setItem("user", JSON.stringify(userData));
        }
        
        const status: SyncStatus = {
          stepSync: backendResponse.data.stepSync || false,
          sleepSync: backendResponse.data.sleepSync || false,
          syncModalShown: backendResponse.data.syncModalShown || false,
          lastSyncedStepsValue: backendResponse.data.lastSyncedStepsValue ?? null,
          lastSyncedStepsDate: backendResponse.data.lastSyncedStepsDate 
            ? new Date(backendResponse.data.lastSyncedStepsDate) 
            : null,
          lastSyncedSleepValue: backendResponse.data.lastSyncedSleepValue ?? null,
          lastSyncedSleepDate: backendResponse.data.lastSyncedSleepDate 
            ? new Date(backendResponse.data.lastSyncedSleepDate) 
            : null,
        };
        
        if (mountedRef.current) {
          setSyncStatus(status);
          syncStatusRef.current = status;
        }
      } else {
        // Fallback to AsyncStorage if backend fails
        const status = await AndroidSyncManager.fetchAndroidSyncStatus();
        if (mountedRef.current) {
          setSyncStatus(status);
          syncStatusRef.current = status;
        }
      }
    } catch (error) {
      console.error("[useAndroidHealthSync] Error refreshing sync status:", error);
      // Fallback to AsyncStorage
      const status = await AndroidSyncManager.fetchAndroidSyncStatus();
      if (mountedRef.current) {
        setSyncStatus(status);
        syncStatusRef.current = status;
      }
    }
  }, []);

  /**
   * Check if sync is allowed for a type
   */
  const canSync = useCallback(
    (type: HealthDataType): boolean => {
      return AndroidSyncManager.canSyncType(type, syncStatus);
    },
    [syncStatus]
  );

  /**
   * Sync data for a specific type (manual trigger)
   */
  const syncData = useCallback(
    async (type: HealthDataType): Promise<SyncResult> => {
      if (!isAvailable) {
        return { success: false, value: 0, error: "Health Connect not available" };
      }

      if (isSyncing) {
        return { success: false, value: 0, error: "Sync already in progress" };
      }

      setIsSyncing(true);

      try {
        const currentStatus = syncStatusRef.current;
        const result = await AndroidSyncManager.syncDataType(type, currentStatus, "android");

        setIsSyncing(false);

        if (result.success) {
          requestAnimationFrame(() => {
            setSyncStatus((prevStatus) => {
              if (prevStatus) {
                const updatedStatus: SyncStatus = {
                  ...prevStatus,
                  ...(type === "steps" ? { stepSync: true, syncModalShown: true, lastSyncedStepsDate: new Date() } : {}),
                  ...(type === "sleep" ? { sleepSync: true, syncModalShown: true, lastSyncedSleepDate: new Date() } : {}),
                };
                syncStatusRef.current = updatedStatus;
                return updatedStatus;
              } else {
                const newStatus: SyncStatus = {
                  syncModalShown: true,
                  stepSync: type === "steps",
                  sleepSync: type === "sleep",
                  ...(type === "steps" ? { lastSyncedStepsDate: new Date() } : {}),
                  ...(type === "sleep" ? { lastSyncedSleepDate: new Date() } : {}),
                };
                syncStatusRef.current = newStatus;
                return newStatus;
              }
            });
          });
          
          setTimeout(() => {
            AndroidSyncManager.fetchAndroidSyncStatus().then((status) => {
              if (mountedRef.current && status) {
                setSyncStatus((prev) => {
                  if (prev && (prev.stepSync || prev.sleepSync)) {
                    return prev;
                  }
                  syncStatusRef.current = status;
                  return status;
                });
              }
            }).catch((err) => {
              console.error("[useAndroidHealthSync] fetchAndroidSyncStatus error:", err);
            });
          }, 100);
        }

        return result;
      } catch (error: any) {
        console.error("[useAndroidHealthSync] EXCEPTION in syncData:", error);
        setIsSyncing(false);
        return { success: false, value: 0, error: error.message };
      }
    },
    [isAvailable, isSyncing, refreshSyncStatus]
  );

  /**
   * Get today's value from Health Connect
   */
  const getTodayValue = useCallback(
    async (type: HealthDataType): Promise<number> => {
      if (!isAvailable) return 0;
      return HealthConnect.getTodayValue(type);
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

