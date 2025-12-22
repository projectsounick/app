import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const trackService = {
  getTrackingData,
  updateTrackingData,
  getCurrentDayTrackData,
  syncHealthData,
  getHealthSyncStatus,
  disableHealthSync,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getTrackingData(
  type: string,
  startDate: string,
  endDate: string
): Promise<ApiResponseInterface> {
  const url = `${baseUrl}/get-tracking/${type}?startDate=${startDate}&endDate=${endDate}`;
  return await fetchWrapper.get(url);
}
async function getCurrentDayTrackData(): Promise<ApiResponseInterface> {
  const today = new Date();
  const currentDate = today.toLocaleDateString("en-CA");
  // e.g. "2025-08-27"

  const url = `${baseUrl}/get-currentday-tracking?day=${currentDate}`;
  return await fetchWrapper.get(url);
}

async function updateTrackingData(
  value: any,
  date: any,
  type: string
): Promise<ApiResponseInterface> {
  const url = `${baseUrl}/create-tracking/${type}`;
  return await fetchWrapper.post(url, { value, date });
}

/**
 * Sync health data from device (iOS/Android)
 * @param data - Steps and/or sleep data to sync
 * @param platform - "ios" or "android"
 * @param timezoneOffset - User's timezone offset in minutes (e.g., -300 for EST, +330 for IST)
 */
async function syncHealthData(
  data: { steps?: Array<{ date: string; value: number }>; sleep?: Array<{ date: string; value: number }> },
  platform: "ios" | "android" = "ios",
  timezoneOffset?: number
): Promise<ApiResponseInterface> {
  const url = `${baseUrl}/sync-health-data`;
  return await fetchWrapper.post(url, { action: "sync", data, platform, timezoneOffset });
}

/**
 * Get user's health sync status
 */
async function getHealthSyncStatus(): Promise<ApiResponseInterface> {
  const url = `${baseUrl}/sync-health-data`;
  return await fetchWrapper.post(url, { action: "status" });
}

/**
 * Disable health sync for a specific type
 */
async function disableHealthSync(type: "steps" | "sleep"): Promise<ApiResponseInterface> {
  const url = `${baseUrl}/sync-health-data`;
  return await fetchWrapper.post(url, { action: "disable", type });
}
