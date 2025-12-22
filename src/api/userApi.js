// src/api/userApi.js
import { httpGet, httpPatch, httpPost } from "./httpClient.js";

// ===== USER PROFILE APIs =====

/**
 * Get my profile information
 * @returns {Promise} API response with user profile
 * @example
 * Response: {
 *   id, display_name, email, phone, avatar_url,
 *   created_at, updated_at
 * }
 */
export async function getMyProfile() {
  try {
    const response = await httpGet("/api/v1/miniapp/users/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

/**
 * Update my profile information
 * @param {Object} profileData - Profile data to update (all optional)
 * @param {string} profileData.display_name - Updated display name
 * @param {string} profileData.phone - Updated phone number
 * @param {string} profileData.email - Updated email
 * @param {string} profileData.avatar_url - Updated avatar URL
 * @returns {Promise} API response with updated profile
 * @example
 * Response: {
 *   id, display_name, phone, email, avatar_url,
 *   updated_at
 * }
 *
 * Side Effects:
 * - Auto delete old avatar if changed
 */
export async function updateMyProfile(profileData) {
  try {
    const response = await httpPatch("/api/v1/miniapp/users/me", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Upload user avatar
 * @param {File} imageFile - Image file to upload
 * @returns {Promise} API response with uploaded image info
 * @example
 * Response: {
 *   filename: "1703123456789-avatar.jpg",
 *   path: "/uploads/users/10/avatar/1703123456789-avatar.jpg",
 *   url: "http://localhost:3000/uploads/users/10/avatar/1703123456789-avatar.jpg"
 * }
 *
 * Notes:
 * - Max size: 5MB
 * - Rate limit: 5 uploads/10 minutes
 * - After upload → Call updateMyProfile() to update avatar_url
 *
 * @example Usage
 * ```javascript
 * // 1. Upload avatar
 * const uploadResult = await uploadAvatar(imageFile);
 *
 * // 2. Update profile with new avatar URL
 * await updateMyProfile({
 *   avatar_url: uploadResult.path
 * });
 * ```
 */
export async function uploadAvatar(imageFile) {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append("file", imageFile);

    // Use fetch directly for multipart/form-data
    // Don't use httpPost because it sets Content-Type to application/json
    const token =
      localStorage.getItem("dinelink_access_token") ||
      (typeof nativeStorage !== "undefined"
        ? nativeStorage.getItem("dinelink_access_token")
        : null);

    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "https://pyramidally-unborrowed-cherie.ngrok-free.dev/api"
      }/api/v1/miniapp/uploads/images/users/avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, browser will set it with boundary
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
}
