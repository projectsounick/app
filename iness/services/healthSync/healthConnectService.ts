/**
 * Health Connect Service
 * Low-level wrapper for Android Health Connect API
 * Handles all direct interactions with react-native-health for Android
 */

import { Platform, Alert, Linking, NativeModules } from "react-native";
import { HealthDataType, HealthDataEntry } from "./types";
import { LOG_PREFIX } from "./constants";

// ============================================
// Types
// ============================================

interface HealthConnectModule {
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
let HealthConnect: HealthConnectModule | null = null;

// ============================================
// Initialization
// ============================================

/**
 * Check if Health Connect is available on this device
 */
export function isHealthConnectAvailable(): boolean {
  return Platform.OS === "android";
}

/**
 * Check if Health Connect app is installed on the device
 */
export async function isHealthConnectInstalled(): Promise<boolean> {
  if (!isHealthConnectAvailable()) {
    return false;
  }

  try {
    // First, try to get the Health Connect module
    // If the module can be loaded, Health Connect is likely installed
    const module = getHealthConnectModule();
    if (!module) {
      console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect module not available`);
      return false;
    }

    // Try to check if Health Connect is installed by attempting to open it
    // Health Connect uses a specific content URI scheme
    const healthConnectUrl = "content://com.google.android.apps.healthdata";
    
    try {
      const canOpen = await Linking.canOpenURL(healthConnectUrl);
      if (canOpen) {
        console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect appears to be installed (can open content URI)`);
        return true;
      }
    } catch (uriError) {
      // URI check failed, try alternative method
      console.log(`${LOG_PREFIX.HEALTHKIT} Content URI check failed, trying alternative method`);
    }

    // Alternative: Try to check if we can initialize (this will fail gracefully if not installed)
    // But we don't want to actually initialize, so we'll just check if the module exists
    // If the module loaded successfully, assume Health Connect is available
    // The actual initialization will handle the case where it's not properly installed
    console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect module loaded, assuming installed`);
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error checking Health Connect installation:`, error);
    return false;
  }
}

/**
 * Open Health Connect in Play Store for download
 */
export async function openHealthConnectPlayStore(): Promise<void> {
  try {
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata";
    // Try to open directly - don't check if it can open first
    try {
      await Linking.openURL(playStoreUrl);
      return;
    } catch (e) {
      // If direct open fails, try alternative
    }
    const canOpen = await Linking.canOpenURL(playStoreUrl);
    
    if (canOpen) {
      await Linking.openURL(playStoreUrl);
    } else {
      // Fallback to browser
      await Linking.openURL(playStoreUrl);
    }
  } catch (error: any) {
    // Silently handle - don't log error objects
  }
}

/**
 * Get Health Connect module (lazy load to avoid errors on iOS)
 */
function getHealthConnectModule(): HealthConnectModule | null {
  if (!isHealthConnectAvailable()) {
    console.log(`${LOG_PREFIX.HEALTHKIT} Not available (not Android)`);
    return null;
  }

  if (!HealthConnect) {
    try {
      // react-native-health exports via NativeModules.AppleHealthKit
      // The module's index.js does: const { AppleHealthKit } = require('react-native').NativeModules
      
      // Method 1: Try NativeModules directly (primary method)
      if (NativeModules?.AppleHealthKit) {
        HealthConnect = NativeModules.AppleHealthKit as HealthConnectModule;
        console.log(`${LOG_PREFIX.HEALTHKIT} Found module via NativeModules.AppleHealthKit`);
      } else {
        // Method 2: Try requiring the module (it will use NativeModules internally)
        const healthModule = require("react-native-health");
        
        // The module exports HealthKit which wraps AppleHealthKit
        // Check if it has the methods we need
        if (healthModule && typeof healthModule === 'object') {
          // The module might export HealthKit directly or wrap it
          HealthConnect = healthModule as HealthConnectModule;
          console.log(`${LOG_PREFIX.HEALTHKIT} Found module via require`);
        }
      }
      
      // Verify the module has the required methods
      if (HealthConnect && (!HealthConnect.initHealthKit || typeof HealthConnect.initHealthKit !== 'function')) {
        console.warn(`${LOG_PREFIX.HEALTHKIT} Module loaded but initHealthKit method not found`);
        console.log(`${LOG_PREFIX.HEALTHKIT} Available keys:`, Object.keys(HealthConnect || {}));
        // Don't set to null yet - might still work for other methods
      }
    } catch (error) {
      console.error(`${LOG_PREFIX.HEALTHKIT} Failed to load Health Connect module:`, error);
      return null;
    }
  }

  return HealthConnect;
}

