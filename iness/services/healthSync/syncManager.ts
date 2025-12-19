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
    console.log(`${LOG_PREFIX.SYNC} Fetching sync status...`);
    const response = await trackService.getHealthSyncStatus();

    if (response.success && response.data) {
      const status: SyncStatus = {
        stepSync: response.data.stepSync || false,
        sleepSync: response.data.sleepSync || false,
        lastSyncIOS: response.data.lastSyncIOS
          ? new Date(response.data.lastSyncIOS)
          : null,
        lastSyncAndroid: response.data.lastSyncAndroid
          ? new Date(response.data.lastSyncAndroid)
          : null,
      };

      // Cache for offline access
      await Storage.cacheSyncStatus(status);
      console.log(`${LOG_PREFIX.SYNC} Status:`, status);
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
  console.log("========== [SyncManager] syncDataType START ==========");
  console.log(`${LOG_PREFIX.SYNC} Type: ${type}, Platform: ${platform}`);
  console.log(`${LOG_PREFIX.SYNC} Timestamp:`, new Date().toISOString());
  console.log(`${LOG_PREFIX.SYNC} Status:`, JSON.stringify(status));
  
  if (!HealthKit.isHealthKitAvailable()) {
    console.log(`${LOG_PREFIX.SYNC} HealthKit not available, returning`);
    return { success: false, value: 0, error: "HealthKit not available" };
  }

  console.log(`${LOG_PREFIX.SYNC} Starting ${type} sync...`);

  try {
    // Initialize HealthKit - this shows the permission modal
    console.log(`${LOG_PREFIX.SYNC} Step 1: Calling HealthKit.initializeHealthKit...`);
    const initStartTime = Date.now();
    const initialized = await HealthKit.initializeHealthKit();
    const initDuration = Date.now() - initStartTime;
    console.log(`${LOG_PREFIX.SYNC} HealthKit initialized: ${initialized} (took ${initDuration}ms)`);
    
    if (!initialized) {
      console.log(`${LOG_PREFIX.SYNC} HealthKit initialization failed - permissions may have been denied`);
      return { success: false, value: 0, error: "HealthKit permissions not granted. Please enable in Settings." };
    }

    // Get date range (use iOS sync date for iOS platform)
    console.log(`${LOG_PREFIX.SYNC} Step 2: Getting date range...`);
    const { startDate, endDate } = Storage.getSyncDateRange(status?.lastSyncIOS || null);
    console.log(`${LOG_PREFIX.SYNC} Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch historical data
    console.log(`${LOG_PREFIX.SYNC} Step 3: Fetching historical data from HealthKit...`);
    const fetchStartTime = Date.now();
    const data = await HealthKit.getHistoricalData(type, startDate, endDate);
    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`${LOG_PREFIX.SYNC} Fetched ${data.length} entries (took ${fetchDuration}ms)`);

    if (data.length === 0) {
      // If this is the first sync attempt and we got no data, 
      // user might have denied permissions
      const isFirstSync = !status?.lastSyncIOS;
      
      if (isFirstSync) {
        console.log(`${LOG_PREFIX.SYNC} No data on first sync - might be permission issue`);
        // Show alert with option to check settings
        HealthKit.showNoDataOrPermissionAlert(type);
      }
      
      console.log(`${LOG_PREFIX.SYNC} No data found, returning failure`);
      return {
        success: false,
        value: 0,
        error: `No ${type} data found in Apple Health`,
      };
    }

    console.log(`${LOG_PREFIX.SYNC} Step 4: Finding today's value...`);
    // Find today's value IMMEDIATELY for UI update
    const todayEntry = data.find((entry) => {
      const entryDate = new Date(entry.date);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    });
    const todayValue = todayEntry?.value || 0;
    console.log(`${LOG_PREFIX.SYNC} Today's ${type} value: ${todayValue}`);

    // Prepare payload
    console.log(`${LOG_PREFIX.SYNC} Step 5: Preparing payload...`);
    const payload: SyncPayload = {};
    if (type === "steps") {
      payload.steps = data;
    } else if (type === "sleep") {
      payload.sleep = data;
    }
    console.log(`${LOG_PREFIX.SYNC} Payload prepared: ${type} with ${data.length} entries`);

    // Return success IMMEDIATELY with today's value
    // Backend sync happens in background (fire-and-forget)
    console.log(`${LOG_PREFIX.SYNC} Step 6: Returning success immediately with today's value: ${todayValue}`);
    console.log(`${LOG_PREFIX.SYNC} Starting background sync (fire-and-forget)...`);
    
    // Sync to backend IN BACKGROUND (fire-and-forget, non-blocking)
    syncToBackendInBackground(payload, platform, data.length);
    console.log(`${LOG_PREFIX.SYNC} Background sync started (non-blocking)`);

    console.log("========== [SyncManager] syncDataType END (success) ==========");
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
    console.log("========== [SyncManager] syncDataType END (error) ==========");
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
  console.log("========== [SyncManager] syncToBackendInBackground START ==========");
  console.log(`${LOG_PREFIX.BACKGROUND} Entry count: ${entryCount}, Platform: ${platform}`);
  console.log(`${LOG_PREFIX.BACKGROUND} Timestamp:`, new Date().toISOString());
  console.log(`${LOG_PREFIX.BACKGROUND} Has steps: ${!!payload.steps}, Has sleep: ${!!payload.sleep}`);
  
  // Fire and forget - don't await anything
  Promise.resolve().then(async () => {
    console.log(`${LOG_PREFIX.BACKGROUND} Background sync promise started`);
    console.log(`${LOG_PREFIX.BACKGROUND} About to call trackService.syncHealthData...`);
    const startTime = Date.now();
    
    try {
      const response = await trackService.syncHealthData(payload, platform);
      const duration = Date.now() - startTime;
      console.log(`${LOG_PREFIX.BACKGROUND} Backend call completed in ${duration}ms`);
      console.log(`${LOG_PREFIX.BACKGROUND} Response success:`, response.success);
      
      if (response.success) {
        console.log(`${LOG_PREFIX.BACKGROUND} Backend sync successful`);
        await Storage.clearPendingSync();
        console.log(`${LOG_PREFIX.BACKGROUND} Cleared pending sync`);
      } else {
        console.error(`${LOG_PREFIX.BACKGROUND} Backend sync failed:`, response.message);
        // Store failure info (not data) for retry later
        console.log(`${LOG_PREFIX.BACKGROUND} Storing failure info for retry...`);
        await Storage.storePendingSync(payload, platform);
        console.log(`${LOG_PREFIX.BACKGROUND} Failure info stored`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`${LOG_PREFIX.BACKGROUND} Backend sync error after ${duration}ms:`, error?.message);
      console.error(`${LOG_PREFIX.BACKGROUND} Error stack:`, error?.stack);
      // Store failure info (not data) for retry later
      console.log(`${LOG_PREFIX.BACKGROUND} Storing failure info for retry...`);
      await Storage.storePendingSync(payload, platform);
      console.log(`${LOG_PREFIX.BACKGROUND} Failure info stored`);
    }
    
    console.log("========== [SyncManager] syncToBackendInBackground END ==========");
  }).catch((err) => {
    console.error(`${LOG_PREFIX.BACKGROUND} Promise rejection (should not happen):`, err);
    // Silently ignore - this is fire and forget
  });
  
  console.log(`${LOG_PREFIX.BACKGROUND} Function returned immediately (non-blocking)`);
}

// ============================================
// Background Sync
// ============================================

/**
 * Sync new data since last sync (background operation)
 */
export async function syncNewData(status: SyncStatus): Promise<boolean> {
  if (!HealthKit.isHealthKitAvailable()) return false;

  // Check date range
  const { startDate, endDate, skipSync } = Storage.getSyncDateRange(status.lastSyncIOS);

  if (skipSync) {
    console.log(`${LOG_PREFIX.BACKGROUND} Already synced today or no new data`);
    return true;
  }

  console.log(
    `${LOG_PREFIX.BACKGROUND} Syncing from ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  try {
    const payload: SyncPayload = {};

    // Fetch steps if enabled
    if (status.stepSync) {
      const steps = await HealthKit.getHistoricalSteps(startDate, endDate);
      if (steps.length > 0) {
        payload.steps = steps;
        console.log(`${LOG_PREFIX.BACKGROUND} Found ${steps.length} step entries`);
      }
    }

    // Fetch sleep if enabled
    if (status.sleepSync) {
      const sleep = await HealthKit.getHistoricalSleep(startDate, endDate);
      if (sleep.length > 0) {
        payload.sleep = sleep;
        console.log(`${LOG_PREFIX.BACKGROUND} Found ${sleep.length} sleep entries`);
      }
    }

    // Nothing to sync
    if (!payload.steps && !payload.sleep) {
      console.log(`${LOG_PREFIX.BACKGROUND} No new data to sync`);
      return true;
    }

    // Sync to backend
    const response = await trackService.syncHealthData(payload, "ios");

    if (response.success) {
      console.log(`${LOG_PREFIX.BACKGROUND} Sync successful`);
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
    console.log(`${LOG_PREFIX.BACKGROUND} Pending sync not ready for retry yet`);
    return false;
  }

  console.log(`${LOG_PREFIX.BACKGROUND} Retrying pending sync by re-fetching from HealthKit...`);

  if (!HealthKit.isHealthKitAvailable()) {
    console.log(`${LOG_PREFIX.BACKGROUND} HealthKit not available for retry`);
    return false;
  }

  try {
    const initialized = await HealthKit.initializeHealthKit();
    if (!initialized) {
      console.log(`${LOG_PREFIX.BACKGROUND} HealthKit not initialized for retry`);
      return false;
    }

    const payload: SyncPayload = {};
    const { startDate, endDate } = Storage.getSyncDateRange(status?.lastSyncIOS || null);

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
      console.log(`${LOG_PREFIX.BACKGROUND} No data to retry`);
      await Storage.clearPendingSync();
      return true;
    }

    // Try to sync again
    const response = await trackService.syncHealthData(payload, pendingSync.platform);

    if (response.success) {
      console.log(`${LOG_PREFIX.BACKGROUND} Pending sync successful`);
      await Storage.clearPendingSync();
      return true;
    } else {
      console.log(`${LOG_PREFIX.BACKGROUND} Pending sync failed again, will retry later`);
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
  if (Storage.isToday(status.lastSyncIOS)) {
    return backendValue;
  }

  // Get today's value from Apple Health and add to backend
  try {
    const appleValue = await HealthKit.getTodayValue(type);
    const displayValue = backendValue + appleValue;
    
    console.log(
      `${LOG_PREFIX.SYNC} Display ${type}: backend=${backendValue}, apple=${appleValue}, display=${displayValue}`
    );
    
    return displayValue;
  } catch (error) {
    console.error(`${LOG_PREFIX.SYNC} Error getting display value:`, error);
    return backendValue;
  }
}
