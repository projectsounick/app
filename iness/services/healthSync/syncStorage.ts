/**
 * Sync Storage Service
 * Handles AsyncStorage operations for health sync
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { PendingSyncData, SyncPayload, SyncPlatform, SyncStatus } from "./types";
import { STORAGE_KEYS, HEALTH_SYNC_CONFIG, LOG_PREFIX } from "./constants";

// ============================================
// Pending Sync Operations
// ============================================

/**
 * Store failure info (not data) for retry when sync fails
 * Just stores which type failed, we'll re-fetch from HealthKit on retry
 */
export async function storePendingSync(
  data: SyncPayload,
  platform: SyncPlatform
): Promise<void> {
  try {
    // Only store failure info: which types failed
    const failureInfo = {
      hasSteps: !!data.steps,
      hasSleep: !!data.sleep,
      platform,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(failureInfo));
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error storing pending sync:`, error);
  }
}

/**
 * Get pending sync data
 */
export async function getPendingSync(): Promise<PendingSyncData | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error getting pending sync:`, error);
    return null;
  }
}

/**
 * Clear pending sync data after successful sync
 */
export async function clearPendingSync(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error clearing pending sync:`, error);
  }
}

/**
 * Check if pending sync should be retried (simple: just check time)
 */
export function shouldRetryPendingSync(pendingSync: PendingSyncData): boolean {
  const timeSinceLastAttempt = Date.now() - pendingSync.timestamp;
  const fiveMinutes = 5 * 60 * 1000;
  return timeSinceLastAttempt >= fiveMinutes;
}

// ============================================
// Last Synced HealthKit Values
// ============================================

/**
 * Store the last HealthKit value we synced (for today)
 * This helps us calculate incremental changes even when manual entries exist
 */
export async function storeLastSyncedHealthKitValue(
  type: "steps" | "sleep",
  value: number
): Promise<void> {
  try {
    const key = type === "steps" 
      ? STORAGE_KEYS.LAST_SYNCED_STEPS 
      : STORAGE_KEYS.LAST_SYNCED_SLEEP;
    await AsyncStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error storing last synced value:`, error);
  }
}

/**
 * Get the last HealthKit value we synced (for today)
 */
export async function getLastSyncedHealthKitValue(
  type: "steps" | "sleep"
): Promise<number | null> {
  try {
    const key = type === "steps" 
      ? STORAGE_KEYS.LAST_SYNCED_STEPS 
      : STORAGE_KEYS.LAST_SYNCED_SLEEP;
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    // Check if it's from today (if not, return null)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const storedDate = new Date(parsed.timestamp);
    storedDate.setHours(0, 0, 0, 0);
    
    if (storedDate.getTime() === today.getTime()) {
      return parsed.value;
    }
    return null;
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error getting last synced value:`, error);
    return null;
  }
}

/**
 * Clear last synced values (called when a new day starts)
 */
export async function clearLastSyncedHealthKitValues(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNCED_STEPS);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNCED_SLEEP);
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error clearing last synced values:`, error);
  }
}

// ============================================
// Sync Status Cache
// ============================================

/**
 * Cache sync status locally for faster access
 */
export async function cacheSyncStatus(status: SyncStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATUS_CACHE, JSON.stringify(status));
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error caching sync status:`, error);
  }
}

/**
 * Get cached sync status
 */
export async function getCachedSyncStatus(): Promise<SyncStatus | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_STATUS_CACHE);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return {
      ...parsed,
      lastSyncedStepsDate: parsed.lastSyncedStepsDate ? new Date(parsed.lastSyncedStepsDate) : null,
      lastSyncedSleepDate: parsed.lastSyncedSleepDate ? new Date(parsed.lastSyncedSleepDate) : null,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error getting cached sync status:`, error);
    return null;
  }
}

// ============================================
// User Data
// ============================================

/**
 * Get current user ID from AsyncStorage
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const userStr = await AsyncStorage.getItem("user");
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user._id || null;
  } catch (error) {
    console.error(`${LOG_PREFIX.STORAGE} Error getting user ID:`, error);
    return null;
  }
}

// ============================================
// Date Utilities
// ============================================

/**
 * Check if a date is today
 */
export function isToday(date: Date | null): boolean {
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return today.getTime() === checkDate.getTime();
}

/**
 * Get date range for sync (from last sync or history days)
 * Always fetches from last sync time to now to catch new data
 */
export function getSyncDateRange(lastSyncDate: Date | null): {
  startDate: Date;
  endDate: Date;
  skipSync: boolean;
} {
  // Use local timezone for date calculations
  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = now.getMonth();
  const localDate = now.getDate();
  
  // End of today in local timezone (23:59:59.999)
  const endDate = new Date(localYear, localMonth, localDate, 23, 59, 59, 999);
  
  // Start of today in local timezone (00:00:00.000)
  const today = new Date(localYear, localMonth, localDate, 0, 0, 0, 0);

  let startDate: Date;

  if (lastSyncDate) {
    // If synced today, fetch from LAST SYNC TIME to now (not from start of today)
    // This prevents re-syncing the same data and adding it multiple times
    if (isToday(lastSyncDate)) {
      // Use last sync time as start to only get NEW data since last sync
      startDate = new Date(lastSyncDate);
      // Ensure we don't go before today (safety check)
      if (startDate < today) {
        startDate = new Date(today);
      }
    } else {
      // Last sync was before today - start from day after last sync
      // Convert lastSyncDate to local date and add 1 day
      const lastSyncLocal = new Date(lastSyncDate);
      const lastSyncYear = lastSyncLocal.getFullYear();
      const lastSyncMonth = lastSyncLocal.getMonth();
      const lastSyncDay = lastSyncLocal.getDate();
      
      startDate = new Date(lastSyncYear, lastSyncMonth, lastSyncDay + 1, 0, 0, 0, 0);
    }
  } else {
    // First sync - get history (30 days back from today in local timezone)
    startDate = new Date(localYear, localMonth, localDate - HEALTH_SYNC_CONFIG.historyDays, 0, 0, 0, 0);
  }

  // Skip if start date is after end date (shouldn't happen, but safety check)
  const skipSync = startDate > endDate;

  return { startDate, endDate, skipSync };
}
