// src/api/httpClient.js
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://pyramidally-unborrowed-cherie.ngrok-free.dev";

// Get auth token from storage
function getAuthToken() {
  try {
    return localStorage.getItem("dinelink_access_token");
  } catch (e) {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers,
      ...options,
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (!res.ok) {
      const message =
        data?.message || data?.error || `Request failed: ${res.status}`;
      const error = new Error(message);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Network error or fetch failed
    if (!error.status) {
      console.error("Network error:", error);
      throw new Error(
        "Kết nối mạng thất bại. Vui lòng kiểm tra kết nối của bạn."
      );
    }
    throw error;
  }
}

export function httpGet(path, options = {}) {
  return request(path, { method: "GET", ...options });
}

export function httpPost(path, body, options = {}) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

export function httpPut(path, body, options = {}) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
}

export function httpDelete(path, options = {}) {
  return request(path, { method: "DELETE", ...options });
}

export function httpPatch(path, body, options = {}) {
  return request(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });
}
