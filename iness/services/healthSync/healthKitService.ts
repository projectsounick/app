/**
 * HealthKit Service
 * Low-level wrapper for Apple HealthKit API
 * Handles all direct interactions with react-native-health
 */

import { Platform, Alert, Linking } from "react-native";
import { HealthDataType, HealthDataEntry } from "./types";
import { LOG_PREFIX } from "./constants";

// ============================================
// Types
// ============================================

interface HealthKitModule {
  initHealthKit: (permissions: any, callback: (error: string) => void) => void;
  getStepCount: (options: any, callback: (error: any, results: any) => void) => void;
  getDailyStepCountSamples: (options: any, callback: (error: any, results: any[]) => void) => void;
  getSleepSamples: (options: any, callback: (error: any, results: any[]) => void) => void;
  getAuthStatus: (permissions: any, callback: (error: any, results: any) => void) => void;
  isAvailable: (callback: (error: any, available: boolean) => void) => void;
  Constants: {
    Permissions: {
      StepCount: string;
      SleepAnalysis: string;
    };
  };
}

// ============================================
// Service State
// ============================================

let isInitialized = false;
let permissionDenied = false;
let AppleHealthKit: HealthKitModule | null = null;

// ============================================
// Initialization
// ============================================

/**
 * Check if HealthKit is available on this device
 */
export function isHealthKitAvailable(): boolean {
  return Platform.OS === "ios";
}

/**
 * Get HealthKit module (lazy load to avoid errors on Android)
 */
function getHealthKitModule(): HealthKitModule | null {
  if (!isHealthKitAvailable()) {
    console.log(`${LOG_PREFIX.HEALTHKIT} Not available (not iOS)`);
    return null;
  }

  if (!AppleHealthKit) {
    try {
      console.log(`${LOG_PREFIX.HEALTHKIT} Loading react-native-health module...`);
      
      // Try to load the module
      const healthModule = require("react-native-health");
      console.log(`${LOG_PREFIX.HEALTHKIT} Raw module:`, typeof healthModule);
      console.log(`${LOG_PREFIX.HEALTHKIT} Module keys:`, Object.keys(healthModule || {}));
      console.log(`${LOG_PREFIX.HEALTHKIT} Module.default:`, typeof healthModule?.default);
      
      // The module might export differently
      AppleHealthKit = healthModule?.default || healthModule;
      
      if (AppleHealthKit) {
        console.log(`${LOG_PREFIX.HEALTHKIT} Module loaded successfully`);
        console.log(`${LOG_PREFIX.HEALTHKIT} Has initHealthKit:`, typeof AppleHealthKit.initHealthKit);
        console.log(`${LOG_PREFIX.HEALTHKIT} Has Constants:`, typeof AppleHealthKit.Constants);
      } else {
        console.error(`${LOG_PREFIX.HEALTHKIT} Module is null/undefined after require`);
        console.error(`${LOG_PREFIX.HEALTHKIT} This usually means the native module is not linked.`);
        console.error(`${LOG_PREFIX.HEALTHKIT} You need to rebuild your dev client with: npx expo prebuild && npx expo run:ios`);
      }
    } catch (error) {
      console.error(`${LOG_PREFIX.HEALTHKIT} Failed to load module:`, error);
      return null;
    }
  }

  return AppleHealthKit;
}

/**
 * Initialize HealthKit with required permissions
 * This will show the iOS permission modal on first call
 */
