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
 * Check if permissions are currently granted for a specific type
 * Uses getAuthStatus which can detect when permissions are explicitly denied
 * @param type - "steps" or "sleep"
 * @returns true if permissions are granted, false if denied or not determined
 */
export async function checkPermissionsStatus(type: "steps" | "sleep"): Promise<boolean> {
  const healthKit = getHealthKitModule();
  if (!healthKit) return false;

  console.log(`${LOG_PREFIX.HEALTHKIT} Checking permissions status for ${type}...`);

  const permissionType = type === "steps" 
    ? healthKit.Constants.Permissions.StepCount 
    : healthKit.Constants.Permissions.SleepAnalysis;

  try {
    return new Promise((resolve) => {
      healthKit.getAuthStatus(
        { 
          permissions: { 
            read: [permissionType],
            write: []
          } 
        },
        (error: any, result: any) => {
          if (error) {
            console.log(`${LOG_PREFIX.HEALTHKIT} getAuthStatus error for ${type}:`, error);
            // If getAuthStatus fails, try data access test for steps
            if (type === "steps") {
              testDataAccess().then(resolve);
            } else {
              resolve(false);
            }
            return;
          }

          console.log(`${LOG_PREFIX.HEALTHKIT} ${type} auth status result:`, JSON.stringify(result));
          
          if (result?.permissions?.read && Array.isArray(result.permissions.read)) {
            const statusArray = result.permissions.read;
            console.log(`${LOG_PREFIX.HEALTHKIT} ${type} status array:`, statusArray);
            
            // Status codes: 0 = not determined, 1 = denied, 2 = authorized
            // We only consider 2 as having access
            const hasAccess = statusArray.some((status: number) => status === 2);
            console.log(`${LOG_PREFIX.HEALTHKIT} ${type} has access:`, hasAccess);
            
            // If status shows denied (1) or not determined (0), permissions are OFF
            if (!hasAccess) {
              console.log(`${LOG_PREFIX.HEALTHKIT} ${type} permissions are OFF (status not 2)`);
              resolve(false);
            } else {
              // Status is 2 (authorized), verify with data access for steps
              if (type === "steps") {
                testDataAccess().then(canAccess => {
                  console.log(`${LOG_PREFIX.HEALTHKIT} Steps data access verification:`, canAccess);
                  resolve(canAccess);
                });
              } else {
                resolve(true);
              }
            }
          } else {
            console.log(`${LOG_PREFIX.HEALTHKIT} No valid status array, assuming no access`);
            resolve(false);
          }
        }
      );
    });
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error checking ${type} permissions:`, error);
    return false;
  }
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

  // First, fetch last 5 entries regardless of date range for debugging
  const debugEndDate = new Date();
  const debugStartDate = new Date();
  debugStartDate.setDate(debugStartDate.getDate() - 30); // Last 30 days for debugging
  
  return new Promise((resolve) => {
    // First, fetch debug data (last 30 days, regardless of requested range)
    // Show RAW samples, not aggregated
    healthKit.getDailyStepCountSamples(
      {
        startDate: debugStartDate.toISOString(),
        endDate: debugEndDate.toISOString(),
      },
      (debugError, debugResults) => {
        if (!debugError && debugResults && debugResults.length > 0) {
          // Sort by date (newest first) and take last 5 RAW entries
          const sortedResults = (debugResults || []).sort((a: any, b: any) => {
            const dateA = new Date(a.startDate || a.date || a.endDate || 0).getTime();
            const dateB = new Date(b.startDate || b.date || b.endDate || 0).getTime();
            return dateB - dateA; // Newest first
          });
          
          const last5Raw = sortedResults.slice(0, 5);
          console.log(`\n========== [DEBUG] Last 5 RAW Step Entries in HealthKit (Last 30 Days) ==========`);
          console.log(`Total raw samples found: ${debugResults.length}`);
          last5Raw.forEach((entry: any, index: number) => {
            const dateStr = entry.startDate || entry.date || entry.endDate;
            const date = new Date(dateStr);
            const localDate = date.toLocaleString('en-US', { 
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            const utcDate = date.toISOString();
            const value = entry.value || entry.quantity || 0;
            console.log(`  ${index + 1}. ${localDate} (UTC: ${utcDate}): ${value} steps`);
          });
          console.log(`================================================\n`);
        } else {
          console.log(`[DEBUG] No debug entries found or error:`, debugError);
        }
        
        // Now fetch the actual requested date range
        console.log(`\n[DEBUG] Fetching steps for sync - Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        console.log(`[DEBUG] Date range (local): ${startDate.toLocaleString()} to ${endDate.toLocaleString()}`);
        
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

            console.log(`[DEBUG] HealthKit returned ${(results || []).length} raw samples for sync date range`);
            if (results && results.length > 0) {
              const sampleDates = results.slice(0, 3).map((r: any) => {
                const dateStr = r.startDate || r.date || r.endDate;
                return dateStr ? new Date(dateStr).toLocaleString() : 'unknown';
              });
              console.log(`[DEBUG] Sample dates from HealthKit: ${sampleDates.join(', ')}`);
            }

            // Aggregate by date to get daily totals
            // Note: getDailyStepCountSamples returns daily aggregates, not time-based samples
            // So we can't filter by time within a day - we can only filter by date
            // If synced today, we need to handle it differently to avoid double-counting
            let data: HealthDataEntry[];
            
            // Check if we're syncing today's data (startDate is today)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDateOnly = new Date(startDate);
            startDateOnly.setHours(0, 0, 0, 0);
            const isSyncingToday = startDateOnly.getTime() === today.getTime();
            
            if (isSyncingToday && startDate > today) {
              // We're syncing today but from a specific time (not start of day)
              // Since getDailyStepCountSamples returns daily totals, we can't filter by time
              // Instead, we'll include today's data but the backend should handle it
              // OR we need to fetch the current total and subtract what we already have
              console.log(`[DEBUG] Syncing today from ${startDate.toLocaleString()} - will include full day's data (HealthKit limitation)`);
              data = aggregateStepsByDate(results || []);
            } else {
              // Normal case: include all data in the range
              data = aggregateStepsByDate(results || []);
            }
            
            console.log(`[DEBUG] After aggregation: ${data.length} entries`);
            if (data.length > 0) {
              console.log(`[DEBUG] Aggregated entries:`, data.map(d => `${new Date(d.date).toLocaleString()}: ${d.value} steps`).join(', '));
            }
            
            resolve(data);
          }
        );
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

  // First, fetch last 5 entries regardless of date range for debugging
  const debugEndDate = new Date();
  const debugStartDate = new Date();
  debugStartDate.setDate(debugStartDate.getDate() - 30); // Last 30 days for debugging
  
  return new Promise((resolve) => {
    // First, fetch debug data (last 30 days, regardless of requested range)
    healthKit.getSleepSamples(
      {
        startDate: debugStartDate.toISOString(),
        endDate: debugEndDate.toISOString(),
      },
      (debugError, debugResults) => {
        if (!debugError && debugResults && debugResults.length > 0) {
          // Sort by date (newest first) and take last 5 RAW entries
          const sortedResults = (debugResults || []).sort((a: any, b: any) => {
            const dateA = new Date(a.startDate || a.date || a.endDate || 0).getTime();
            const dateB = new Date(b.startDate || b.date || b.endDate || 0).getTime();
            return dateB - dateA; // Newest first
          });
          
          const last5Raw = sortedResults.slice(0, 5);
          console.log(`\n========== [DEBUG] Last 5 RAW Sleep Entries in HealthKit (Last 30 Days) ==========`);
          console.log(`Total raw samples found: ${debugResults.length}`);
          last5Raw.forEach((entry: any, index: number) => {
            const dateStr = entry.startDate || entry.date || entry.endDate;
            const date = new Date(dateStr);
            const localDate = date.toLocaleString('en-US', { 
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            const utcDate = date.toISOString();
            // Calculate duration for sleep entries
            let duration = 0;
            if (entry.startDate && entry.endDate) {
              duration = (new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / (1000 * 60 * 60);
            } else if (entry.value) {
              duration = entry.value;
            }
            console.log(`  ${index + 1}. ${localDate} (UTC: ${utcDate}): ${duration.toFixed(2)} hours`);
          });
          console.log(`================================================\n`);
        } else {
          console.log(`[DEBUG] No debug entries found or error:`, debugError);
        }
        
        // Now fetch the actual requested date range
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

            // If synced today, only include samples after last sync time to prevent double-counting
            const data = aggregateSleepByDate(results || [], startDate);
            
            resolve(data);
          }
        );
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

/**
 * Aggregate sleep samples by date (sum all sleep for each day)
 * Uses local timezone to determine which day sleep belongs to
 * @param minDate - Optional minimum date to filter samples (only include samples after this time)
 */
function aggregateSleepByDate(samples: any[], minDate?: Date): HealthDataEntry[] {
  const sleepByDate: Record<string, number> = {};

  samples.forEach((entry) => {
    if (entry.startDate && entry.endDate) {
      const start = new Date(entry.startDate);
      
      // If minDate is provided, only include samples that start after that time
      if (minDate && start < minDate) {
        return; // Skip this sample
      }
      
      // Use local date (YYYY-MM-DD) to match backend normalization
      // This ensures sleep is grouped by the user's local day, not UTC day
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`; // Local date in YYYY-MM-DD format
      const duration = (new Date(entry.endDate).getTime() - start.getTime()) / (1000 * 60 * 60);
      sleepByDate[dateKey] = (sleepByDate[dateKey] || 0) + duration;
    }
  });

  return Object.entries(sleepByDate).map(([date, hours]) => {
    // Create date at midnight local time for this date
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    return {
      date: localDate.toISOString(),
      value: Math.round(hours * 10) / 10,
    };
  });
}

/**
 * Aggregate step samples by date (sum all steps for each day)
 * Uses local timezone to determine which day a step belongs to
 * @param minDate - Optional minimum date to filter samples (only include samples after this time)
 */
function aggregateStepsByDate(samples: any[], minDate?: Date): HealthDataEntry[] {
  const stepsByDate: Record<string, number> = {};
  let filteredCount = 0;
  let includedCount = 0;

  samples.forEach((entry) => {
    // Get the date from startDate, date, or endDate
    const dateStr = entry.startDate || entry.date || entry.endDate;
    if (dateStr && entry.value) {
      const date = new Date(dateStr);
      
      // If minDate is provided, only include samples after that time
      if (minDate && date < minDate) {
        filteredCount++;
        return; // Skip this sample
      }
      
      includedCount++;
      // Use local date (YYYY-MM-DD) to match backend normalization
      // This ensures steps are grouped by the user's local day, not UTC day
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`; // Local date in YYYY-MM-DD format
      stepsByDate[dateKey] = (stepsByDate[dateKey] || 0) + (entry.value || 0);
    }
  });

  if (minDate) {
    console.log(`[DEBUG] Aggregation filter: ${filteredCount} samples filtered out (before ${minDate.toLocaleString()}), ${includedCount} samples included`);
  }

  const result = Object.entries(stepsByDate)
    .map(([date, steps]) => {
      // Create date at midnight local time for this date
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      return {
        date: localDate.toISOString(),
        value: Math.round(steps),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

  return result;
}

