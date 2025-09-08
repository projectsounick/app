import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const trackService = {
  getTrackingData,
  updateTrackingData,
  getCurrentDayTrackData,
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
