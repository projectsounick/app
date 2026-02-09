/**
 * Android Sync Manager
 * Business logic for syncing health data from Android Health Connect to backend
 */

import { trackService } from "@/app/services/track.service";
import {
  HealthDataType,
  SyncPayload,
  SyncPlatform,
  SyncResult,
  SyncStatus,
} from "./types";
import { LOG_PREFIX, HEALTH_SYNC_CONFIG } from "./constants";
import * as HealthConnect from "./healthConnectService";
import * as Storage from "./syncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================
// Sync Status
// ============================================

/**
 * Fetch Android sync status from AsyncStorage user data
 */
export async function fetchAndroidSyncStatus(): Promise<SyncStatus | null> {
  try {
    const userDataStr = await AsyncStorage.getItem("user");

    if (!userDataStr) {
      return null;
    }
    
    const userData = JSON.parse(userDataStr);
    const androidHealth = userData.androidHealth; // Android-specific field

    if (!androidHealth) {
      return {
        stepSync: false,
        sleepSync: false,
        syncModalShown: false,
      };
    }
    
    const status: SyncStatus = {
      stepSync: androidHealth.stepSync || false,
      sleepSync: androidHealth.sleepSync || false,
      syncModalShown: androidHealth.syncModalShown ?? false,
      lastSyncedStepsValue: androidHealth.lastSyncedStepsValue ?? null,
      lastSyncedStepsDate: androidHealth.lastSyncedStepsDate
        ? new Date(androidHealth.lastSyncedStepsDate)
        : null,
      lastSyncedSleepValue: androidHealth.lastSyncedSleepValue ?? null,
      lastSyncedSleepDate: androidHealth.lastSyncedSleepDate
        ? new Date(androidHealth.lastSyncedSleepDate)
        : null,
    };

    return status;
  } catch (error) {
    console.error(`${LOG_PREFIX.SYNC} Error fetching Android status from AsyncStorage:`, error);
    return null;
  }
}

/**
 * Check if sync is allowed for a specific type
 */
export function canSyncType(type: HealthDataType, status: SyncStatus | null): boolean {
  if (!HealthConnect.isHealthConnectAvailable()) return false;
  if (!status) return true; // Allow if status not loaded yet

  if (type === "steps") {
    return !status.stepSync;
  } else if (type === "sleep") {
    return !status.sleepSync;
  }

  return false;
}

// ============================================
// Initial Sync (Manual trigger)
// ============================================

/**
 * Sync a specific data type from Android Health Connect
 * Used when user first enables sync
 */
