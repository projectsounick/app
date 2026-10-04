import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
import Constants from "expo-constants";
import { Platform } from "react-native";

const clientHeaders = {
  "X-API-Version": "2",
  "X-App-Version": Constants.expoConfig?.version || "unknown",
  "X-App-Platform": Platform.OS,
};

type RequestTimeoutOptions = {
  timeoutMs?: number;
};

let refreshPromise: Promise<any> | null = null;

async function executeWithTimeout(
  url: string,
  requestOptions: RequestInit,
  options: RequestTimeoutOptions = {}
) {
  const timeoutMs = options.timeoutMs ?? 30000;
  if (timeoutMs <= 0) {
    return handleResponseWithRetry(url, requestOptions);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await handleResponseWithRetry(url, {
      ...requestOptions,
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("The request timed out. Please check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponseWithRetry(
  url: string,
  requestOptions: RequestInit,
  retryOnce = true
): Promise<any> {
  return fetch(url, requestOptions).then(async (response) => {
    const text = await response.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (_error) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      if (response.status === 401 && retryOnce) {
        // try to refresh token and retry request
        const userObj =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        const userId = userObj?.data?._id;

        if (userId) {
          if (!refreshPromise) {
            refreshPromise = userService
              .generateRefreshToken(userId)
              .finally(() => {
                refreshPromise = null;
              });
          }
          const refreshResult = await refreshPromise;

          if (refreshResult.success) {
            const newAccessToken = refreshResult.accessToken;
            await asyncStorageUtils.updateUserAccessToken(
              newAccessToken,
              refreshResult.refreshToken,
              refreshResult.refreshTokenExpiresAt
            );

            // Get new auth header after token update
            const newAuthHeader = await getAuthHeader();
            const updatedOptions = {
              ...requestOptions,
              headers: {
                ...requestOptions.headers,
                ...newAuthHeader,
                ...clientHeaders,
              },
            };

            // Retry original request with updated access token
            return handleResponseWithRetry(url, updatedOptions, false);
          }
        }
      }

      const error = (data && data.message) || response.statusText;
      throw new Error(error || `Request failed with status ${response.status}`);
    }

    return data;
  });
}
export const fetchWrapper = {
  download,
  get,
  post,
  put,
  delete: _delete,
};
async function getAuthHeader(): Promise<{ [key: string]: string }> {
  try {
    const response =
      await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
    let user;

    if (response.exists) {
      user = response.data;
    }

    const token = user?.jwtToken || user?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (_error) {
    return {};
  }
}

async function get(url: string, options: RequestTimeoutOptions = {}) {
  const authHeader = await getAuthHeader();

  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...clientHeaders,
      ...authHeader,
    },
  };

  return executeWithTimeout(url, requestOptions, options);
}

async function download(url: string) {
  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...clientHeaders,
    },
  };

  let response = await fetch(url, requestOptions);

  return response;
}

async function post<T extends object>(
  url: string,
  body: T,
  options: RequestTimeoutOptions = {}
) {
  const authHeader = await getAuthHeader();

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...clientHeaders,
      ...authHeader,
    },
    body: JSON.stringify(body),
  };

  try {
    const response = await executeWithTimeout(url, requestOptions, options);
    return response;
  } catch (error: any) {
    throw error;
  }
}

async function put<T extends object>(
  url: string,
  body: T,
  options: RequestTimeoutOptions = {}
) {
  const authHeader = await getAuthHeader();

  const requestOptions: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...clientHeaders,
      ...authHeader,
    },
    body: JSON.stringify(body),
  };

  return executeWithTimeout(url, requestOptions, options);
}

// prefixed with underscore because 'delete' is a reserved word
async function _delete(url: string, options: RequestTimeoutOptions = {}) {
  const authHeader = await getAuthHeader();

  const requestOptions: RequestInit = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...clientHeaders,
      ...authHeader,
    },
  };

  return executeWithTimeout(url, requestOptions, options);
}
