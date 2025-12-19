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
    console.log(`${LOG_PREFIX.STORAGE} Stored sync failure info (not data)`);
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
    console.log(`${LOG_PREFIX.STORAGE} Cleared pending sync`);
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
      lastSyncIOS: parsed.lastSyncIOS ? new Date(parsed.lastSyncIOS) : null,
      lastSyncAndroid: parsed.lastSyncAndroid ? new Date(parsed.lastSyncAndroid) : null,
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
 */
export function getSyncDateRange(lastSyncDate: Date | null): {
  startDate: Date;
  endDate: Date;
  skipSync: boolean;
} {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  // If already synced today, skip
  if (lastSyncDate && isToday(lastSyncDate)) {
    return { startDate: today, endDate, skipSync: true };
  }

  let startDate: Date;

  if (lastSyncDate) {
    // Start from day after last sync
    startDate = new Date(lastSyncDate);
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // First sync - get history
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - HEALTH_SYNC_CONFIG.historyDays);
    startDate.setHours(0, 0, 0, 0);
  }

  // Skip if start date is after end date
  const skipSync = startDate > endDate;

  return { startDate, endDate, skipSync };
}