/**
 * Initialize Health Connect with required permissions
 * This will show the Android permission modal on first call
 */
export async function initializeHealthConnect(showSettingsAlert: boolean = true): Promise<boolean> {
  console.log(`${LOG_PREFIX.HEALTHKIT} initializeHealthConnect called, isInitialized: ${isInitialized}`);
  
  if (!isHealthConnectAvailable()) {
    return false;
  }

  const healthConnect = getHealthConnectModule();
  if (!healthConnect) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Failed to get Health Connect module`);
    return false;
  }

  // Debug: Log what methods are available
  console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect module keys:`, Object.keys(healthConnect));
  console.log(`${LOG_PREFIX.HEALTHKIT} Has initHealthKit:`, 'initHealthKit' in healthConnect);
  console.log(`${LOG_PREFIX.HEALTHKIT} Type of initHealthKit:`, typeof healthConnect.initHealthKit);

  // Check if initHealthKit method exists
  if (!healthConnect.initHealthKit || typeof healthConnect.initHealthKit !== 'function') {
    console.error(`${LOG_PREFIX.HEALTHKIT} initHealthKit method not available on Health Connect module`);
    console.error(`${LOG_PREFIX.HEALTHKIT} Available methods:`, Object.keys(healthConnect).filter(key => typeof (healthConnect as any)[key] === 'function'));
    // Return false - user will need to grant permissions manually in Health Connect
    return false;
  }

  // If already initialized, check if permissions are actually granted
  if (isInitialized) {
    const hasPermissions = await checkPermissionsGranted();
    
    if (!hasPermissions) {
      permissionDenied = true;
      if (showSettingsAlert) {
        showPermissionDeniedAlert();
      }
      return false;
    }
    
    return true;
  }

  try {
    console.log(`${LOG_PREFIX.HEALTHKIT} Requesting Health Connect permissions...`);
    
    // Check if Constants exist
    if (!healthConnect.Constants || !healthConnect.Constants.Permissions) {
      console.error(`${LOG_PREFIX.HEALTHKIT} Health Connect Constants not available`);
      if (showSettingsAlert) {
        showHealthConnectNotInstalledModal();
      }
      return false;
    }
    
    const permissions = {
      permissions: {
        read: [
          healthConnect.Constants.Permissions.StepCount,
          healthConnect.Constants.Permissions.SleepAnalysis,
        ],
        write: [],
      },
    };

    const initSuccess = await new Promise<boolean>((resolve) => {
      try {
        healthConnect.initHealthKit(permissions, (error: string) => {
          if (error) {
            console.error(`${LOG_PREFIX.HEALTHKIT} Health Connect init error:`, error);
            resolve(false);
          } else {
            console.log(`${LOG_PREFIX.HEALTHKIT} initHealthKit completed for Health Connect`);
            isInitialized = true;
            resolve(true);
          }
        });
      } catch (initError) {
        console.error(`${LOG_PREFIX.HEALTHKIT} Health Connect init exception in callback:`, initError);
        resolve(false);
      }
    });

    if (!initSuccess) {
      permissionDenied = true;
      if (showSettingsAlert) {
        showPermissionDeniedAlert();
      }
      return false;
    }

    // Check if permissions were actually granted
    const hasPermissions = await checkPermissionsGranted();
    
    if (!hasPermissions) {
      permissionDenied = true;
      if (showSettingsAlert) {
        showPermissionDeniedAlert();
      }
      return false;
    }

    permissionDenied = false;
    return true;
    
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Health Connect init exception:`, error);
    // Don't show alert here - let the calling component handle it with modal
    return false;
  }
}

/**
 * Show modal when Health Connect is not installed or module is not available
 */
export function showHealthConnectNotInstalledModal(): void {
  Alert.alert(
    "Health Connect Required",
    "Health Connect is required to sync your health data on Android.\n\n" +
    "Please follow these steps:\n\n" +
    "1. Install Health Connect from Play Store (if not installed)\n" +
    "2. Open Health Connect app\n" +
    "3. Grant permissions to 'iness' app\n" +
    "4. Return here and try again\n\n" +
    "Would you like to open Health Connect now?",
    [
      { 
        text: "Cancel", 
        style: "cancel" 
      },
      {
        text: "Open Play Store",
        onPress: async () => {
          await openHealthConnectPlayStore();
        }
      },
      {
        text: "Open Health Connect",
        onPress: async () => {
          await openHealthConnectSettings();
        }
      }
    ]
  );
}

/**
 * Check if read permissions are actually granted
 */
async function checkPermissionsGranted(): Promise<boolean> {
  const healthConnect = getHealthConnectModule();
  if (!healthConnect) return false;

  try {
    // Try to get auth status for StepCount
    return new Promise((resolve) => {
      healthConnect.getAuthStatus(
        { permissions: { read: [healthConnect.Constants.Permissions.StepCount] } },
        (error: any, result: any) => {
          if (error) {
            console.log(`${LOG_PREFIX.HEALTHKIT} getAuthStatus error:`, error);
            // If getAuthStatus fails, try to fetch data as a test
            testDataAccess().then(resolve);
            return;
          }
          
          // Result should indicate if we have read access
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
    console.error(`${LOG_PREFIX.HEALTHKIT} Error checking Health Connect permissions:`, error);
    return testDataAccess();
  }
}

/**
 * Test if we can actually access data (fallback permission check)
 */
async function testDataAccess(): Promise<boolean> {
  const healthConnect = getHealthConnectModule();
  if (!healthConnect) return false;

  console.log(`${LOG_PREFIX.HEALTHKIT} Testing Health Connect data access as permission check...`);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  return new Promise((resolve) => {
    // Try to get today's step count
    healthConnect.getStepCount(
      {
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
      },
      (error: any, result: any) => {
        if (error) {
          // Check if the error indicates permission denied
          const errorStr = String(error).toLowerCase();
          if (errorStr.includes('denied') || errorStr.includes('authorization') || errorStr.includes('permission')) {
            console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect data access denied`);
            resolve(false);
          } else {
            // Other error - might still have permission, just no data
            console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect data access error (might be ok):`, error);
            resolve(true);
          }
        } else {
          // Successfully accessed data (even if value is 0)
          console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect data access successful, value:`, result?.value);
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
 */
