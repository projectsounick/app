import { config } from "../shared/config";

import { fetchWrapper } from "../helpers/fetchWrapper";

//// Exporting the functions of accountService------------------------------------------------------------/
export const notificationService = {
  createNotification,
  addUserNotification,
  getNotification,
  deleteNotification,
};

///// Function for adding new coupons -------------------------------/
async function createNotification(data: any): Promise<{
  message: String;

  success: boolean;
}> {
  return fetchWrapper.post(`${config.apiUrl}/api/send-panel-notification`, {
    ...data,
  });
}

///// Function for adding user notifications (video calls, etc) -------------------------------/
async function addUserNotification(data: any): Promise<{
  message: String;

  success: boolean;
}> {
  return fetchWrapper.post(`${config.apiUrl}/api/add-notification`, {
    data,
  });
}
///// Function for fetching the notifications -------------------------------/
async function getNotification(): Promise<{
  message: String;

  success: boolean;
  data: any[];
}> {
  return fetchWrapper.get(`${config.apiUrl}/api/get-user-notification`);
}

///// Function for fetching the notifications -------------------------------/
async function deleteNotification(notificationId: string): Promise<{
  message: String;

  success: boolean;
  data: any[];
}> {
  return fetchWrapper.delete(
    `${config.apiUrl}/api/delete-notification/${notificationId}`
  );
}
