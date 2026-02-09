/**
 * Health Connect Service
 * Low-level wrapper for Android Health Connect API
 * Uses react-native-health-connect for Android Health Connect
 */

import { Platform, Alert, Linking } from "react-native";
import { HealthDataType, HealthDataEntry } from "./types";
import { LOG_PREFIX } from "./constants";

// Import react-native-health-connect (Android only)
let HealthConnect: any = null;
if (Platform.OS === "android") {
  try {
    HealthConnect = require("react-native-health-connect");
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Failed to load react-native-health-connect:`, error);
  }
}

// ============================================
// Service State
// ============================================

let isInitialized = false;
let permissionDenied = false;

// ============================================
// Initialization
// ============================================

/**
 * Check if Health Connect is available on this device
 */
export function isHealthConnectAvailable(): boolean {
  return Platform.OS === "android" && HealthConnect !== null;
}

/**
 * Check if Health Connect app is installed on the device
 */
export async function isHealthConnectInstalled(): Promise<boolean> {
  if (!isHealthConnectAvailable()) {
    return false;
  }

  try {
    // Try to initialize - this will fail if Health Connect is not installed
    const initialized = await HealthConnect.initialize();
    return initialized;
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
    await Linking.openURL(playStoreUrl);
  } catch (error: any) {
    // Silently handle
  }
}

/**
 * Initialize Health Connect with required permissions
 * This will show the Android permission modal on first call
 * @param type - Optional: "steps" or "sleep" to request only that permission. If not provided, requests both.
 */
export async function initializeHealthConnect(showSettingsAlert: boolean = true, type?: "steps" | "sleep"): Promise<boolean> {
  console.log(`${LOG_PREFIX.HEALTHKIT} initializeHealthConnect called, isInitialized: ${isInitialized}, type: ${type || 'both'}`);
  
  if (!isHealthConnectAvailable()) {
    return false;
  }

  // If already initialized, check if permissions are actually granted for the requested type
  if (isInitialized) {
    if (type) {
      // Check specific type permission
      const hasPermission = await checkPermissionsStatus(type);
      if (!hasPermission) {
        permissionDenied = true;
        if (showSettingsAlert) {
          showPermissionDeniedAlert();
        }
        return false;
      }
      return true;
    } else {
      // Check all permissions
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
  }

  try {
    console.log(`${LOG_PREFIX.HEALTHKIT} Initializing Health Connect...`);
    
    // Step 1: Initialize Health Connect
    const initialized = await HealthConnect.initialize();
    
    if (!initialized) {
      console.error(`${LOG_PREFIX.HEALTHKIT} Health Connect initialization failed`);
      if (showSettingsAlert) {
        showHealthConnectNotInstalledModal();
      }
      return false;
    }

    console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect initialized, requesting permissions...`);

    // Step 2: Request permissions - only request the specific type if provided
    const permissions: Array<{ accessType: 'read'; recordType: string }> = [];
    
    if (type === "steps") {
      permissions.push({ accessType: 'read' as const, recordType: 'Steps' });
    } else if (type === "sleep") {
      permissions.push({ accessType: 'read' as const, recordType: 'SleepSession' });
    } else {
      // Request both if no type specified
      permissions.push(
        { accessType: 'read' as const, recordType: 'Steps' },
        { accessType: 'read' as const, recordType: 'SleepSession' }
      );
    }

    const grantedPermissions = await HealthConnect.requestPermission(permissions);
    
    console.log(`${LOG_PREFIX.HEALTHKIT} Permission request result:`, grantedPermissions);

    // Check if we got the required permissions
    if (type === "steps") {
      const hasStepsPermission = grantedPermissions.some(
        (p: any) => p.recordType === 'Steps' && p.accessType === 'read'
      );
      if (!hasStepsPermission) {
        permissionDenied = true;
        if (showSettingsAlert) {
          showPermissionDeniedAlert();
        }
        return false;
      }
    } else if (type === "sleep") {
      const hasSleepPermission = grantedPermissions.some(
        (p: any) => p.recordType === 'SleepSession' && p.accessType === 'read'
      );
      if (!hasSleepPermission) {
        permissionDenied = true;
        if (showSettingsAlert) {
          showPermissionDeniedAlert();
        }
        return false;
      }
    } else {
      // Check both permissions
      const hasStepsPermission = grantedPermissions.some(
        (p: any) => p.recordType === 'Steps' && p.accessType === 'read'
      );
      const hasSleepPermission = grantedPermissions.some(
        (p: any) => p.recordType === 'SleepSession' && p.accessType === 'read'
      );
      if (!hasStepsPermission && !hasSleepPermission) {
        permissionDenied = true;
        if (showSettingsAlert) {
          showPermissionDeniedAlert();
        }
        return false;
      }
    }

    // Verify permissions by checking if we can access data
    if (type) {
      const hasPermission = await checkPermissionsStatus(type);
      if (!hasPermission) {
        permissionDenied = true;
        if (showSettingsAlert) {
          showPermissionDeniedAlert();
        }
        return false;
      }
    } else {
      const hasPermissions = await checkPermissionsGranted();
      if (!hasPermissions) {
        permissionDenied = true;
        if (showSettingsAlert) {
          showPermissionDeniedAlert();
        }
        return false;
      }
    }

    isInitialized = true;
    permissionDenied = false;
    console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect initialized and permissions granted`);
    return true;
    
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Health Connect init exception:`, error);
    permissionDenied = true;
    if (showSettingsAlert) {
      showPermissionDeniedAlert();
    }
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
  if (!isHealthConnectAvailable()) return false;

  try {
    // Try to read today's steps AND sleep as a test
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    
    let canReadSteps = false;
    let canReadSleep = false;
    
    // Test Steps permission
    try {
      const { records: stepRecords } = await HealthConnect.readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: now.toISOString(),
        },
      });
      canReadSteps = true;
      console.log(`${LOG_PREFIX.HEALTHKIT} Steps permission verified (${stepRecords?.length || 0} records)`);
    } catch (error: any) {
      const errorStr = String(error).toLowerCase();
      if (errorStr.includes('denied') || errorStr.includes('authorization') || errorStr.includes('permission')) {
        console.log(`${LOG_PREFIX.HEALTHKIT} Steps permission denied`);
      } else {
        // Other error - might still have permission, just no data
        canReadSteps = true;
        console.log(`${LOG_PREFIX.HEALTHKIT} Steps access error (might be ok):`, error);
      }
    }
    
    // Test Sleep permission
    try {
      const { records: sleepRecords } = await HealthConnect.readRecords('SleepSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: now.toISOString(),
        },
      });
      canReadSleep = true;
      console.log(`${LOG_PREFIX.HEALTHKIT} Sleep permission verified (${sleepRecords?.length || 0} records)`);
    } catch (error: any) {
      const errorStr = String(error).toLowerCase();
      if (errorStr.includes('denied') || errorStr.includes('authorization') || errorStr.includes('permission')) {
        console.log(`${LOG_PREFIX.HEALTHKIT} Sleep permission denied:`, error);
      } else {
        // Other error - might still have permission, just no data
        canReadSleep = true;
        console.log(`${LOG_PREFIX.HEALTHKIT} Sleep access error (might be ok):`, error);
      }
    }
    
    // Return true if we can read at least one type
    const hasPermissions = canReadSteps || canReadSleep;
    console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect permissions check: Steps=${canReadSteps}, Sleep=${canReadSleep}, Overall=${hasPermissions}`);
    return hasPermissions;
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error checking Health Connect permissions:`, error);
    return false;
  }
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
  if (!isHealthConnectAvailable()) return false;

  try {
    // Try to read data for the specific type
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    
    const recordType = type === "steps" ? "Steps" : "SleepSession";
    
    try {
      const { records } = await HealthConnect.readRecords(recordType, {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: now.toISOString(),
        },
      });
      console.log(`${LOG_PREFIX.HEALTHKIT} ${type} permission verified, found ${records?.length || 0} records`);
      return true;
    } catch (error: any) {
      const errorStr = String(error).toLowerCase();
      console.log(`${LOG_PREFIX.HEALTHKIT} ${type} permission check error:`, error);
      if (errorStr.includes('denied') || errorStr.includes('authorization') || errorStr.includes('permission')) {
        console.log(`${LOG_PREFIX.HEALTHKIT} ${type} permission is denied`);
        return false;
      }
      // Other error - assume permission is granted (might just be no data)
      console.log(`${LOG_PREFIX.HEALTHKIT} ${type} access error (assuming permission granted):`, error);
      return true;
    }
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
    "5. Turn ON 'Steps' and 'Sleep' permissions\n" +
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
    "• Turn ON 'Sleep' permission\n\n" +
    "STEP 3: Return to App\n" +
    "• Come back to iness app\n" +
    "• Tap 'Continue' to sync your data\n\n" +
    "Alternative: Settings App\n" +
    "• Open Settings → Apps → Health Connect\n" +
    "• Tap Permissions → Find 'iness'\n" +
    "• Enable Steps and Sleep",
    [
      { text: "Got it", style: "default" },
      {
        text: "Open Health Connect App",
        onPress: async () => {
          try {
            const healthConnectPackage = "com.google.android.apps.healthdata";
            await Linking.openURL(`package:${healthConnectPackage}`);
          } catch (error) {
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
    
    try {
      const canOpenPackage = await Linking.canOpenURL(packageIntent);
      if (canOpenPackage) {
        await Linking.openURL(packageIntent);
        return true;
      }
    } catch (e: any) {
      // Continue to next method
    }
    
    // Fallback to general settings
    try {
      await Linking.openSettings();
      return false;
    } catch (error: any) {
      return false;
    }
  } catch (error: any) {
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
  if (!isHealthConnectAvailable()) return 0;

  const initialized = await initializeHealthConnect();
  if (!initialized) return 0;

  const { startOfDay, endOfDay } = getTodayDateRange();

  try {
    const { records } = await HealthConnect.readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: endOfDay.toISOString(),
      },
    });

    // Sum all step counts for today
    const totalSteps = records.reduce((sum: number, record: any) => {
      return sum + (record.count || 0);
    }, 0);

    return Math.round(totalSteps);
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error getting Health Connect steps:`, error);
    return 0;
  }
}

/**
 * Get today's sleep duration in hours
 */
export async function getTodaySleep(): Promise<number> {
  if (!isHealthConnectAvailable()) return 0;

  const initialized = await initializeHealthConnect();
  if (!initialized) return 0;

  const { startOfDay, endOfDay } = getTodayDateRange();

  try {
    console.log(`${LOG_PREFIX.HEALTHKIT} Fetching sleep data from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    const { records } = await HealthConnect.readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: endOfDay.toISOString(),
      },
    });

    console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect returned ${(records || []).length} sleep sessions`);
    
    if (records && records.length > 0) {
      console.log(`${LOG_PREFIX.HEALTHKIT} Sample sleep record:`, JSON.stringify(records[0], null, 2));
    }

    const totalHours = calculateTotalSleepHours(records || []);
    console.log(`${LOG_PREFIX.HEALTHKIT} Calculated total sleep hours: ${totalHours}`);
    
    return totalHours;
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error getting Health Connect sleep:`, error);
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error(`${LOG_PREFIX.HEALTHKIT} Sleep error details:`, error.message, error.stack);
    }
    return 0;
  }
}

