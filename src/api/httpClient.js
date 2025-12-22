// src/api/httpClient.js
import { nativeStorage } from "zmp-sdk/apis";

// Dùng proxy của Vite để bypass CORS
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const ACCESS_TOKEN_KEY = "dinelink_access_token";
const REFRESH_TOKEN_KEY = "dinelink_refresh_token";

// Use nativeStorage with localStorage fallback (for Miniapp)
function getStorageItem(key) {
  try {
    // nativeStorage for Zalo Mini App
    return nativeStorage.getItem(key);
  } catch (error) {
    // Fallback to localStorage for web testing
    return localStorage.getItem(key);
  }
}

function setStorageItem(key, value) {
  try {
    nativeStorage.setItem(key, value);
  } catch (error) {
    localStorage.setItem(key, value);
  }
}

function removeStorageItem(key) {
  try {
    nativeStorage.removeItem(key);
  } catch (error) {
    localStorage.removeItem(key);
  }
}

// Get auth token from storage
function getAuthToken() {
  try {
    return getStorageItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

// Get refresh token from storage
function getRefreshToken() {
  try {
    return getStorageItem(REFRESH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

// Refresh access token using refresh token
async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/common/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const result = await response.json();

    // Extract new tokens from response
    // API returns: { data: { tokens: { accessToken, refreshToken }, user: {...} } }
    const tokens = result.data.tokens || result.data; // Fallback for backward compatibility
    const { accessToken, refreshToken: newRefreshToken } = tokens;

    // Save new access token
    setStorageItem(ACCESS_TOKEN_KEY, accessToken);

    // Update refresh token (backend always returns new refresh token)
    if (newRefreshToken) {
      setStorageItem(REFRESH_TOKEN_KEY, newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    // Refresh failed - clear tokens and redirect to login
    removeStorageItem(ACCESS_TOKEN_KEY);
    removeStorageItem(REFRESH_TOKEN_KEY);
    removeStorageItem("dinelink_user_data");
    window.location.hash = "#/login";
    throw error;
  }
}

// Flag to prevent multiple refresh requests at the same time
let isRefreshing = false;
let refreshSubscribers = [];

// Add request to queue waiting for new token
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

// Notify all queued requests with new token
function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

async function request(path, options = {}) {
  const makeRequest = async (token) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    };

    const res = await fetch(`${BASE_URL}${path}`, {
      // credentials: "include", // Tắt credentials để tránh CORS với ngrok
      mode: 'cors',
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
      const error = new Error(
        data?.message || data?.error || `Request failed: ${res.status}`
      );
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  };

  try {
    const token = getAuthToken();
    return await makeRequest(token);
  } catch (error) {
    // Handle 401 Unauthorized - Token expired
    if (error.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Refresh access token
          const newToken = await refreshAccessToken();
          isRefreshing = false;

          // Notify all queued requests
          onTokenRefreshed(newToken);

          // Retry original request with new token
          return await makeRequest(newToken);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          throw refreshError;
        }
      } else {
        // Token is being refreshed, queue this request
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (newToken) => {
            try {
              const result = await makeRequest(newToken);
              resolve(result);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    }

    // Network error or other errors
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
