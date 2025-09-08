import { config } from "../shared/config";

import { fetchWrapper } from "../helpers/fetchWrapper";
import { CouponInterface } from "../interfaces/otherInterfaces";

//// Exporting the functions of accountService------------------------------------------------------------/
export const paymentService = {
  getReciptData,
  getMerchentId,
  getTotalPurchaseHistory,
};

///// Function for getting all the prodcuts based on category--------/

async function getReciptData({ orderId }: any): Promise<{
  message: String;
  receipt: string;
  success: boolean;
}> {
  return fetchWrapper.get(
    `${config.apiUrl}/api/get-payment-recipt?orderId=${orderId}`
  );
}

///// Funciton for getting the merchent id ---------------------------------/
async function getMerchentId() {
  return fetchWrapper.get(`${config.apiUrl}/api/get-phonepe-merchent`);
}

///// Funtion for getting all the order made by the user -------------------/.
async function getTotalPurchaseHistory() {
  return fetchWrapper.get(`${config.apiUrl}/api/get-orders`);
}
