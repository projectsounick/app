/**
 * Sync Manager
 * Business logic for syncing health data to backend
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
import * as HealthKit from "./healthKitService";
import * as Storage from "./syncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================
// Sync Status
// ============================================

/**
 * Fetch sync status from AsyncStorage user data
 */
export async function fetchSyncStatus(): Promise<SyncStatus | null> {
  try {
    // Get user data from AsyncStorage
    const userDataStr = await AsyncStorage.getItem("user");

    if (!userDataStr) {
      return null;
    }
    
    const userData = JSON.parse(userDataStr);
    const healthSync = userData.healthSync;
 
    if (!healthSync) {
      // No healthSync data, return default
      return {
        stepSync: false,
        sleepSync: false,
        syncModalShown: false,
      };
    }
    
    const status: SyncStatus = {
      stepSync: healthSync.stepSync || false,
      sleepSync: healthSync.sleepSync || false,
      syncModalShown: healthSync.syncModalShown ?? false,
      lastSyncedStepsValue: healthSync.lastSyncedStepsValue ?? null,
      lastSyncedStepsDate: healthSync.lastSyncedStepsDate
        ? new Date(healthSync.lastSyncedStepsDate)
        : null,
      lastSyncedSleepValue: healthSync.lastSyncedSleepValue ?? null,
      lastSyncedSleepDate: healthSync.lastSyncedSleepDate
        ? new Date(healthSync.lastSyncedSleepDate)
        : null,
    };

    return status;
  } catch (error) {
    console.error(`${LOG_PREFIX.SYNC} Error fetching status from AsyncStorage:`, error);
    return null;
  }
}

/**
 * Check if sync is allowed for a specific type
 */