export async function checkPermissionsStatus(type: "steps" | "sleep"): Promise<boolean> {
  const healthConnect = getHealthConnectModule();
  if (!healthConnect) return false;

  console.log(`${LOG_PREFIX.HEALTHKIT} Checking Health Connect permissions status for ${type}...`);

  const permissionType = type === "steps" 
    ? healthConnect.Constants.Permissions.StepCount 
    : healthConnect.Constants.Permissions.SleepAnalysis;

  try {
    return new Promise((resolve) => {
      healthConnect.getAuthStatus(
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

          console.log(`${LOG_PREFIX.HEALTHKIT} ${type} Health Connect auth status result:`, JSON.stringify(result));
          
          if (result?.permissions?.read && Array.isArray(result.permissions.read)) {
            const statusArray = result.permissions.read;
            console.log(`${LOG_PREFIX.HEALTHKIT} ${type} Health Connect status array:`, statusArray);
            
            // Status codes: 0 = not determined, 1 = denied, 2 = authorized
            const hasAccess = statusArray.some((status: number) => status === 2);
            console.log(`${LOG_PREFIX.HEALTHKIT} ${type} Health Connect has access:`, hasAccess);
            
            if (!hasAccess) {
              console.log(`${LOG_PREFIX.HEALTHKIT} ${type} Health Connect permissions are OFF (status not 2)`);
              resolve(false);
            } else {
              // Status is 2 (authorized), verify with data access for steps
              if (type === "steps") {
                testDataAccess().then(canAccess => {
                  console.log(`${LOG_PREFIX.HEALTHKIT} Steps Health Connect data access verification:`, canAccess);
                  resolve(canAccess);
                });
              } else {
                resolve(true);
              }
            }
          } else {
            console.log(`${LOG_PREFIX.HEALTHKIT} No valid Health Connect status array, assuming no access`);
            resolve(false);
          }
        }
      );
    });
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error checking ${type} Health Connect permissions:`, error);
    return false;
  }
}

/**
 * Show alert directing user to Settings with manual instructions
 */
export function showPermissionDeniedAlert(): void {
  Alert.alert(
    "Health Connect Access Required",
    "To sync your health data, please enable access manually:\n\n" +
    "1. Open Settings app\n" +
    "2. Go to Apps → Health Connect\n" +
    "3. Tap on Permissions\n" +
    "4. Find 'iness' app\n" +
    "5. Turn ON 'Steps' and 'Sleep Analysis' permissions\n" +
    "6. Return to this app and try again",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Try Open Settings", 
        onPress: () => openHealthConnectSettings() 
      },
      {
        text: "Show Manual Guide",
        onPress: () => showManualHealthConnectGuide()
      }
    ]
  );
}

/**
 * Show detailed manual guide for Health Connect permissions
 */
export function showManualHealthConnectGuide(): void {
  Alert.alert(
    "Manual Setup Guide - Health Connect",
    "Follow these steps to grant permissions:\n\n" +
    "STEP 1: Open Health Connect App\n" +
    "• Find 'Health Connect' app on your device\n" +
    "• If not installed, download from Play Store\n\n" +
    "STEP 2: Grant Permissions\n" +
    "• Open Health Connect app\n" +
    "• Tap on 'Data and access' or 'Permissions'\n" +
    "• Find 'iness' in the list of apps\n" +
    "• Tap on 'iness'\n" +
    "• Turn ON 'Steps' permission\n" +
    "• Turn ON 'Sleep Analysis' permission\n\n" +
    "STEP 3: Return to App\n" +
    "• Come back to iness app\n" +
    "• Tap 'Continue' to sync your data\n\n" +
    "Alternative: Settings App\n" +
    "• Open Settings → Apps → Health Connect\n" +
    "• Tap Permissions → Find 'iness'\n" +
    "• Enable Steps and Sleep Analysis",
    [
      { text: "Got it", style: "default" },
      {
        text: "Open Health Connect App",
        onPress: async () => {
          try {
            // Try to open Health Connect app directly
            const healthConnectPackage = "com.google.android.apps.healthdata";
            await Linking.openURL(`package:${healthConnectPackage}`);
          } catch (error) {
            // Fallback to settings
            await Linking.openSettings();
          }
        }
      }
    ]
  );
}

/**
 * Show alert when no data is found (might be permission issue)
 */
export function showNoDataOrPermissionAlert(type: string): void {
  Alert.alert(
    `No ${type} Data Found`,
    `We couldn't find any ${type} data in Health Connect.\n\nThis could mean:\n• You haven't recorded any ${type} yet\n• Health Connect access was not allowed\n\nWould you like to check your Health Connect settings?`,
    [
      { text: "Not Now", style: "cancel" },
      { 
        text: "Open Settings", 
        onPress: () => openHealthConnectSettings() 
      },
    ]
  );
}

/**
 * Open Health Connect settings
 * Returns true if successfully opened, false otherwise
 */
export async function openHealthConnectSettings(): Promise<boolean> {
  try {
    const healthConnectPackage = "com.google.android.apps.healthdata";
    const packageIntent = `package:${healthConnectPackage}`;
    const healthConnectUrl = "content://com.google.android.apps.healthdata";
    const appIntent = `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${healthConnectPackage};end`;
    
    // Method 1: Try package intent (opens app info/settings)
    try {
      const canOpenPackage = await Linking.canOpenURL(packageIntent);
      if (canOpenPackage) {
        await Linking.openURL(packageIntent);
        return true;
      }
    } catch (e: any) {
      // Continue to next method
    }
    
    // Method 2: Try content URI
    try {
      const canOpen = await Linking.canOpenURL(healthConnectUrl);
      if (canOpen) {
        await Linking.openURL(healthConnectUrl);
        return true;
      }
    } catch (e: any) {
      // Continue to next method
    }
    
    // Method 3: Try direct app intent
    try {
      await Linking.openURL(appIntent);
      return true;
    } catch (e: any) {
      // Continue to next method
    }
    
    // Method 4: Try opening app via package name directly
    try {
      const packageUrl = `market://details?id=${healthConnectPackage}`;
      await Linking.openURL(packageUrl);
      return true;
    } catch (e: any) {
      // Continue to fallback
    }
    
    // Fallback to general settings
    try {
      await Linking.openSettings();
      return false; // Settings opened but not Health Connect directly
    } catch (error: any) {
      return false;
    }
  } catch (error: any) {
    // Final fallback to general settings
    try {
      await Linking.openSettings();
      return false;
    } catch (settingsError: any) {
      return false;
    }
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
  const healthConnect = getHealthConnectModule();
  if (!healthConnect) return 0;

  const initialized = await initializeHealthConnect();
  if (!initialized) return 0;

  const { startOfDay, endOfDay } = getTodayDateRange();

  return new Promise((resolve) => {
    healthConnect.getStepCount(
      {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      },
      (error, results) => {
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Error getting Health Connect steps:`, error);
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
  const healthConnect = getHealthConnectModule();
  if (!healthConnect) return 0;

  const initialized = await initializeHealthConnect();
  if (!initialized) return 0;

  const { startOfDay, endOfDay } = getTodayDateRange();

  return new Promise((resolve) => {
    healthConnect.getSleepSamples(
      {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      },
      (error, results) => {
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Error getting Health Connect sleep:`, error);
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
  const healthConnect = getHealthConnectModule();
  if (!healthConnect) return [];

  const initialized = await initializeHealthConnect();
  if (!initialized) return [];

  return new Promise((resolve) => {
    console.log(`[DEBUG] Fetching Health Connect steps for sync - Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    healthConnect.getDailyStepCountSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      (error, results) => {
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Error getting historical Health Connect steps:`, error);
          resolve([]);
          return;
        }

        console.log(`[DEBUG] Health Connect returned ${(results || []).length} raw samples for sync date range`);

        // Aggregate by date to get daily totals
        const data = aggregateStepsByDate(results || []);
        
        console.log(`[DEBUG] After aggregation: ${data.length} Health Connect entries`);
        
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
  const healthConnect = getHealthConnectModule();
  if (!healthConnect) return [];

  const initialized = await initializeHealthConnect();
  if (!initialized) return [];

  return new Promise((resolve) => {
    healthConnect.getSleepSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      (error, results) => {
        if (error) {
          console.error(`${LOG_PREFIX.HEALTHKIT} Error getting historical Health Connect sleep:`, error);
          resolve([]);
          return;
        }

        // Aggregate sleep by date
        const data = aggregateSleepByDate(results || [], startDate);
        
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

/**
 * Aggregate sleep samples by date (sum all sleep for each day)
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
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const duration = (new Date(entry.endDate).getTime() - start.getTime()) / (1000 * 60 * 60);
      sleepByDate[dateKey] = (sleepByDate[dateKey] || 0) + duration;
    }
  });

  return Object.entries(sleepByDate).map(([date, hours]) => {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const totalValue = Math.round(hours * 10) / 10;
    return {
      date: localDate.toISOString(),
      value: totalValue,
      totalHealthKitValue: totalValue, // For Health Connect, same as value
    };
  });
}

/**
 * Aggregate step samples by date (sum all steps for each day)
 */
function aggregateStepsByDate(samples: any[], minDate?: Date): HealthDataEntry[] {
  const stepsByDate: Record<string, number> = {};

  samples.forEach((entry) => {
    const dateStr = entry.startDate || entry.date || entry.endDate;
    if (dateStr && entry.value) {
      const date = new Date(dateStr);
      
      // If minDate is provided, only include samples after that time
      if (minDate && date < minDate) {
        return; // Skip this sample
      }
      
      // Use local date (YYYY-MM-DD) to match backend normalization
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      stepsByDate[dateKey] = (stepsByDate[dateKey] || 0) + (entry.value || 0);
    }
  });

  const result = Object.entries(stepsByDate)
    .map(([date, steps]) => {
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const totalValue = Math.round(steps);
      return {
        date: localDate.toISOString(),
        value: totalValue,
        totalHealthKitValue: totalValue, // For Health Connect, same as value
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

  return result;
}

