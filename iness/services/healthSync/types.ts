/**
 * Health Sync Types and Interfaces
 * Centralized type definitions for Apple Health sync feature
 */

// ============================================
// Core Types
// ============================================

export type HealthDataType = "steps" | "sleep";
export type SyncPlatform = "ios" | "android";

// ============================================
// Data Interfaces
// ============================================

export interface HealthDataEntry {
  date: string;
  value: number;
  totalHealthKitValue?: number; // Optional: total HealthKit value for this date (for backend to store correctly)
}

export interface SyncPayload {
  steps?: HealthDataEntry[];
  sleep?: HealthDataEntry[];
}

export interface SyncStatus {
  stepSync: boolean;
  sleepSync: boolean;
  lastSyncedStepsValue?: number | null;
  lastSyncedStepsDate?: Date | null; // Also serves as lastSyncIOS equivalent
  lastSyncedSleepValue?: number | null;
  lastSyncedSleepDate?: Date | null; // Also serves as lastSyncAndroid equivalent
}

export interface SyncResult {
  success: boolean;
  value: number;
  syncedCount?: number;
  error?: string;
  allData?: HealthDataEntry[]; // All synced data for immediate store update
}

// ============================================
// Storage Interfaces
// ============================================

export interface PendingSyncData {
  hasSteps: boolean;
  hasSleep: boolean;
  platform: SyncPlatform;
  timestamp: number;
  retryCount?: number; // Optional for backward compatibility
}

// ============================================
// API Response Interfaces
// ============================================

export interface HealthSyncApiResponse {
  success: boolean;
  message?: string;
  data?: {
    stepsCount?: number;
    sleepCount?: number;
    stepSync?: boolean;
    sleepSync?: boolean;
    lastSyncedStepsValue?: number | null;
    lastSyncedStepsDate?: string | null;
    lastSyncedSleepValue?: number | null;
    lastSyncedSleepDate?: string | null;
  };
  error?: string;
}

// ============================================
// Hook Return Types
// ============================================

export interface UseHealthSyncReturn {
  // State
  isAvailable: boolean;
  isSyncing: boolean;
  syncStatus: SyncStatus | null;
  isInitialized: boolean;
  
  // Actions
  canSync: (type: HealthDataType) => boolean;
  syncData: (type: HealthDataType) => Promise<SyncResult>;
  refreshSyncStatus: () => Promise<void>;
  getTodayValue: (type: HealthDataType) => Promise<number>;
}

// ============================================
// Configuration Interface
// ============================================

export interface HealthSyncConfig {
  historyDays: number;
  retryDelayMs: number;
  maxRetryCount: number;
  initialSyncDelayMs: number;
}