export async function syncDataType(
  type: HealthDataType,
  status: SyncStatus | null,
  platform: SyncPlatform = "android"
): Promise<SyncResult> {
  if (!HealthConnect.isHealthConnectAvailable()) {
    return { success: false, value: 0, error: "Health Connect not available" };
  }

  try {
    // Check AsyncStorage first to prevent duplicate syncs
    const userDataStr = await AsyncStorage.getItem("user");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      const androidHealth = userData.androidHealth;
      
      if (androidHealth) {
        const storedLastSyncDate = type === "steps"
          ? (androidHealth.lastSyncedStepsDate ? new Date(androidHealth.lastSyncedStepsDate) : null)
          : (androidHealth.lastSyncedSleepDate ? new Date(androidHealth.lastSyncedSleepDate) : null);
        
        if (storedLastSyncDate) {
          if (!status) {
            status = {
              stepSync: false,
              sleepSync: false,
              syncModalShown: false,
            };
          }
          if (type === "steps") {
            status.lastSyncedStepsDate = storedLastSyncDate;
          } else {
            status.lastSyncedSleepDate = storedLastSyncDate;
          }
        }
      }
    }

    // Initialize Health Connect - this shows the permission modal
    // Pass the specific type to only request that permission
    const initialized = await HealthConnect.initializeHealthConnect(true, type);
    
    if (!initialized) {
      return { success: false, value: 0, error: "Health Connect permissions not granted. Please enable in Settings." };
    }

    // Get date range
    const lastSyncDate = type === "steps" 
      ? (status?.lastSyncedStepsDate || null)
      : (status?.lastSyncedSleepDate || null);
    const { startDate, endDate, skipSync } = Storage.getSyncDateRange(lastSyncDate);
    
    if (skipSync) {
      console.log(`${LOG_PREFIX.SYNC} Skipping ${type} sync - no new data to sync`);
      return {
        success: true,
        value: 0,
        syncedCount: 0,
        allData: [],
      };
    }

    // STEP 1: Get today's value IMMEDIATELY (fast call, doesn't block UI)
    let todayValue = 0;
    try {
      todayValue = await HealthConnect.getTodayValue(type);
      console.log(`${LOG_PREFIX.SYNC} Today's ${type} value: ${todayValue}`);
    } catch (error) {
      console.error(`${LOG_PREFIX.SYNC} Error getting today's ${type}:`, error);
    }

    // STEP 2: Return success IMMEDIATELY with today's value for UI update
    // STEP 3: Fetch historical data in BACKGROUND (deferred, non-blocking)
    setTimeout(async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`${LOG_PREFIX.SYNC} Starting background historical data fetch for ${type}...`);
        const data = await HealthConnect.getHistoricalData(type, startDate, endDate);

        if (data.length === 0) {
          const isFirstSync = !lastSyncDate;
          
          if (isFirstSync) {
            HealthConnect.showNoDataOrPermissionAlert(type);
          }
          
          console.log(`${LOG_PREFIX.SYNC} No historical ${type} data found`);
          
          // Even if no data, we should still update sync status if permissions are granted
          // This allows the UI to show sync is enabled even if there's no data yet
          if (isFirstSync) {
            // For first sync with no data, still mark as synced (permissions granted)
            // This way UI will show sync is enabled
            const emptyPayload: SyncPayload = {};
            if (type === "steps") {
              emptyPayload.steps = [];
            } else if (type === "sleep") {
              emptyPayload.sleep = [];
            }
            // Update AsyncStorage to mark sync as enabled (even with no data)
            try {
              const userDataStr = await AsyncStorage.getItem("user");
              if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                if (!userData.androidHealth) {
                  userData.androidHealth = {};
                }
                const now = new Date();
                if (type === "steps") {
                  userData.androidHealth.stepSync = true;
                  userData.androidHealth.syncModalShown = true;
                  userData.androidHealth.lastSyncedStepsDate = now.toISOString();
                  
                  // Check if Sleep permission is also granted (user might have granted both)
                  try {
                    const hasSleepPermission = await HealthConnect.checkPermissionsStatus("sleep");
                    if (hasSleepPermission && !userData.androidHealth.sleepSync) {
                      // Sleep permission is also granted, mark it as synced too
                      userData.androidHealth.sleepSync = true;
                      userData.androidHealth.lastSyncedSleepDate = now.toISOString();
                      console.log(`${LOG_PREFIX.SYNC} Sleep permission also granted, marking sleepSync=true`);
                    }
                  } catch (permError) {
                    console.log(`${LOG_PREFIX.SYNC} Could not check sleep permission:`, permError);
                  }
                } else if (type === "sleep") {
                  userData.androidHealth.sleepSync = true;
                  userData.androidHealth.syncModalShown = true;
                  userData.androidHealth.lastSyncedSleepDate = now.toISOString();
                  
                  // Check if Steps permission is also granted (user might have granted both)
                  try {
                    const hasStepsPermission = await HealthConnect.checkPermissionsStatus("steps");
                    if (hasStepsPermission && !userData.androidHealth.stepSync) {
                      // Steps permission is also granted, mark it as synced too
                      userData.androidHealth.stepSync = true;
                      userData.androidHealth.lastSyncedStepsDate = now.toISOString();
                      console.log(`${LOG_PREFIX.SYNC} Steps permission also granted, marking stepSync=true`);
                    }
                  } catch (permError) {
                    console.log(`${LOG_PREFIX.SYNC} Could not check steps permission:`, permError);
                  }
                }
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                console.log(`${LOG_PREFIX.SYNC} Marked ${type} sync as enabled (no data but permissions granted)`);
              }
            } catch (updateError) {
              console.error(`${LOG_PREFIX.SYNC} Error updating sync status:`, updateError);
            }
          }
          return;
        }

        console.log(`${LOG_PREFIX.SYNC} Fetched ${data.length} historical ${type} entries in background`);

        // Prepare payload
        const payload: SyncPayload = {};
        if (type === "steps") {
          payload.steps = data;
        } else if (type === "sleep") {
          payload.sleep = data;
        }

        // Get timezone offset and sync to backend IN BACKGROUND
        const timezoneOffset = new Date().getTimezoneOffset();
        syncToBackendInBackground(payload, platform, data.length, type, timezoneOffset);
      } catch (error: any) {
        console.error(`${LOG_PREFIX.SYNC} Error in background historical sync for ${type}:`, error);
      }
    }, 0);

    // Create today's date at midnight local time, convert to ISO
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // IMPORTANT: Even if todayValue is 0, we should still mark sync as successful
    // if permissions are granted. This ensures UI shows sync is enabled.
    // The background sync will handle historical data and update AsyncStorage.
    
    // Return immediately with today's value - UI is now unblocked
    return {
      success: true,
      value: todayValue,
      syncedCount: todayValue > 0 ? 1 : 0,
      allData: todayValue > 0 ? [{
        date: today.toISOString(),
        value: todayValue,
      }] : [],
    };
  } catch (error: any) {
    console.error(`${LOG_PREFIX.SYNC} EXCEPTION in syncDataType:`, error);
    return { success: false, value: 0, error: error.message };
  }
}

