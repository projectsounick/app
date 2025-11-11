import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { StreakInterface } from "../interfaces/otherInterfaces";

/**
 * Create or update a user streak (adds today's streak)
 * @param userId The user ID
 */
export async function createStreak(): Promise<{
  message: string;
  data: StreakInterface | null;
  success: boolean;
}> {
  try {
    return fetchWrapper.post(`${config.apiUrl}/api/create-streaks`, {});
  } catch (error: any) {
    console.error("Error in createStreak:", error);
    return {
      success: false,
      message: "Something went wrong while creating streak.",
      data: null,
    };
  }
}

/**
 * Fetch user streak details
 * @param userId The user ID
 */
export async function fetchStreak(): Promise<{
  message: string;
  data: StreakInterface | null;
  success: boolean;
}> {
  try {
    const response = await fetchWrapper.get(
      `${config.apiUrl}/api/fetch-streaks`
    );
    console.log("streak response");
    console.log(response);
    return response;
  } catch (error: any) {
    console.error("Error in fetchStreak:", error);
    return {
      success: false,
      message: "Something went wrong while fetching streak.",
      data: null,
    };
  }
}
