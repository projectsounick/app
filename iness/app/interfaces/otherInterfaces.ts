import { PlanInterface } from "./planInterface";
import { PodcastInterface } from "./podcastsInterface";

interface ApiResponseInterface<T = any> {
  message: string;
  success: boolean;
  statusCode: number;
  data: T;
}

interface AsyncStorageCheckResult<T> {
  data: T | null;
  exists: boolean;
}
interface CouponInterface {
  _id: string;
  title: string;
  description: string;
  code: string;
  assignedUsers: string[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
interface totalStoreStateInterface {
  mediaItems: PodcastInterface[];
  plans: PlanInterface;
}
export interface MeasurementEntry {
  date: Date;
  chest?: number;
  waist?: number;
  thigh?: number;
  armSizeLeft?: number;
  armSizeRight?: number;
}

export interface UserMeasurement {
  userId: string; // or use a more specific type if needed
  measurementUnits: MeasurementEntry[];
  createdAt: Date;
  updatedAt: Date;
}
export interface DiscountCoupon {
  _id?: string; // optional if needed
  name: string;
  code: string;
  discountPrice: number;
  totalUsage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StorageAccountDetailsInterface {}
export type {
  ApiResponseInterface,
  AsyncStorageCheckResult,
  CouponInterface,
  totalStoreStateInterface,
};