/**
 * Sync to backend in background and update AsyncStorage after success
 */
function syncToBackendInBackground(
  payload: SyncPayload,
  platform: SyncPlatform,
  entryCount: number,
  type?: HealthDataType,
  timezoneOffset?: number
): void {
  Promise.resolve().then(async () => {
    try {
      const response = await trackService.syncHealthData(payload, platform, timezoneOffset);
      
      if (response.success) {
        await Storage.clearPendingSync();
        
        // Update AsyncStorage user data with Android sync status
        try {
          const userDataStr = await AsyncStorage.getItem("user");
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            
            // Update androidHealth in user data
            if (!userData.androidHealth) {
              userData.androidHealth = {};
            }
            
            const now = new Date();
            
            if (payload.steps) {
              userData.androidHealth.stepSync = true;
              userData.androidHealth.syncModalShown = true;
              userData.androidHealth.lastSyncedStepsDate = now.toISOString();
              const todaySteps = payload.steps.find((entry) => {
                const entryDate = new Date(entry.date);
                const today = new Date();
                return entryDate.toDateString() === today.toDateString();
              });
              if (todaySteps) {
                userData.androidHealth.lastSyncedStepsValue = todaySteps.value;
              }
              console.log(`${LOG_PREFIX.BACKGROUND} Updated Android steps sync status: stepSync=true`);
              
              // Check if Sleep permission is also granted (user might have granted both)
              try {
                const hasSleepPermission = await HealthConnect.checkPermissionsStatus("sleep");
                if (hasSleepPermission && !userData.androidHealth.sleepSync) {
                  // Sleep permission is also granted, mark it as synced too
                  userData.androidHealth.sleepSync = true;
                  userData.androidHealth.lastSyncedSleepDate = now.toISOString();
                  console.log(`${LOG_PREFIX.BACKGROUND} Sleep permission also granted, marking sleepSync=true`);
                }
              } catch (permError) {
                console.log(`${LOG_PREFIX.BACKGROUND} Could not check sleep permission:`, permError);
              }
            }
            if (payload.sleep) {
              userData.androidHealth.sleepSync = true;
              userData.androidHealth.syncModalShown = true;
              userData.androidHealth.lastSyncedSleepDate = now.toISOString();
              const todaySleep = payload.sleep.find((entry) => {
                const entryDate = new Date(entry.date);
                const today = new Date();
                return entryDate.toDateString() === today.toDateString();
              });
              if (todaySleep) {
                userData.androidHealth.lastSyncedSleepValue = todaySleep.value;
              }
              console.log(`${LOG_PREFIX.BACKGROUND} Updated Android sleep sync status: sleepSync=true`);
              
              // Check if Steps permission is also granted (user might have granted both)
              try {
                const hasStepsPermission = await HealthConnect.checkPermissionsStatus("steps");
                if (hasStepsPermission && !userData.androidHealth.stepSync) {
                  // Steps permission is also granted, mark it as synced too
                  userData.androidHealth.stepSync = true;
                  userData.androidHealth.lastSyncedStepsDate = now.toISOString();
                  console.log(`${LOG_PREFIX.BACKGROUND} Steps permission also granted, marking stepSync=true`);
                }
              } catch (permError) {
                console.log(`${LOG_PREFIX.BACKGROUND} Could not check steps permission:`, permError);
              }
            }
            
            // If both steps and sleep are in payload, ensure both are marked as synced
            if (payload.steps && payload.sleep) {
              console.log(`${LOG_PREFIX.BACKGROUND} Both steps and sleep synced together`);
            }
            
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            console.log(`${LOG_PREFIX.BACKGROUND} Updated AsyncStorage user data with Android sync status`);
          }
        } catch (updateError) {
          console.error(`${LOG_PREFIX.BACKGROUND} Error updating AsyncStorage:`, updateError);
        }
      } else {
        console.error(`${LOG_PREFIX.BACKGROUND} Backend sync failed:`, response.message);
        await Storage.storePendingSync(payload, platform);
      }
    } catch (error: any) {
      console.error(`${LOG_PREFIX.BACKGROUND} Backend sync error:`, error?.message);
      await Storage.storePendingSync(payload, platform);
    }
  }).catch((err) => {
    console.error(`${LOG_PREFIX.BACKGROUND} Promise rejection:`, err);
  });
}

// ============================================
// Background Sync
// ============================================

