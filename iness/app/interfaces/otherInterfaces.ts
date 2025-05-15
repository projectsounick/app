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

interface StorageAccountDetailsInterface {}
export type { ApiResponseInterface, AsyncStorageCheckResult };
