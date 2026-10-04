import { config } from "../shared/config";

import { fetchWrapper } from "../helpers/fetchWrapper";
import { CouponInterface } from "../interfaces/otherInterfaces";

//// Exporting the functions of accountService------------------------------------------------------------/
export const couponService = { getAllCoupons, createCoupon };

///// Function for getting all the prodcuts based on category--------/

async function getAllCoupons(): Promise<{
  message: String;
  data: CouponInterface[];
  success: boolean;
}> {

  return fetchWrapper.get(`${config.apiUrl}/api/get-coupon`);
}

///// Function for adding new coupons -------------------------------/
async function createCoupon(data: any): Promise<{
  message: String;
  data: CouponInterface;
  success: boolean;
}> {
  return fetchWrapper.post(`${config.apiUrl}/api/add-coupon`, { data });
}