/**
 * Sync new data since last sync (background operation)
 */
export async function syncNewData(status: SyncStatus): Promise<boolean> {
  if (!HealthConnect.isHealthConnectAvailable()) return false;

  const lastStepsSync = status.lastSyncedStepsDate;
  const lastSleepSync = status.lastSyncedSleepDate;
  const lastSyncDate = lastStepsSync && lastSleepSync
    ? (lastStepsSync > lastSleepSync ? lastStepsSync : lastSleepSync)
    : (lastStepsSync || lastSleepSync || null);
  const { startDate, endDate, skipSync } = Storage.getSyncDateRange(lastSyncDate);

  if (skipSync) {
    return true;
  }

  try {
    const payload: SyncPayload = {};

    // Fetch steps if enabled
    if (status.stepSync) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const isSyncingToday = startDateOnly.getTime() === today.getTime() && status.lastSyncedStepsDate && Storage.isToday(status.lastSyncedStepsDate);
      
      if (isSyncingToday) {
        try {
          const healthConnectTodayTotal = await HealthConnect.getTodaySteps();
          const lastSyncedHealthKitValue = status.lastSyncedStepsValue ?? null;
          
          const difference = lastSyncedHealthKitValue !== null
            ? Math.max(0, healthConnectTodayTotal - lastSyncedHealthKitValue)
            : healthConnectTodayTotal;
          
          if (difference > 0) {
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            payload.steps = [{
              date: todayDate.toISOString(),
              value: difference,
              totalHealthKitValue: healthConnectTodayTotal
            }];
          }
        } catch (error) {
          const steps = await HealthConnect.getHistoricalSteps(startDate, endDate);
          if (steps.length > 0) {
            payload.steps = steps;
          }
        }
      } else {
        const steps = await HealthConnect.getHistoricalSteps(startDate, endDate);
        if (steps.length > 0) {
          payload.steps = steps;
        }
      }
    }

    // Fetch sleep if enabled
    if (status.sleepSync) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const isSyncingToday = startDateOnly.getTime() === today.getTime() && status.lastSyncedSleepDate && Storage.isToday(status.lastSyncedSleepDate);
      
      if (isSyncingToday) {
        try {
          const healthConnectTodayTotal = await HealthConnect.getTodaySleep();
          const lastSyncedHealthKitValue = status.lastSyncedSleepValue ?? null;
          
          const difference = lastSyncedHealthKitValue !== null
            ? Math.max(0, healthConnectTodayTotal - lastSyncedHealthKitValue)
            : healthConnectTodayTotal;
          
          if (difference > 0) {
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            payload.sleep = [{
              date: todayDate.toISOString(),
              value: difference,
              totalHealthKitValue: healthConnectTodayTotal
            }];
          }
        } catch (error) {
          const sleep = await HealthConnect.getHistoricalSleep(startDate, endDate);
          if (sleep.length > 0) {
            payload.sleep = sleep;
          }
        }
      } else {
        const sleep = await HealthConnect.getHistoricalSleep(startDate, endDate);
        if (sleep.length > 0) {
          payload.sleep = sleep;
        }
      }
    }

    if (!payload.steps && !payload.sleep) {
      return true;
    }

    const timezoneOffset = new Date().getTimezoneOffset();
    const response = await trackService.syncHealthData(payload, "android", timezoneOffset);

    if (response.success) {
      await Storage.clearPendingSync();
      return true;
    } else {
      console.error(`${LOG_PREFIX.BACKGROUND} Sync failed:`, response.message);
      await Storage.storePendingSync(payload, "android");
      return false;
    }
  } catch (error: any) {
    console.error(`${LOG_PREFIX.BACKGROUND} Error:`, error);
    return false;
  }
}

// ============================================
// Display Data
// ============================================

/**
 * Get combined display value (backend + today's Health Connect)
 */
export async function getDisplayValue(
  type: HealthDataType,
  backendValue: number,
  status: SyncStatus | null
): Promise<number> {
  if (!status) return backendValue;
  
  const isSyncEnabled = type === "steps" ? status.stepSync : status.sleepSync;
  if (!isSyncEnabled) return backendValue;

  const lastSyncDate = type === "steps" 
    ? status.lastSyncedStepsDate 
    : status.lastSyncedSleepDate;
  if (lastSyncDate && Storage.isToday(lastSyncDate)) {
    return backendValue;
  }

  try {
    const healthConnectValue = await HealthConnect.getTodayValue(type);
    const displayValue = backendValue + healthConnectValue;
    return displayValue;
  } catch (error) {
    console.error(`${LOG_PREFIX.SYNC} Error getting display value:`, error);
    return backendValue;
  }
}

