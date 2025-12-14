// src/utils/authService.js
// Authentication Service - Manages tokens and auth state
import { getUserInfo, getStorage, setStorage, removeStorage } from "zmp-sdk/apis";

const ACCESS_TOKEN_KEY = "dinelink_access_token";
const REFRESH_TOKEN_KEY = "dinelink_refresh_token";
const USER_KEY = "dinelink_user_data";

class AuthService {
  constructor() {
    this.apiBaseUrl = "/api"; // Update with your backend URL
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  // ===== ZALO STORAGE HELPERS =====
  
  // Use zmp-sdk storage methods
  async getStorageData(key) {
    try {
      const { data } = await getStorage({ keys: [key] });
      return data[key] || null;
    } catch (error) {
      console.warn('Zalo storage not available, using localStorage:', error);
      return localStorage.getItem(key);
    }
  }

  async setStorageData(key, value) {
    try {
      await setStorage({ [key]: value });
      return true;
    } catch (error) {
      console.warn('Zalo storage not available, using localStorage:', error);
      localStorage.setItem(key, value);
      return true;
    }
  }

  async removeStorageData(key) {
    try {
      await removeStorage({ keys: [key] });
      return true;
    } catch (error) {
      console.warn('Zalo storage not available, using localStorage:', error);
      localStorage.removeItem(key);
      return true;
    }
  }

  // ===== TOKEN MANAGEMENT =====
  
  async getAccessToken() {
    return await this.getStorageData(ACCESS_TOKEN_KEY);
  }

  async setAccessToken(token) {
    await this.setStorageData(ACCESS_TOKEN_KEY, token);
  }

  async removeAccessToken() {
    await this.removeStorageData(ACCESS_TOKEN_KEY);
  }

  async getRefreshToken() {
    return await this.getStorageData(REFRESH_TOKEN_KEY);
  }

  async setRefreshToken(token) {
    await this.setStorageData(REFRESH_TOKEN_KEY, token);
  }

  async removeRefreshToken() {
    await this.removeStorageData(REFRESH_TOKEN_KEY);
  }

  // Legacy method for backward compatibility
  async getToken() {
    return await this.getAccessToken();
  }

  async setToken(token) {
    await this.setAccessToken(token);
  }

  async removeToken() {
    await this.removeAccessToken();
    await this.removeRefreshToken();
  }

  // ===== USER DATA MANAGEMENT =====
  
  async getUser() {
    const userData = await this.getStorageData(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  async setUser(user) {
    await this.setStorageData(USER_KEY, JSON.stringify(user));
  }

  async removeUser() {
    await this.removeStorageData(USER_KEY);
  }

  // ===== AUTH STATE =====
  
  async isAuthenticated() {
    const token = await this.getAccessToken();
    return !!token;
  }

  async isGuest() {
    return !(await this.isAuthenticated());
  }

  // ===== ZALO SSO LOGIN =====
  
  async loginWithZalo() {
    try {
      // Get Zalo user info from Zalo SDK
      const zaloUser = await this.getZaloUserInfo();
      
      if (!zaloUser) {
        throw new Error("Không thể lấy thông tin từ Zalo");
      }

      // Call backend API - backend will auto register if new user
      const response = await fetch(`${this.apiBaseUrl}/auth/zalo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zalo_user_id: zaloUser.id,
          display_name: zaloUser.name,
          avatar_url: zaloUser.avatar,
        }),
      });

      if (!response.ok) {
        throw new Error("Đăng nhập Zalo thất bại");
      }

      const data = await response.json();
      
      // Save tokens and user data
      await this.setAccessToken(data.accessToken);
      await this.setRefreshToken(data.refreshToken);
      await this.setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Zalo login error:", error);
      return { success: false, error: error.message };
    }
  }

  async getZaloUserInfo() {
    try {
      // Use zmp-sdk to get user info với autoRequestPermission
      // autoRequestPermission: true sẽ tự động yêu cầu quyền truy cập thông tin
      // avatarType: "normal" để lấy ảnh avatar kích thước vừa
      const { userInfo } = await getUserInfo({
        autoRequestPermission: true,
        avatarType: "normal"
      });
      
      return {
        id: userInfo.id,
        name: userInfo.name,
        avatar: userInfo.avatar,
      };
    } catch (error) {
      console.warn("Not running in Zalo Mini App - using mock data:", error);
      
      // Xử lý lỗi -1401: người dùng từ chối cung cấp thông tin
      if (error.code === -1401) {
        throw new Error("Bạn cần cho phép truy cập thông tin để đăng nhập");
      }
      
      // Return mock data for development
      return {
        id: "mock_zalo_" + Date.now(),
        name: "Zalo User " + Math.floor(Math.random() * 1000),
        avatar: "https://via.placeholder.com/150",
      };
    }
  }

  // ===== EMAIL LOGIN =====
  
  async loginWithEmail(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          provider: "EMAIL",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Đăng nhập thất bại");
      }

      const data = await response.json();
      
      // Save tokens and user data
      await this.setAccessToken(data.accessToken);
      await this.setRefreshToken(data.refreshToken);
      await this.setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Email login error:", error);
      return { success: false, error: error.message };
    }
  }

  // ===== EMAIL REGISTER =====
  
  async registerWithEmail(email, password, displayName) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
          provider: "EMAIL",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Đăng ký thất bại");
      }

      const data = await response.json();
      
      // Save tokens and user data
      await this.setAccessToken(data.accessToken);
      await this.setRefreshToken(data.refreshToken);
      await this.setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Email register error:", error);
      return { success: false, error: error.message };
    }
  }

  // ===== REFRESH TOKEN =====
  
  async refreshAccessToken() {
    // Prevent multiple refresh requests
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      
      // Save new tokens
      await this.setAccessToken(data.accessToken);
      
      // Optionally update refresh token if backend rotates it
      if (data.refreshToken) {
        await this.setRefreshToken(data.refreshToken);
      }

      // Notify all subscribers
      this.refreshSubscribers.forEach((callback) => callback(data.accessToken));
      this.refreshSubscribers = [];

      return data.accessToken;
    } catch (error) {
      console.error("Refresh token error:", error);
      // Clear all tokens and redirect to login
      await this.removeToken();
      await this.removeUser();
      window.location.hash = "#/login";
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // ===== LOGOUT =====
  
  async logout() {
    try {
      const token = await this.getAccessToken();
      
      if (token) {
        // Call backend to invalidate tokens
        await fetch(`${this.apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local data
      await this.removeToken();
      await this.removeUser();
    }
  }

  // ===== AUTH GUARD =====
  
  async requireAuth(intendedPath = null) {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      // Store intended destination (where user wanted to go)
      if (intendedPath) {
        sessionStorage.setItem("auth_redirect", intendedPath);
      } else {
        sessionStorage.setItem("auth_redirect", window.location.hash);
      }
      // Redirect to login
      window.location.hash = "#/login";
      return false;
    }
    return true;
  }

  // Get redirect path after login
  getRedirectPath() {
    const redirect = sessionStorage.getItem("auth_redirect");
    sessionStorage.removeItem("auth_redirect");
    return redirect || "#/home";
  }

  // ===== API HELPER WITH AUTH & AUTO REFRESH =====
  
  async fetchWithAuth(url, options = {}) {
    let token = await this.getAccessToken();
    
    if (!token) {
      throw new Error("Not authenticated");
    }

    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - Try to refresh token
    if (response.status === 401) {
      try {
        // Attempt to refresh the access token
        token = await this.refreshAccessToken();
        
        // Retry the original request with new token
        const newHeaders = {
          ...options.headers,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        response = await fetch(url, {
          ...options,
          headers: newHeaders,
        });

        // If still 401 after refresh, logout
        if (response.status === 401) {
          await this.logout();
          window.location.hash = "#/login";
          throw new Error("Session expired");
        }
      } catch (error) {
        // Refresh failed, logout
        await this.logout();
        window.location.hash = "#/login";
        throw new Error("Session expired");
      }
    }

    return response;
  }
}

// Export singleton instance
const authServiceInstance = new AuthService();
export default authServiceInstance;
