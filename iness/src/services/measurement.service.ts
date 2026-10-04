import { fetchWrapper } from "../helpers/fetchWrapper";
import {
  ApiResponseInterface,
  UserMeasurement,
} from "../interfaces/otherInterfaces";
import { config } from "../shared/config";

type MeasurementPayload = {
  chest?: number;
  waist?: number;
  thigh?: number;
  armSizeLeft?: number;
  armSizeRight?: number;
};

export const measurementunitsService = {
  getMeasurementUnits,
  createMeasurementUnits,
};

async function getMeasurementUnits(
  userId?: string
): Promise<ApiResponseInterface<UserMeasurement | null>> {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return fetchWrapper.get(`${config.apiUrl}/api/get-measurementunits${query}`);
}

async function createMeasurementUnits(
  data: MeasurementPayload
): Promise<ApiResponseInterface<UserMeasurement>> {
  return fetchWrapper.post(`${config.apiUrl}/api/add-measurementunits`, {
    ...data,
  });
}