export async function initializeHealthKit(showSettingsAlert: boolean = true): Promise<boolean> {
  console.log(`${LOG_PREFIX.HEALTHKIT} initializeHealthKit called, isInitialized: ${isInitialized}`);
  
  if (!isHealthKitAvailable()) {
    console.log(`${LOG_PREFIX.HEALTHKIT} Not available on this platform`);
    return false;
  }

  const healthKit = getHealthKitModule();
  if (!healthKit) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Failed to get HealthKit module`);
    return false;
  }

  // If already initialized, check if permissions are actually granted
  if (isInitialized) {
    console.log(`${LOG_PREFIX.HEALTHKIT} Already initialized, checking permissions...`);
    const hasPermissions = await checkPermissionsGranted();
    
    if (!hasPermissions) {
      console.log(`${LOG_PREFIX.HEALTHKIT} Permissions not granted despite init`);
      permissionDenied = true;
      if (showSettingsAlert) {
        showPermissionDeniedAlert();
      }
      return false;
    }
    
    return true;
  }

  try {
    console.log(`${LOG_PREFIX.HEALTHKIT} Requesting permissions...`);
    
    const permissions = {
      permissions: {
        read: [
          healthKit.Constants.Permissions.StepCount,
          healthKit.Constants.Permissions.SleepAnalysis,
        ],
        write: [],
      },
    };

    console.log(`${LOG_PREFIX.HEALTHKIT} Calling initHealthKit - modal should appear now...`);

    const initSuccess = await new Promise<boolean>((resolve) => {
      healthKit.initHealthKit(permissions, (error: string) => {
        console.log(`${LOG_PREFIX.HEALTHKIT} initHealthKit callback received`);
        
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Init error:`, error);
          resolve(false);
        } else {
          console.log(`${LOG_PREFIX.HEALTHKIT} initHealthKit completed`);
          isInitialized = true;
          resolve(true);
        }
      });
    });

    if (!initSuccess) {
      permissionDenied = true;
      if (showSettingsAlert) {
        showPermissionDeniedAlert();
      }
      return false;
    }

    // Check if permissions were actually granted (user might have pressed "Don't Allow")
    console.log(`${LOG_PREFIX.HEALTHKIT} Checking if permissions were granted...`);
    const hasPermissions = await checkPermissionsGranted();
    
    if (!hasPermissions) {
      console.log(`${LOG_PREFIX.HEALTHKIT} User denied permissions`);
      permissionDenied = true;
      if (showSettingsAlert) {
        showPermissionDeniedAlert();
      }
      return false;
    }

    console.log(`${LOG_PREFIX.HEALTHKIT} Permissions granted successfully!`);
    permissionDenied = false;
    return true;
    
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Init exception:`, error);
    return false;
  }
}

/**
 * Check if read permissions are actually granted
 * This is needed because initHealthKit succeeds even when user denies
 */
async function checkPermissionsGranted(): Promise<boolean> {
  const healthKit = getHealthKitModule();
  if (!healthKit) return false;

  try {
    // Try to get auth status for StepCount
    return new Promise((resolve) => {
      healthKit.getAuthStatus(
        { permissions: { read: [healthKit.Constants.Permissions.StepCount] } },
        (error: any, result: any) => {
          if (error) {
            console.log(`${LOG_PREFIX.HEALTHKIT} getAuthStatus error:`, error);
            // If getAuthStatus fails, try to fetch data as a test
            testDataAccess().then(resolve);
            return;
          }

          console.log(`${LOG_PREFIX.HEALTHKIT} Auth status result:`, JSON.stringify(result));
          
          // Result should indicate if we have read access
          // The exact format depends on react-native-health version
          if (result && (result.permissions?.read?.length > 0 || result === 2)) {
            resolve(true);
          } else {
            // Fallback: try to fetch data
            testDataAccess().then(resolve);
          }
        }
      );
    });
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error checking permissions:`, error);
    return testDataAccess();
  }
}

/**
 * Test if we can actually access data (fallback permission check)
 */
async function testDataAccess(): Promise<boolean> {
  const healthKit = getHealthKitModule();
  if (!healthKit) return false;

  console.log(`${LOG_PREFIX.HEALTHKIT} Testing data access as permission check...`);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  return new Promise((resolve) => {
    // Try to get today's step count
    healthKit.getStepCount(
      {
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
      },
      (error: any, result: any) => {
        if (error) {
          // Check if the error indicates permission denied
          const errorStr = String(error).toLowerCase();
          if (errorStr.includes('denied') || errorStr.includes('authorization') || errorStr.includes('permission')) {
            console.log(`${LOG_PREFIX.HEALTHKIT} Data access denied`);
            resolve(false);
          } else {
            // Other error - might still have permission, just no data
            console.log(`${LOG_PREFIX.HEALTHKIT} Data access error (might be ok):`, error);
            resolve(true);
          }
        } else {
          // Successfully accessed data (even if value is 0)
          console.log(`${LOG_PREFIX.HEALTHKIT} Data access successful, value:`, result?.value);
          resolve(true);
        }
      }
    );
  });
}

