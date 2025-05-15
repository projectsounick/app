import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const transformatiomImageService = {
  getTransformationImages,
  addTransformationImages,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getTransformationImages(): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.get(`${baseUrl}/get-transformationImages`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

async function addTransformationImages(
  data: {
    url: string;
    date: any;
  }[]
): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.post(`${baseUrl}/add-transformationImage`, { data });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}
