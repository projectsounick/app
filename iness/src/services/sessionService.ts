import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { ChatMessage } from "../interfaces/chatInterface";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const sessionService = {
  getSessions,
  updateSession,
  getServices,
  getSessionsWithDate,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getSessions(
  activePlanId?: string,
  activeServiceId?: string
): Promise<ApiResponseInterface> {
  try {
    let url = `${baseUrl}/get-sessions`;
    if (activePlanId) {
      url += `?activePlanId=${encodeURIComponent(activePlanId)}`;
    }
    if (activeServiceId) {
      url += `?activeServiceId=${encodeURIComponent(activeServiceId)}`;
    }
    if (activePlanId || activeServiceId) {
      url += `&isActive=${encodeURIComponent("true")}`;
    } else {
      url += `?isActive=${encodeURIComponent("true")}`;
    }

    let data = await fetchWrapper.get(url);
   
    return data;
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getSessionsWithDate(
  startDate: any,
  endDate: any
): Promise<ApiResponseInterface> {
  try {
    let url = `${baseUrl}/get-sessions`;
    const params: string[] = [];

    if (startDate) {
      params.push(`startDate=${encodeURIComponent(startDate)}`);
    }
    if (endDate) {
      params.push(`endDate=${encodeURIComponent(endDate)}`);
    }

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const data = await fetchWrapper.get(url);
    return data;
  } catch (error: any) {
    throw new Error("Error fetching sessions: " + error.message);
  }
}

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getServices(): Promise<ApiResponseInterface> {
  try {
    let data = await fetchWrapper.get(`${baseUrl}/get-active-services`);

    return data;
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

////// Function for updating the session ---------------------------------/
async function updateSession(payload: any) {
  try {
    const { sessionId, data } = payload;
    return fetchWrapper.put(`${baseUrl}/update-session/${sessionId}`, {
      ...data,
    });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