/**
 * Check if permissions were previously denied
 */
export function wasPermissionDenied(): boolean {
  return permissionDenied;
}

/**
 * Show alert directing user to Settings
 */
export function showPermissionDeniedAlert(): void {
  Alert.alert(
    "Health Access Required",
    "To sync your health data, please enable access in Settings:\n\nSettings → Health → Data Access & Devices → iness",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Open Settings", 
        onPress: () => openHealthSettings() 
      },
    ]
  );
}

/**
 * Show alert when no data is found (might be permission issue)
 */
export function showNoDataOrPermissionAlert(type: string): void {
  Alert.alert(
    `No ${type} Data Found`,
    `We couldn't find any ${type} data in Apple Health.\n\nThis could mean:\n• You haven't recorded any ${type} yet\n• Health access was not allowed\n\nWould you like to check your Health settings?`,
    [
      { text: "Not Now", style: "cancel" },
      { 
        text: "Open Settings", 
        onPress: () => openHealthSettings() 
      },
    ]
  );
}

/**
 * Open Health app settings
 */
export async function openHealthSettings(): Promise<void> {
  try {
    // Try to open the Health app directly
    const healthUrl = "x-apple-health://";
    const canOpen = await Linking.canOpenURL(healthUrl);
    
    if (canOpen) {
      await Linking.openURL(healthUrl);
    } else {
      // Fallback to app settings
      await Linking.openSettings();
    }
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error opening settings:`, error);
    // Fallback to general settings
    await Linking.openSettings();
  }
}

/**
 * Reset initialization state (useful for retry after settings change)
 */
export function resetInitialization(): void {
  isInitialized = false;
  permissionDenied = false;
}

// ============================================
// Data Fetching
// ============================================

/**
 * Get today's step count
 */
export async function getTodaySteps(): Promise<number> {
  const healthKit = getHealthKitModule();
  if (!healthKit) return 0;

  const initialized = await initializeHealthKit();
  if (!initialized) return 0;

  const { startOfDay, endOfDay } = getTodayDateRange();

  return new Promise((resolve) => {
    healthKit.getStepCount(
      {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      },
      (error, results) => {
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Error getting steps:`, error);
          resolve(0);
          return;
        }
        resolve(results?.value || 0);
      }
    );
  });
}

/**
 * Get today's sleep duration in hours
 */
