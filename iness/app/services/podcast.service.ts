import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { PAGINATION_LIMITS } from "../shared/paginationLimits";
import { fetchWrapper } from "../helpers/fetchWrapper";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const podCastService = {
  getPodcasts,
  getPodcastsPaginated,
  updatePodcasts,
};

//// Function for fetching initial podcasts ---------------------/
async function getPodcasts(): Promise<ApiResponseInterface> {
  try {
    // Fetch initial podcasts using limit from config
    let response = await fetchWrapper.get(`${baseUrl}/get-podcasts?limit=${PAGINATION_LIMITS.PODCAST_INITIAL}`);

    console.log("Initial podcasts fetched:", response.data?.length || 0);
    return response;
  } catch (error: any) {
    throw new Error("Error fetching podcasts: " + error.message);
  }
}

//// Function for fetching podcasts with cursor-based pagination ---------/
async function getPodcastsPaginated(
  lastId?: string,
  limit: number = PAGINATION_LIMITS.PODCAST_LOAD_MORE
): Promise<ApiResponseInterface> {
  try {
    const params = lastId 
      ? `?lastId=${lastId}&limit=${limit}`
      : `?limit=${limit}`;
    
    let response = await fetchWrapper.get(`${baseUrl}/get-podcasts${params}`);

    console.log("Paginated podcasts fetched:", response.data?.length || 0);
    return response;
  } catch (error: any) {
    throw new Error("Error fetching podcasts: " + error.message);
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
