/**
 * Health Sync Module
 * Main entry point - exports all public APIs
 * Supports both iOS (Apple Health) and Android (Health Connect)
 */

// Types
export * from "./types";

// Constants
export * from "./constants";

// Services (namespace exports for clean API)
export * as HealthKit from "./healthKitService";
export * as HealthConnect from "./healthConnectService";
export * as SyncManager from "./syncManager";
export * as AndroidSyncManager from "./androidSyncManager";
export * as SyncStorage from "./syncStorage";

// iOS - Direct exports for commonly used functions
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

// Android - Direct exports for commonly used functions
export {
  isHealthConnectAvailable,
  initializeHealthConnect,
  showPermissionDeniedAlert as showHealthConnectPermissionDeniedAlert,
  showNoDataOrPermissionAlert as showHealthConnectNoDataOrPermissionAlert,
  showManualHealthConnectGuide,
  openHealthConnectSettings,
  wasPermissionDenied as wasHealthConnectPermissionDenied,
  resetInitialization as resetHealthConnectInitialization,
  checkPermissionsStatus as checkHealthConnectPermissionsStatus,
} from "./healthConnectService";

// iOS Sync Manager exports
export {
  fetchSyncStatus,
  canSyncType,
  syncDataType,
  syncNewData,
  retryPendingSync,
  getDisplayValue,
} from "./syncManager";

// Android Sync Manager exports
export {
  fetchAndroidSyncStatus,
  canSyncType as canSyncTypeAndroid,
  syncDataType as syncDataTypeAndroid,
  syncNewData as syncNewDataAndroid,
  getDisplayValue as getDisplayValueAndroid,
} from "./androidSyncManager";

export {
  storePendingSync,
  getPendingSync,
  clearPendingSync,
  shouldRetryPendingSync,
  getCurrentUserId,
  isToday,
  getSyncDateRange,
} from "./syncStorage";
