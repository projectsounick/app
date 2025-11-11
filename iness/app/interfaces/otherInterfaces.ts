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
export interface ComplaintInterface {
  complainType: string;
  complainerId: string;
  complainedId?: string;
  postId?: string;
  medianName?: string;
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
export interface Service {
  _id: string;
  title: string;
  descItems: string[];
  imgUrl: string;
  otherImages: string[];
  price: number;
  isOnline: boolean;
  isCorporate: boolean;
  sessionCount: number;
  isActive: boolean;
  createdAt: string; // ISO date string when coming from API
  updatedAt: string; // ISO date string when coming from API
}
// Define interface for Streak
export interface StreakInterface {
  userId: string;
  streaks: Date[];
  totalStreak: number;
  updatedAt: Date;
  fetched?: boolean;
}
interface StorageAccountDetailsInterface {}
export type {
  ApiResponseInterface,
  AsyncStorageCheckResult,
  CouponInterface,
  totalStoreStateInterface,
};
