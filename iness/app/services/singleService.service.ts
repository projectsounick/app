import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting userservice functions --------------------------------------/
export const otherService = {
  getAvailableServices,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getAvailableServices(): Promise<ApiResponseInterface> {
  const url = `${baseUrl}/get-service?isActive=true`;
  return await fetchWrapper.get(url);
}
