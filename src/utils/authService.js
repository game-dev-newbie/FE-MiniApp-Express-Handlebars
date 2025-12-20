// src/utils/authService.js
// Authentication Service - Manages tokens and auth state
import { getUserInfo, getAccessToken, nativeStorage } from "zmp-sdk/apis";

const ACCESS_TOKEN_KEY = "dinelink_access_token";
const REFRESH_TOKEN_KEY = "dinelink_refresh_token";
const USER_KEY = "dinelink_user_data";

class AuthService {
  constructor() {
    this.apiBaseUrl = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  // ===== ZALO STORAGE HELPERS =====

  // Use nativeStorage (synchronous) with localStorage fallback
  getStorageData(key) {
    try {
      // nativeStorage.getItem is synchronous, returns string or null
      return nativeStorage.getItem(key);
    } catch (error) {
      console.warn(
        "Zalo nativeStorage not available, using localStorage:",
        error
      );
      return localStorage.getItem(key);
    }
  }

  setStorageData(key, value) {
    try {
      // nativeStorage.setItem is synchronous
      nativeStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(
        "Zalo nativeStorage not available, using localStorage:",
        error
      );
      localStorage.setItem(key, value);
      return true;
    }
  }

  removeStorageData(key) {
    try {
      // nativeStorage.removeItem is synchronous
      nativeStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(
        "Zalo nativeStorage not available, using localStorage:",
        error
      );
      localStorage.removeItem(key);
      return true;
    }
  }

  // ===== TOKEN MANAGEMENT =====

  getAccessToken() {
    return this.getStorageData(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token) {
    this.setStorageData(ACCESS_TOKEN_KEY, token);
  }

  removeAccessToken() {
    this.removeStorageData(ACCESS_TOKEN_KEY);
  }

  getRefreshToken() {
    return this.getStorageData(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token) {
    this.setStorageData(REFRESH_TOKEN_KEY, token);
  }

  removeRefreshToken() {
    this.removeStorageData(REFRESH_TOKEN_KEY);
  }

  // Legacy method for backward compatibility
  getToken() {
    return this.getAccessToken();
  }

  setToken(token) {
    this.setAccessToken(token);
  }

  removeToken() {
    this.removeAccessToken();
    this.removeRefreshToken();
  }

  // ===== USER DATA MANAGEMENT =====

  getUser() {
    const userData = this.getStorageData(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user) {
    this.setStorageData(USER_KEY, JSON.stringify(user));
    
    // Dispatch event to notify other components about user data change
    window.dispatchEvent(
      new CustomEvent("userDataUpdated", {
        detail: user,
      })
    );
  }

  removeUser() {
    this.removeStorageData(USER_KEY);
  }

  // ===== AUTH STATE =====

  isAuthenticated() {
    const token = this.getAccessToken();
    return !!token;
  }

  isGuest() {
    return !this.isAuthenticated();
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

      // Ensure avatar_url from Zalo is saved
      const userData = {
        ...data.user,
        avatar_url: data.user.avatar_url || zaloUser.avatar,
      };

      // Save tokens and user data (now synchronous)
      this.setAccessToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      this.setUser(userData);

      console.log("✅ Zalo login successful with avatar:", userData.avatar_url);

      return { success: true, user: userData };
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
        avatarType: "normal",
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
        avatar: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70),
      };
    }
  }

  // ===== EMAIL LOGIN =====

  async loginWithEmail(email, password) {
    try {
      // Mock user data for testing (remove when backend is ready)
      const MOCK_USERS = [
        {
          email: "admin@dinelink.com",
          password: "Admin123456",
          user: {
            id: 999,
            display_name: "Admin DineLink",
            email: "admin@dinelink.com",
            avatar_url: "https://i.pravatar.cc/150?img=70",
            phone: "0900000000",
          },
        },
        {
          email: "nguyenvana@gmail.com",
          password: "User123456",
          user: {
            id: 1,
            display_name: "Nguyễn Văn A",
            email: "nguyenvana@gmail.com",
            avatar_url: "https://i.pravatar.cc/150?img=1",
            phone: "0901234567",
          },
        },
        {
          email: "tranthib@gmail.com",
          password: "User123456",
          user: {
            id: 2,
            display_name: "Trần Thị B",
            email: "tranthib@gmail.com",
            avatar_url: "https://i.pravatar.cc/150?img=2",
            phone: "0912345678",
          },
        },
        {
          email: "demo@dinelink.com",
          password: "Demo123456",
          user: {
            id: 100,
            display_name: "Demo User",
            email: "demo@dinelink.com",
            avatar_url: "https://i.pravatar.cc/150?img=50",
            phone: "0909999999",
          },
        },
      ];

      // Check mock users first
      const mockUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (mockUser) {
        console.log("🎭 Mock login successful:", mockUser.user);

        // Generate mock tokens
        const mockAccessToken = `mock_access_${Date.now()}_${mockUser.user.id}`;
        const mockRefreshToken = `mock_refresh_${Date.now()}_${
          mockUser.user.id
        }`;

        // Save tokens and user data
        this.setAccessToken(mockAccessToken);
        this.setRefreshToken(mockRefreshToken);
        this.setUser(mockUser.user);

        return { success: true, user: mockUser.user };
      }

      // If no mock user found, try real backend
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

      // Save tokens and user data (now synchronous)
      this.setAccessToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      this.setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Email login error:", error);
      // Return more helpful error message
      if (error.message.includes("Failed to fetch")) {
        return {
          success: false,
          error: "Email hoặc mật khẩu không đúng",
        };
      }
      return { success: false, error: error.message };
    }
  }

  // ===== EMAIL REGISTER =====

  async registerWithEmail(email, password, displayName) {
    try {
      // Default avatar for email users (guest icon)
      const defaultAvatar = "/src/assets/icons/cá nhân.jpg";

      const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
          avatar_url: defaultAvatar,
          provider: "EMAIL",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Đăng ký thất bại");
      }

      const data = await response.json();

      // Save tokens and user data (now synchronous)
      this.setAccessToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      this.setUser(data.user);

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

      // Save new tokens (now synchronous)
      this.setAccessToken(data.accessToken);

      // Optionally update refresh token if backend rotates it
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }

      // Notify all subscribers
      this.refreshSubscribers.forEach((callback) => callback(data.accessToken));
      this.refreshSubscribers = [];

      return data.accessToken;
    } catch (error) {
      console.error("Refresh token error:", error);
      // Clear all tokens and redirect to login (now synchronous)
      this.removeToken();
      this.removeUser();
      window.location.hash = "#/login";
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // ===== LOGOUT =====

  async logout() {
    try {
      const token = this.getAccessToken();

      if (token) {
        // Call backend to invalidate tokens
        await fetch(`${this.apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local data (now synchronous)
      this.removeToken();
      this.removeUser();
    }
  }

  // ===== AUTH GUARD =====

  requireAuth(intendedPath = null) {
    const isAuth = this.isAuthenticated();
    if (!isAuth) {
      // Store intended destination (where user wanted to go)
      if (intendedPath) {
        sessionStorage.setItem("auth_redirect", intendedPath);
      } else {
        sessionStorage.setItem("auth_redirect", window.location.hash);
      }
      // Use setTimeout to avoid blocking current render
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 0);
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
    let token = this.getAccessToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
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

  // ===== UPDATE PROFILE =====

  async updateProfile(profileData) {
    try {
      // Call backend API to update profile
      const response = await this.fetchWithAuth(
        `${this.apiBaseUrl}/user/profile`,
        {
          method: "PUT",
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Cập nhật thông tin thất bại");
      }

      const data = await response.json();

      // Update local user data with response from backend
      this.setUser(data.user || data);

      return { success: true, user: data.user || data };
    } catch (error) {
      console.error("Update profile error:", error);
      
      // If API fails, fallback to local update (for development)
      if (error.message.includes("Failed to fetch") || error.message === "Not authenticated") {
        console.warn("API not available, updating locally");
        const currentUser = this.getUser();
        const updatedUser = {
          ...currentUser,
          ...profileData,
        };
        this.setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
      
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const authServiceInstance = new AuthService();
export default authServiceInstance;
