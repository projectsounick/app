/**
 * Health Sync Constants
 * Centralized configuration for Apple Health sync feature
 */

import { HealthSyncConfig } from "./types";

// ============================================
// Feature Configuration
// ============================================

export const HEALTH_SYNC_CONFIG: HealthSyncConfig = {
  historyDays: 30,           // Days of historical data to fetch on first sync
  retryDelayMs: 5 * 60 * 1000, // 5 minutes between retries
  maxRetryCount: 3,          // Max retry attempts for failed syncs
  initialSyncDelayMs: 2000,  // Delay before initial sync on app open
};

// ============================================
// Storage Keys
// ============================================

export const STORAGE_KEYS = {
  PENDING_SYNC: "health_sync_pending",
  LAST_SYNC_ATTEMPT: "health_sync_last_attempt",
  SYNC_STATUS_CACHE: "health_sync_status_cache",
  LAST_SYNCED_STEPS: "health_sync_last_steps_value",
  LAST_SYNCED_SLEEP: "health_sync_last_sleep_value",
} as const;

// ============================================
// HealthKit Permissions
// ============================================

export const HEALTHKIT_PERMISSIONS = {
  read: ["StepCount", "SleepAnalysis"],
  write: [],
} as const;

// ============================================
// Log Prefixes (for easier debugging)
// ============================================

export const LOG_PREFIX = {
  HEALTHKIT: "[HealthKit]",
  SYNC: "[HealthSync]",
  BACKGROUND: "[BackgroundSync]",
  STORAGE: "[SyncStorage]",
} as const;