export async function getTodaySleep(): Promise<number> {
  const healthKit = getHealthKitModule();
  if (!healthKit) return 0;

  const initialized = await initializeHealthKit();
  if (!initialized) return 0;

  const { startOfDay, endOfDay } = getTodayDateRange();

  return new Promise((resolve) => {
    healthKit.getSleepSamples(
      {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      },
      (error, results) => {
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Error getting sleep:`, error);
          resolve(0);
          return;
        }
        resolve(calculateTotalSleepHours(results || []));
      }
    );
  });
}

/**
 * Get historical step data for a date range
 */
export async function getHistoricalSteps(
  startDate: Date,
  endDate: Date
): Promise<HealthDataEntry[]> {
  const healthKit = getHealthKitModule();
  if (!healthKit) return [];

  const initialized = await initializeHealthKit();
  if (!initialized) return [];

  console.log(
    `${LOG_PREFIX.HEALTHKIT} Fetching steps: ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  return new Promise((resolve) => {
    healthKit.getDailyStepCountSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      (error, results) => {
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Error getting historical steps:`, error);
          resolve([]);
          return;
        }

        console.log(`${LOG_PREFIX.HEALTHKIT} Raw step samples received: ${(results || []).length}`);
        
        // Aggregate by date to get daily totals
        const data = aggregateStepsByDate(results || []);

        console.log(`${LOG_PREFIX.HEALTHKIT} Aggregated to ${data.length} days`);
        
        // Log last 10 entries for debugging
        logLastEntries('steps', data, 10);
        
        resolve(data);
      }
    );
  });
}

/**
 * Get historical sleep data for a date range
 */
export async function getHistoricalSleep(
  startDate: Date,
  endDate: Date
): Promise<HealthDataEntry[]> {
  const healthKit = getHealthKitModule();
  if (!healthKit) return [];

  const initialized = await initializeHealthKit();
  if (!initialized) return [];

  console.log(
    `${LOG_PREFIX.HEALTHKIT} Fetching sleep: ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  return new Promise((resolve) => {
    healthKit.getSleepSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      (error, results) => {
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Error getting historical sleep:`, error);
          resolve([]);
          return;
        }

        console.log(`${LOG_PREFIX.HEALTHKIT} Raw sleep samples received: ${(results || []).length}`);
        
        const data = aggregateSleepByDate(results || []);
        console.log(`${LOG_PREFIX.HEALTHKIT} Aggregated to ${data.length} days`);
        
        // Log last 10 entries for debugging
        logLastEntries('sleep', data, 10);
        
        resolve(data);
      }
    );
  });
}

/**
 * Get historical data by type
 */
export async function getHistoricalData(
  type: HealthDataType,
  startDate: Date,
  endDate: Date
): Promise<HealthDataEntry[]> {
  if (type === "steps") {
    return getHistoricalSteps(startDate, endDate);
  } else if (type === "sleep") {
    return getHistoricalSleep(startDate, endDate);
  }
  return [];
}

/**
 * Get today's value by type
 */
export async function getTodayValue(type: HealthDataType): Promise<number> {
  if (type === "steps") {
    return getTodaySteps();
  } else if (type === "sleep") {
    return getTodaySleep();
  }
  return 0;
}

// ============================================
// Helper Functions
// ============================================

function getTodayDateRange(): { startOfDay: Date; endOfDay: Date } {
  const now = new Date();
  return {
    startOfDay: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
    endOfDay: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
  };
}

function calculateTotalSleepHours(samples: any[]): number {
  let totalHours = 0;

  samples.forEach((entry) => {
    if (entry.startDate && entry.endDate) {
      const start = new Date(entry.startDate);
      const end = new Date(entry.endDate);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += duration;
    }
  });

  return Math.round(totalHours * 10) / 10; // Round to 1 decimal
}

function aggregateSleepByDate(samples: any[]): HealthDataEntry[] {
  const sleepByDate: Record<string, number> = {};

  samples.forEach((entry) => {
    if (entry.startDate && entry.endDate) {
      const start = new Date(entry.startDate);
      const dateKey = start.toISOString().split("T")[0]; // YYYY-MM-DD
      const duration = (new Date(entry.endDate).getTime() - start.getTime()) / (1000 * 60 * 60);
      sleepByDate[dateKey] = (sleepByDate[dateKey] || 0) + duration;
    }
  });

  return Object.entries(sleepByDate).map(([date, hours]) => ({
    date: new Date(date).toISOString(),
    value: Math.round(hours * 10) / 10,
  }));
}

/**
 * Aggregate step samples by date (sum all steps for each day)
 */
function aggregateStepsByDate(samples: any[]): HealthDataEntry[] {
  const stepsByDate: Record<string, number> = {};

  samples.forEach((entry) => {
    // Get the date from startDate, date, or endDate
    const dateStr = entry.startDate || entry.date || entry.endDate;
    if (dateStr && entry.value) {
      const date = new Date(dateStr);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      stepsByDate[dateKey] = (stepsByDate[dateKey] || 0) + (entry.value || 0);
    }
  });

  const result = Object.entries(stepsByDate)
    .map(([date, steps]) => ({
      date: new Date(date).toISOString(),
      value: Math.round(steps),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

  return result;
}

/**
 * Log last N entries for debugging
 */
function logLastEntries(type: string, data: HealthDataEntry[], count: number = 10): void {
  console.log(`\n========== ${type.toUpperCase()} - Last ${count} Entries ==========`);
  console.log(`Total entries: ${data.length}`);
  
  const entries = data.slice(0, count);
  entries.forEach((entry, index) => {
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    console.log(`  ${index + 1}. ${formattedDate}: ${entry.value} ${type === 'steps' ? 'steps' : 'hours'}`);
  });
  
  // Also log total
  const total = data.reduce((sum, e) => sum + e.value, 0);
  console.log(`Total ${type}: ${type === 'steps' ? total : total.toFixed(1)}`);
  console.log(`================================================\n`);
}
