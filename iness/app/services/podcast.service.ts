import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const podCastService = {
  getPodcasts,
  updatePodcasts,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getPodcasts(): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.get(`${baseUrl}/get-podcasts`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

async function updatePodcasts(data: {
  podcastId: string;
  userName: string;
  comment: string | null;
}): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.put(`${baseUrl}/add-podcast-interaction`, { data });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
