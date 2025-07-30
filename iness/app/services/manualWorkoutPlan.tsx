import { config } from "../shared/config";

import { fetchWrapper } from "../helpers/fetchWrapper";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

//// Exporting the functions of accountService------------------------------------------------------------/
export const manualWorkoutPlanService = {
  getUserActiveManualPlan,
};

async function getUserActiveManualPlan(): Promise<{
  message: string;
  data: any;
  success: boolean;
}> {
  const query: string[] = [];
  let status = true;
  let userData = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
  let userId;
  if (userData.exists) {
    userId = userData.data._id;
  }
  console.log(userId);
  if (status !== undefined) query.push(`status=${status}`);
  if (userId != undefined) query.push(`userId=${userId}`);
  const queryString = query.length > 0 ? `?${query.join("&")}` : "";
  const url = `${config.apiUrl}/api/get-user-workoutplan${queryString}`;

  return fetchWrapper.get(url);
}
