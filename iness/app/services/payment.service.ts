import { config } from "../shared/config";

import { fetchWrapper } from "../helpers/fetchWrapper";
import { CouponInterface } from "../interfaces/otherInterfaces";

//// Exporting the functions of accountService------------------------------------------------------------/
export const paymentService = { getReciptData };

///// Function for getting all the prodcuts based on category--------/

async function getReciptData(orderId: any): Promise<{
  message: String;
  receipt: string;
  success: boolean;
}> {
  return fetchWrapper.get(
    `${config.apiUrl}/api/get-payment-recipt?orderId=${orderId}`
  );
}
