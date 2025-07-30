import { config } from "../shared/config";

import { fetchWrapper } from "../helpers/fetchWrapper";
import { CouponInterface } from "../interfaces/otherInterfaces";

//// Exporting the functions of accountService------------------------------------------------------------/
export const measurementunitsService = {
  getMeasurementUnits,
  createMeasurementUnits,
};

///// Function for getting all the prodcuts based on category--------/

async function getMeasurementUnits(): Promise<{
  message: String;
  data: CouponInterface[];
  success: boolean;
}> {
  return fetchWrapper.get(`${config.apiUrl}/api/get-measurementunits`);
}

///// Function for adding new coupons -------------------------------/
async function createMeasurementUnits(data: any): Promise<{
  message: String;
  data: CouponInterface;
  success: boolean;
}> {
  return fetchWrapper.post(`${config.apiUrl}/api/add-measurementunits`, {
    ...data,
  });
}
