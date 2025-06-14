import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";

const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const blogService = {
  getBlogOverallData,
  fetchIndividualBlog,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getBlogOverallData(): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.get(`${baseUrl}/get-blogs-overalldata`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

//// Funciton for for fetching individual blog details----/
async function fetchIndividualBlog(id: any): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.get(`${baseUrl}/fetch-blogs?id=${id}`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