export function canSyncType(type: HealthDataType, status: SyncStatus | null): boolean {
  if (!HealthKit.isHealthKitAvailable()) return false;
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
 * Sync a specific data type from Apple Health
 * Used when user first enables sync
 */
export async function syncDataType(
  type: HealthDataType,
  status: SyncStatus | null,
  platform: SyncPlatform = "ios"
): Promise<SyncResult> {
  if (!HealthKit.isHealthKitAvailable()) {
    return { success: false, value: 0, error: "HealthKit not available" };
  }

  try {
    // Check AsyncStorage first to prevent duplicate syncs on page refresh
    // Use AsyncStorage as source of truth for lastSyncDate to ensure we don't sync duplicate data
    const userDataStr = await AsyncStorage.getItem("user");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      const healthSync = userData.healthSync;
      
      if (healthSync) {
        // Always use the stored lastSyncDate from AsyncStorage if available (more reliable than status param)
        const storedLastSyncDate = type === "steps"
          ? (healthSync.lastSyncedStepsDate ? new Date(healthSync.lastSyncedStepsDate) : null)
          : (healthSync.lastSyncedSleepDate ? new Date(healthSync.lastSyncedSleepDate) : null);
        
        // Override status with stored date from AsyncStorage to ensure accurate sync range
        if (storedLastSyncDate) {
          if (!status) {
            // Create status object if it doesn't exist
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

    // Initialize HealthKit - this shows the permission modal
    const initialized = await HealthKit.initializeHealthKit();
    
    if (!initialized) {
      return { success: false, value: 0, error: "HealthKit permissions not granted. Please enable in Settings." };
    }

    // Get date range (use steps sync date for steps, sleep sync date for sleep)
    const lastSyncDate = type === "steps" 
      ? (status?.lastSyncedStepsDate || null)
      : (status?.lastSyncedSleepDate || null);
    const { startDate, endDate, skipSync } = Storage.getSyncDateRange(lastSyncDate);
    
    // Skip sync if no new data to sync
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
    // This gives instant feedback to the user
    let todayValue = 0;
    try {
      todayValue = await HealthKit.getTodayValue(type);
      console.log(`${LOG_PREFIX.SYNC} Today's ${type} value: ${todayValue}`);
    } catch (error) {
      console.error(`${LOG_PREFIX.SYNC} Error getting today's ${type}:`, error);
      // Continue even if today's value fetch fails
    }

    // STEP 2: Return success IMMEDIATELY with today's value for UI update
    // This unblocks the UI immediately
    
    // STEP 3: Fetch historical data in BACKGROUND (deferred, non-blocking)
    // Use setTimeout to defer the heavy work to the next event loop tick
    setTimeout(async () => {
      try {
        // Defer heavy HealthKit calls to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`${LOG_PREFIX.SYNC} Starting background historical data fetch for ${type}...`);
        const data = await HealthKit.getHistoricalData(type, startDate, endDate);

        if (data.length === 0) {
          // If this is the first sync attempt and we got no data, 
          // user might have denied permissions
          const isFirstSync = !lastSyncDate;
          
          if (isFirstSync) {
            // Show alert with option to check settings
            HealthKit.showNoDataOrPermissionAlert(type);
          }
          
          console.log(`${LOG_PREFIX.SYNC} No historical ${type} data found`);
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
    
    // Return immediately with today's value - UI is now unblocked
    return {
      success: true,
      value: todayValue,
      syncedCount: 1, // Today's entry (historical data synced in background)
      allData: todayValue > 0 ? [{
        date: today.toISOString(),
        value: todayValue,
      }] : [], // Return today's entry for immediate store update (only if > 0)
    };
  } catch (error: any) {
    console.error(`${LOG_PREFIX.SYNC} EXCEPTION in syncDataType:`, error);
    console.error(`${LOG_PREFIX.SYNC} Error message:`, error?.message);
    console.error(`${LOG_PREFIX.SYNC} Error stack:`, error?.stack);
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
  // Fire and forget - don't await anything
  Promise.resolve().then(async () => {
    try {
      const response = await trackService.syncHealthData(payload, platform, timezoneOffset);
      
      if (response.success) {
        await Storage.clearPendingSync();
        
        // Update AsyncStorage user data with sync status
        // Backend has set syncModalShown and sync flags to true
        try {
          const userDataStr = await AsyncStorage.getItem("user");
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            
            // Update healthSync in user data
            if (!userData.healthSync) {
              userData.healthSync = {};
            }
            
            const now = new Date();
            
            // Set sync flags and lastSyncDate based on what was synced
            if (payload.steps) {
              userData.healthSync.stepSync = true;
              userData.healthSync.syncModalShown = true;
              userData.healthSync.lastSyncedStepsDate = now.toISOString();
              // Find today's steps value from payload
              const todaySteps = payload.steps.find((entry) => {
                const entryDate = new Date(entry.date);
                const today = new Date();
                return entryDate.toDateString() === today.toDateString();
              });
              if (todaySteps) {
                userData.healthSync.lastSyncedStepsValue = todaySteps.value;
              }
            }
            if (payload.sleep) {
              userData.healthSync.sleepSync = true;
              userData.healthSync.syncModalShown = true;
              userData.healthSync.lastSyncedSleepDate = now.toISOString();
              // Find today's sleep value from payload
              const todaySleep = payload.sleep.find((entry) => {
                const entryDate = new Date(entry.date);
                const today = new Date();
                return entryDate.toDateString() === today.toDateString();
              });
              if (todaySleep) {
                userData.healthSync.lastSyncedSleepValue = todaySleep.value;
              }
            }
            
            // Save updated user data back to AsyncStorage
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            console.log(`${LOG_PREFIX.BACKGROUND} Updated AsyncStorage user data with sync status and lastSyncDate`);
          }
        } catch (updateError) {
          console.error(`${LOG_PREFIX.BACKGROUND} Error updating AsyncStorage:`, updateError);
          // Don't fail the sync if AsyncStorage update fails
        }
      } else {
        console.error(`${LOG_PREFIX.BACKGROUND} Backend sync failed:`, response.message);
        // Store failure info (not data) for retry later
        await Storage.storePendingSync(payload, platform);
      }
    } catch (error: any) {
      console.error(`${LOG_PREFIX.BACKGROUND} Backend sync error:`, error?.message);
      console.error(`${LOG_PREFIX.BACKGROUND} Error stack:`, error?.stack);
      // Store failure info (not data) for retry later
      await Storage.storePendingSync(payload, platform);
    }
  }).catch((err) => {
    console.error(`${LOG_PREFIX.BACKGROUND} Promise rejection (should not happen):`, err);
    // Silently ignore - this is fire and forget
  });
}

// ============================================
// Background Sync
// ============================================

/**
 * Sync new data since last sync (background operation)
 */
export async function syncNewData(status: SyncStatus): Promise<boolean> {
  if (!HealthKit.isHealthKitAvailable()) return false;

  // Check date range - will fetch from last sync time to now
  // Use the most recent of steps or sleep sync dates
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
      // Check if we're syncing today (already synced today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const isSyncingToday = startDateOnly.getTime() === today.getTime() && status.lastSyncedStepsDate && Storage.isToday(status.lastSyncedStepsDate);
      
      if (isSyncingToday) {
        // We've already synced today - compare current HealthKit total with last synced value from MongoDB
        // This works even when manual entries exist in backend because we track HealthKit values separately
        try {
          // Get today's current total from HealthKit
          const healthKitTodayTotal = await HealthKit.getTodaySteps();
          
          // Get the last HealthKit value we synced (from MongoDB, for today)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const lastSyncedDate = status.lastSyncedStepsDate 
            ? new Date(status.lastSyncedStepsDate)
            : null;
          const lastSyncedDateOnly = lastSyncedDate ? new Date(lastSyncedDate) : null;
          if (lastSyncedDateOnly) {
            lastSyncedDateOnly.setHours(0, 0, 0, 0);
          }
          
          const isLastSyncedToday = lastSyncedDateOnly && 
            lastSyncedDateOnly.getTime() === today.getTime();
          
          const lastSyncedHealthKitValue = isLastSyncedToday 
            ? (status.lastSyncedStepsValue ?? null)
            : null;
          
          // Calculate difference from last synced HealthKit value (not backend total)
          const difference = lastSyncedHealthKitValue !== null
            ? Math.max(0, healthKitTodayTotal - lastSyncedHealthKitValue)
            : healthKitTodayTotal; // If no previous value, use current total
          
          if (difference > 0) {
            // Only send the incremental difference, but include total HealthKit value for backend
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            payload.steps = [{
              date: todayDate.toISOString(),
              value: difference,
              totalHealthKitValue: healthKitTodayTotal // Send total so backend can store it correctly
            }];
            
            console.log(`[DEBUG] Syncing incremental steps - HealthKit: ${healthKitTodayTotal}, Last synced (MongoDB): ${lastSyncedHealthKitValue}, Difference: ${difference}`);
          } else {
            console.log(`[DEBUG] No new steps since last sync (HealthKit: ${healthKitTodayTotal}, Last synced (MongoDB): ${lastSyncedHealthKitValue})`);
          }
        } catch (error) {
          // Fallback to normal sync if comparison fails
          console.error(`[DEBUG] Error comparing today's steps, using normal sync:`, error);
          const steps = await HealthKit.getHistoricalSteps(startDate, endDate);
          if (steps.length > 0) {
            payload.steps = steps;
          }
        }
      } else {
        // Normal sync (not today or first sync today)
        const steps = await HealthKit.getHistoricalSteps(startDate, endDate);
        if (steps.length > 0) {
          payload.steps = steps;
        }
      }
    }

    // Fetch sleep if enabled
    if (status.sleepSync) {
      // Check if we're syncing today (already synced today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const isSyncingToday = startDateOnly.getTime() === today.getTime() && status.lastSyncedSleepDate && Storage.isToday(status.lastSyncedSleepDate);
      
      if (isSyncingToday) {
        // We've already synced today - compare current HealthKit total with last synced value from MongoDB
        // This works even when manual entries exist in backend because we track HealthKit values separately
        try {
          // Get today's current total from HealthKit
          const healthKitTodayTotal = await HealthKit.getTodaySleep();
          
          // Get the last HealthKit value we synced (from MongoDB, for today)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const lastSyncedDate = status.lastSyncedSleepDate 
            ? new Date(status.lastSyncedSleepDate)
            : null;
          const lastSyncedDateOnly = lastSyncedDate ? new Date(lastSyncedDate) : null;
          if (lastSyncedDateOnly) {
            lastSyncedDateOnly.setHours(0, 0, 0, 0);
          }
          
          const isLastSyncedToday = lastSyncedDateOnly && 
            lastSyncedDateOnly.getTime() === today.getTime();
          
          const lastSyncedHealthKitValue = isLastSyncedToday 
            ? (status.lastSyncedSleepValue ?? null)
            : null;
          
          // Calculate difference from last synced HealthKit value (not backend total)
          const difference = lastSyncedHealthKitValue !== null
            ? Math.max(0, healthKitTodayTotal - lastSyncedHealthKitValue)
            : healthKitTodayTotal; // If no previous value, use current total
          
          if (difference > 0) {
            // Only send the incremental difference, but include total HealthKit value for backend
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            payload.sleep = [{
              date: todayDate.toISOString(),
              value: difference,
              totalHealthKitValue: healthKitTodayTotal // Send total so backend can store it correctly
            }];
            
            console.log(`[DEBUG] Syncing incremental sleep - HealthKit: ${healthKitTodayTotal.toFixed(2)}h, Last synced (MongoDB): ${lastSyncedHealthKitValue?.toFixed(2) || 'null'}h, Difference: ${difference.toFixed(2)}h`);
          } else {
            console.log(`[DEBUG] No new sleep since last sync (HealthKit: ${healthKitTodayTotal.toFixed(2)}h, Last synced (MongoDB): ${lastSyncedHealthKitValue?.toFixed(2) || 'null'}h)`);
          }
        } catch (error) {
          // Fallback to normal sync if comparison fails
          console.error(`[DEBUG] Error comparing today's sleep, using normal sync:`, error);
          const sleep = await HealthKit.getHistoricalSleep(startDate, endDate);
          if (sleep.length > 0) {
            payload.sleep = sleep;
          }
        }
      } else {
        // Normal sync (not today or first sync today)
        const sleep = await HealthKit.getHistoricalSleep(startDate, endDate);
        if (sleep.length > 0) {
          payload.sleep = sleep;
        }
      }
    }

    // Nothing to sync
    if (!payload.steps && !payload.sleep) {
      return true;
    }

    // Get timezone offset in minutes (e.g., -300 for EST, +330 for IST)
    const timezoneOffset = new Date().getTimezoneOffset();
    
    // Sync to backend
    const response = await trackService.syncHealthData(payload, "ios", timezoneOffset);

    if (response.success) {
      await Storage.clearPendingSync();
      return true;
    } else {
      console.error(`${LOG_PREFIX.BACKGROUND} Sync failed:`, response.message);
      await Storage.storePendingSync(payload, "ios");
      return false;
    }
  } catch (error: any) {
    console.error(`${LOG_PREFIX.BACKGROUND} Error:`, error);
    return false;
  }
}

/**
 * Retry any pending syncs
 * Re-fetches from HealthKit (we don't store data, only failure info)
 */
export async function retryPendingSync(status: SyncStatus | null): Promise<boolean> {
  const pendingSync = await Storage.getPendingSync();
  if (!pendingSync) return true; // Nothing to retry

  // Simple retry check - just wait 5 minutes or next app open
  const timeSinceFailure = Date.now() - pendingSync.timestamp;
  const fiveMinutes = 5 * 60 * 1000;
  if (timeSinceFailure < fiveMinutes) {
    return false;
  }

  if (!HealthKit.isHealthKitAvailable()) {
    return false;
  }

  try {
    const initialized = await HealthKit.initializeHealthKit();
    if (!initialized) {
      return false;
    }

    const payload: SyncPayload = {};
    // Use the most recent of steps or sleep sync dates
    const lastStepsSync = status?.lastSyncedStepsDate;
    const lastSleepSync = status?.lastSyncedSleepDate;
    const lastSyncDate = lastStepsSync && lastSleepSync
      ? (lastStepsSync > lastSleepSync ? lastStepsSync : lastSleepSync)
      : (lastStepsSync || lastSleepSync || null);
    const { startDate, endDate } = Storage.getSyncDateRange(lastSyncDate);

    // Re-fetch from HealthKit based on failure flags
    if (pendingSync.hasSteps) {
      const steps = await HealthKit.getHistoricalSteps(startDate, endDate);
      if (steps.length > 0) {
        payload.steps = steps;
      }
    }

    if (pendingSync.hasSleep) {
      const sleep = await HealthKit.getHistoricalSleep(startDate, endDate);
      if (sleep.length > 0) {
        payload.sleep = sleep;
      }
    }

    if (!payload.steps && !payload.sleep) {
      await Storage.clearPendingSync();
      return true;
    }

    // Try to sync again
    const response = await trackService.syncHealthData(payload, pendingSync.platform);

    if (response.success) {
      await Storage.clearPendingSync();
      return true;
    } else {
      // Update timestamp for next retry
      await Storage.storePendingSync(payload, pendingSync.platform);
      return false;
    }
  } catch (error: any) {
    console.error(`${LOG_PREFIX.BACKGROUND} Retry error:`, error);
    return false;
  }
}

// ============================================
// Display Data
// ============================================

/**
 * Get combined display value (backend + today's Apple Health)
 */
export async function getDisplayValue(
  type: HealthDataType,
  backendValue: number,
  status: SyncStatus | null
): Promise<number> {
  // If sync not enabled for this type, just return backend value
  if (!status) return backendValue;
  
  const isSyncEnabled = type === "steps" ? status.stepSync : status.sleepSync;
  if (!isSyncEnabled) return backendValue;

  // If already synced today, backend value already includes health data
  const lastSyncDate = type === "steps" 
    ? status.lastSyncedStepsDate 
    : status.lastSyncedSleepDate;
  if (lastSyncDate && Storage.isToday(lastSyncDate)) {
    return backendValue;
  }

  // Get today's value from Apple Health and add to backend
  try {
    const appleValue = await HealthKit.getTodayValue(type);
    const displayValue = backendValue + appleValue;
    return displayValue;
  } catch (error) {
    console.error(`${LOG_PREFIX.SYNC} Error getting display value:`, error);
    return backendValue;
  }
}
