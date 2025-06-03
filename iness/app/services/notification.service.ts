import { config } from "../shared/config";

import { fetchWrapper } from "../helpers/fetchWrapper";

//// Exporting the functions of accountService------------------------------------------------------------/
export const notificationService = { createNotification };

///// Function for adding new coupons -------------------------------/
async function createNotification(data: any): Promise<{
  message: String;

  success: boolean;
}> {
  return fetchWrapper.post(`${config.apiUrl}/api/send-panel-notification`, {
    ...data,
  });
}
