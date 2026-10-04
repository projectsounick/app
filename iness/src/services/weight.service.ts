import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";

const baseUrl = `${config.apiUrl}/api`;

///// Exporting weight service functions ---------------------------------
export const weightService = {
  getWeights,
  addWeight,
  deleteWeight,
};

//// Function to fetch all weights for a user
async function getWeights(): Promise<ApiResponseInterface> {
  try {
    const response = await fetchWrapper.get(
      `${baseUrl}/user-weight?action=get`
    );
    return response;
  } catch (error: any) {
    throw new Error("Error fetching weights: " + error.message);
  }
}

//// Function to add a new weight entry
async function addWeight(data: {
  weight: number;
}): Promise<ApiResponseInterface> {
  try {
    const response = await fetchWrapper.post(
      `${baseUrl}/user-weight?action=add`,
      { data }
    );
    return response;
  } catch (error: any) {
    throw new Error("Error adding weight: " + error.message);
  }
}

//// Function to delete a weight entry
async function deleteWeight(weightId: string): Promise<ApiResponseInterface> {
  try {
    const response = await fetchWrapper.post(
      `${baseUrl}/user-weight?action=delete&weightId=${weightId}`,
      {}
    );
    return response;
  } catch (error: any) {
    throw new Error("Error deleting weight: " + error.message);
  }
}
