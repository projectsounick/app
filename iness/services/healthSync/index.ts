/**
 * Health Sync Module
 * Main entry point - exports all public APIs
 */

// Types
export * from "./types";

// Constants
export * from "./constants";

// Services (namespace exports for clean API)
export * as HealthKit from "./healthKitService";
export * as SyncManager from "./syncManager";
export * as SyncStorage from "./syncStorage";

// Direct exports for commonly used functions
export {
  isHealthKitAvailable,
  initializeHealthKit,
  getTodayValue,
  showPermissionDeniedAlert,
  showNoDataOrPermissionAlert,
  openHealthSettings,
  wasPermissionDenied,
  resetInitialization,
  checkPermissionsStatus,
} from "./healthKitService";

export {
  fetchSyncStatus,
  canSyncType,
  syncDataType,
  syncNewData,
  retryPendingSync,
  getDisplayValue,
} from "./syncManager";

export {
  storePendingSync,
  getPendingSync,
  clearPendingSync,
  shouldRetryPendingSync,
  getCurrentUserId,
  isToday,
  getSyncDateRange,
} from "./syncStorage";
