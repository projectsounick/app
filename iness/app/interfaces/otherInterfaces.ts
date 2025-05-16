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
interface StorageAccountDetailsInterface {}
export type { ApiResponseInterface, AsyncStorageCheckResult, CouponInterface };
