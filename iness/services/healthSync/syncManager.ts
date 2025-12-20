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

// ============================================
// Sync Status
// ============================================

/**
 * Fetch sync status from backend
 */
export async function fetchSyncStatus(): Promise<SyncStatus | null> {
  try {
    const response = await trackService.getHealthSyncStatus();

    if (response.success && response.data) {
      const status: SyncStatus = {
        stepSync: response.data.stepSync || false,
        sleepSync: response.data.sleepSync || false,
        lastSyncedStepsValue: response.data.lastSyncedStepsValue ?? null,
        lastSyncedStepsDate: response.data.lastSyncedStepsDate
          ? new Date(response.data.lastSyncedStepsDate)
          : null,
        lastSyncedSleepValue: response.data.lastSyncedSleepValue ?? null,
        lastSyncedSleepDate: response.data.lastSyncedSleepDate
          ? new Date(response.data.lastSyncedSleepDate)
          : null,
      };

      // Cache for offline access
      await Storage.cacheSyncStatus(status);
      return status;
    }

    return null;
  } catch (error) {
    console.error(`${LOG_PREFIX.SYNC} Error fetching status:`, error);
    // Try to return cached status
    return await Storage.getCachedSyncStatus();
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
    // Initialize HealthKit - this shows the permission modal
    const initialized = await HealthKit.initializeHealthKit();
    
    if (!initialized) {
      return { success: false, value: 0, error: "HealthKit permissions not granted. Please enable in Settings." };
    }

    // Get date range (use steps sync date for steps, sleep sync date for sleep)
    const lastSyncDate = type === "steps" 
      ? (status?.lastSyncedStepsDate || null)
      : (status?.lastSyncedSleepDate || null);
    const { startDate, endDate } = Storage.getSyncDateRange(lastSyncDate);

    // Fetch historical data
    const data = await HealthKit.getHistoricalData(type, startDate, endDate);

    if (data.length === 0) {
      // If this is the first sync attempt and we got no data, 
      // user might have denied permissions
      const lastSyncDate = type === "steps" 
        ? (status?.lastSyncedStepsDate || null)
        : (status?.lastSyncedSleepDate || null);
      const isFirstSync = !lastSyncDate;
      
      if (isFirstSync) {
        // Show alert with option to check settings
        HealthKit.showNoDataOrPermissionAlert(type);
      }
      
      return {
        success: false,
        value: 0,
        error: `No ${type} data found in Apple Health`,
      };
    }

    // Find today's value IMMEDIATELY for UI update
    const todayEntry = data.find((entry) => {
      const entryDate = new Date(entry.date);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    });
    const todayValue = todayEntry?.value || 0;

    // Prepare payload
    const payload: SyncPayload = {};
    if (type === "steps") {
      payload.steps = data;
    } else if (type === "sleep") {
      payload.sleep = data;
    }

    // Return success IMMEDIATELY with today's value
    // Backend sync happens in background (fire-and-forget)
    // Sync to backend IN BACKGROUND (fire-and-forget, non-blocking)
    syncToBackendInBackground(payload, platform, data.length);

    return {
      success: true,
      value: todayValue,
      syncedCount: data.length,
      allData: data, // Return all data for store update
    };
  } catch (error: any) {
    console.error(`${LOG_PREFIX.SYNC} EXCEPTION in syncDataType:`, error);
    console.error(`${LOG_PREFIX.SYNC} Error message:`, error?.message);
    console.error(`${LOG_PREFIX.SYNC} Error stack:`, error?.stack);
    return { success: false, value: 0, error: error.message };
  }
}

/**
 * Sync to backend in background (truly fire-and-forget, non-blocking)
 */
function syncToBackendInBackground(
  payload: SyncPayload,
  platform: SyncPlatform,
  entryCount: number
): void {
  // Fire and forget - don't await anything
  Promise.resolve().then(async () => {
    try {
      const response = await trackService.syncHealthData(payload, platform);
      
      if (response.success) {
        await Storage.clearPendingSync();
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

    // Sync to backend
    const response = await trackService.syncHealthData(payload, "ios");

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
