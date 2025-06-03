import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

export const fetchWrapper = {
  download,
  get,
  post,
  put,
  delete: _delete,
};
async function getAuthHeader(): Promise<{ [key: string]: string }> {
  try {
    const response = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
      "user"
    );
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

  return fetch(url, requestOptions).then(handleResponse);
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
  try {
    const authHeader = await getAuthHeader();
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(body),
    };

    let response = await fetch(url, requestOptions).then(handleResponse);

    return response; // now returning JS object
  } catch (error: any) {
    throw new Error(`Some error has happened try again later ${error.message}`);
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

  return fetch(url, requestOptions).then(handleResponse);
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

  return fetch(url, requestOptions).then(handleResponse);
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
