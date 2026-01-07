import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
async function handleResponseWithRetry(
  url: string,
  requestOptions: RequestInit,
  retryOnce = true
): Promise<any> {
  return fetch(url, requestOptions).then(async (response) => {
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      if (response.status === 401 && retryOnce) {
        // try to refresh token and retry request
        const userObj =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        const userId = userObj?.data?._id;

        if (userId) {
          const refreshResult = await userService.generateRefreshToken(userId);

          if (refreshResult.success) {
            const newAccessToken = refreshResult.accessToken;
            await asyncStorageUtils.updateUserAccessToken(newAccessToken);

            // Get new auth header after token update
            const newAuthHeader = await getAuthHeader();
            const updatedOptions = {
              ...requestOptions,
              headers: {
                ...requestOptions.headers,
                ...newAuthHeader,
              },
            };

            // Retry original request with updated access token
            return handleResponseWithRetry(url, updatedOptions, false);
          }
        }
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
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

    return user?.jwtToken ? { Authorization: `Bearer ${user.jwtToken}` } : {};
  } catch (error) {
    console.error("Failed to get auth header", error);
    return {};
  }
}

async function get(url: string) {
  const authHeader = await getAuthHeader();

  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  };

  return handleResponseWithRetry(url, requestOptions);
}

async function download(url: string) {
  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let response = await fetch(url, requestOptions);

  return response;
}

async function post<T extends object>(url: string, body: T) {
  const authHeader = await getAuthHeader();

  // Log request details
  console.log("=== FetchWrapper POST Request ===");
  console.log("URL:", url);
  console.log("Request Body:", JSON.stringify(body, null, 2));
  console.log("Request Body (parsed):", body);
  console.log("Has Auth Header:", !!authHeader.Authorization);
  console.log("Timestamp:", new Date().toISOString());

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(body),
  };

  console.log("Request Options:", {
    method: requestOptions.method,
    headers: requestOptions.headers,
    bodyLength: requestOptions.body?.length || 0,
  });

  try {
    const response = await handleResponseWithRetry(url, requestOptions);
    console.log("=== FetchWrapper POST Response ===");
    console.log("URL:", url);
    console.log("Response Success:", response?.success);
    console.log("Response Message:", response?.message);
    console.log("Response Data exists:", !!response?.data);
    console.log("Full Response:", JSON.stringify(response, null, 2));
    return response;
  } catch (error: any) {
    console.error("=== FetchWrapper POST Error ===");
    console.error("URL:", url);
    console.error("Request Body:", JSON.stringify(body, null, 2));
    console.error("Error:", error);
    console.error("Error Message:", error?.message);
    throw error;
  }
}

async function put<T extends object>(url: string, body: T) {
  const authHeader = await getAuthHeader();

  const requestOptions: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(body),
  };

  return handleResponseWithRetry(url, requestOptions);
}

// prefixed with underscore because 'delete' is a reserved word
async function _delete(url: string) {
  const authHeader = await getAuthHeader();

  const requestOptions: RequestInit = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  };

  return handleResponseWithRetry(url, requestOptions);
}

function handleResponse(response: Response) {
  return response.text().then((text) => {
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}