/**
 * Get historical step data for a date range
 */
export async function getHistoricalSteps(
  startDate: Date,
  endDate: Date
): Promise<HealthDataEntry[]> {
  if (!isHealthConnectAvailable()) return [];

  const initialized = await initializeHealthConnect();
  if (!initialized) return [];

  try {
    console.log(`[DEBUG] Fetching Health Connect steps for sync - Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const { records } = await HealthConnect.readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    console.log(`[DEBUG] Health Connect returned ${(records || []).length} raw samples for sync date range`);

    // Aggregate by date to get daily totals
    const data = aggregateStepsByDate(records || []);
    
    console.log(`[DEBUG] After aggregation: ${data.length} Health Connect entries`);
    
    return data;
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error getting historical Health Connect steps:`, error);
    return [];
  }
}

/**
 * Get historical sleep data for a date range
 */
export async function getHistoricalSleep(
  startDate: Date,
  endDate: Date
): Promise<HealthDataEntry[]> {
  if (!isHealthConnectAvailable()) return [];

  const initialized = await initializeHealthConnect();
  if (!initialized) return [];

  try {
    console.log(`${LOG_PREFIX.HEALTHKIT} Fetching historical sleep from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const { records } = await HealthConnect.readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    console.log(`${LOG_PREFIX.HEALTHKIT} Health Connect returned ${(records || []).length} sleep sessions for historical data`);
    
    if (records && records.length > 0) {
      console.log(`${LOG_PREFIX.HEALTHKIT} Sample historical sleep record:`, JSON.stringify(records[0], null, 2));
    } else {
      console.warn(`${LOG_PREFIX.HEALTHKIT} No sleep records found in Health Connect for the specified date range`);
    }

    // Aggregate sleep by date
    const data = aggregateSleepByDate(records || [], startDate);
    
    console.log(`${LOG_PREFIX.HEALTHKIT} Aggregated ${data.length} sleep entries`);
    
    return data;
  } catch (error) {
    console.error(`${LOG_PREFIX.HEALTHKIT} Error getting historical Health Connect sleep:`, error);
    // Log full error details
    if (error instanceof Error) {
      console.error(`${LOG_PREFIX.HEALTHKIT} Historical sleep error details:`, error.message, error.stack);
    }
    return [];
  }
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

function calculateTotalSleepHours(sessions: any[]): number {
  let totalHours = 0;

  if (!sessions || sessions.length === 0) {
    console.log(`${LOG_PREFIX.HEALTHKIT} No sleep sessions provided`);
    return 0;
  }

  sessions.forEach((session, index) => {
    // Health Connect SleepSession can have different field names
    // Try multiple possible field names
    const startTime = session.startTime || session.startDate || session.time;
    const endTime = session.endTime || session.endDate;
    
    if (startTime && endTime) {
      try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn(`${LOG_PREFIX.HEALTHKIT} Invalid date in sleep session ${index}:`, session);
          return;
        }
        
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        if (duration > 0 && duration < 24) { // Reasonable sleep duration check
          totalHours += duration;
          console.log(`${LOG_PREFIX.HEALTHKIT} Sleep session ${index}: ${duration.toFixed(2)} hours (${start.toISOString()} to ${end.toISOString()})`);
        } else {
          console.warn(`${LOG_PREFIX.HEALTHKIT} Suspicious sleep duration ${duration} hours in session ${index}`);
        }
      } catch (dateError) {
        console.error(`${LOG_PREFIX.HEALTHKIT} Error parsing sleep session ${index}:`, dateError, session);
      }
    } else {
      console.warn(`${LOG_PREFIX.HEALTHKIT} Sleep session ${index} missing time fields:`, Object.keys(session));
    }
  });

  const rounded = Math.round(totalHours * 10) / 10;
  console.log(`${LOG_PREFIX.HEALTHKIT} Total sleep hours calculated: ${rounded} (from ${sessions.length} sessions)`);
  return rounded;
}

/**
 * Aggregate sleep sessions by date (sum all sleep for each day)
 */
function aggregateSleepByDate(sessions: any[], minDate?: Date): HealthDataEntry[] {
  const sleepByDate: Record<string, number> = {};

  if (!sessions || sessions.length === 0) {
    console.log(`${LOG_PREFIX.HEALTHKIT} No sleep sessions to aggregate`);
    return [];
  }

  sessions.forEach((session, index) => {
    // Health Connect SleepSession can have different field names
    const startTime = session.startTime || session.startDate || session.time;
    const endTime = session.endTime || session.endDate;
    
    if (startTime && endTime) {
      try {
        const start = new Date(startTime);
        
        // Validate date
        if (isNaN(start.getTime())) {
          console.warn(`${LOG_PREFIX.HEALTHKIT} Invalid start date in sleep session ${index}`);
          return;
        }
        
        // If minDate is provided, only include sessions that start after that time
        if (minDate && start < minDate) {
          return; // Skip this session
        }
        
        const end = new Date(endTime);
        if (isNaN(end.getTime())) {
          console.warn(`${LOG_PREFIX.HEALTHKIT} Invalid end date in sleep session ${index}`);
          return;
        }
        
        // Use local date (YYYY-MM-DD) to match backend normalization
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, '0');
        const day = String(start.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        if (duration > 0 && duration < 24) { // Reasonable sleep duration
          sleepByDate[dateKey] = (sleepByDate[dateKey] || 0) + duration;
        }
      } catch (error) {
        console.error(`${LOG_PREFIX.HEALTHKIT} Error processing sleep session ${index}:`, error);
      }
    } else {
      console.warn(`${LOG_PREFIX.HEALTHKIT} Sleep session ${index} missing time fields. Available keys:`, Object.keys(session));
    }
  });

  const result = Object.entries(sleepByDate).map(([date, hours]) => {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const totalValue = Math.round(hours * 10) / 10;
    return {
      date: localDate.toISOString(),
      value: totalValue,
      totalHealthKitValue: totalValue, // For Health Connect, same as value
    };
  });

  console.log(`${LOG_PREFIX.HEALTHKIT} Aggregated ${result.length} sleep entries from ${sessions.length} sessions`);
  return result;
}

/**
 * Aggregate step records by date (sum all steps for each day)
 */
function aggregateStepsByDate(records: any[], minDate?: Date): HealthDataEntry[] {
  const stepsByDate: Record<string, number> = {};

  records.forEach((record) => {
    // Health Connect Steps records have startTime, endTime, and count
    const timeStr = record.startTime || record.time || record.endTime;
    if (timeStr && record.count !== undefined) {
      const date = new Date(timeStr);
      
      // If minDate is provided, only include records after that time
      if (minDate && date < minDate) {
        return; // Skip this record
      }
      
      // Use local date (YYYY-MM-DD) to match backend normalization
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      stepsByDate[dateKey] = (stepsByDate[dateKey] || 0) + (record.count || 0);
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
