# 📡 Hướng dẫn tích hợp API - DineLink Mini App

## ✅ Trạng thái kiểm tra (20/12/2025)

### 🟢 Đã sẵn sàng:

- ✅ Base URL đã được cấu hình: `https://pyramidally-unborrowed-cherie.ngrok-free.dev`
- ✅ HTTP Client với error handling
- ✅ Authentication service với mock data fallback
- ✅ Token management (access & refresh tokens)
- ✅ Request interceptors với Authorization header
- ✅ CORS credentials: include

### 🟡 Cần chú ý:

- ⚠️ Mock data đang được sử dụng cho reviews (USE_MOCK_API = true)
- ⚠️ Authentication có fallback mock users để test

### 🔴 Cần backend hỗ trợ:

- ❌ CORS headers từ backend
- ❌ Token refresh endpoint
- ❌ Các endpoints cần implement (xem danh sách bên dưới)

---

## 📋 Danh sách Endpoints cần implement

### 🔐 Authentication (`/auth`)

#### POST `/auth/login`

```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "provider": "EMAIL"
}

Response:
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "display_name": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar_url": "https://...",
    "phone": "0901234567"
  }
}
```

#### POST `/auth/register`

```json
Request:
{
  "email": "newuser@example.com",
  "password": "password123",
  "display_name": "Tên người dùng",
  "provider": "EMAIL"
}

Response: (giống login)
```

#### POST `/auth/zalo`

Đăng nhập/Đăng ký với Zalo (auto register nếu user mới)

**Quan trọng:** Backend cần lưu `avatar_url` từ Zalo để user có ảnh đại diện ngay khi đăng ký

```json
Request:
{
  "zalo_user_id": "123456",
  "display_name": "Tên Zalo",
  "avatar_url": "https://zalo-cdn.com/avatar.jpg"
}

Response:
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "display_name": "Tên Zalo",
    "email": null,
    "avatar_url": "https://zalo-cdn.com/avatar.jpg",
    "phone": null,
    "provider": "ZALO"
  }
}
```

#### POST `/auth/register`

Đăng ký với Email

**Quan trọng:** Backend cần set `avatar_url` mặc định nếu không có trong request

```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "Nguyễn Văn A",
  "avatar_url": "/src/assets/icons/cá nhân.jpg",
  "provider": "EMAIL"
}

Response: (giống login)
```

#### POST `/auth/refresh`

```json
Request:
{
  "refreshToken": "refresh_token_here"
}

Response:
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token" // optional
}
```

#### POST `/auth/logout`

Headers: `Authorization: Bearer {token}`

---

### 🍽️ Restaurants (`/restaurants`)

#### GET `/restaurants`

Query params: `?category=italian&search=pizza&limit=10&offset=0`

```json
Response:
{
  "data": [
    {
      "id": 1,
      "name": "Nhà hàng ABC",
      "category": "italian",
      "rating": 4.5,
      "priceRange": "$$$",
      "imageUrl": "https://...",
      "address": "123 Đường ABC",
      "phone": "0901234567",
      "openTime": "10:00",
      "closeTime": "22:00",
      "tags": ["pizza", "pasta"]
    }
  ],
  "total": 50,
  "limit": 10,
  "offset": 0
}
```

#### GET `/restaurants/:id`

```json
Response:
{
  "id": 1,
  "name": "Nhà hàng ABC",
  "description": "Mô tả chi tiết...",
  "rating": 4.5,
  "reviewCount": 120,
  "priceRange": "$$$",
  "imageUrl": "https://...",
  "images": ["url1", "url2"],
  "address": "123 Đường ABC",
  "phone": "0901234567",
  "openTime": "10:00",
  "closeTime": "22:00",
  "tags": ["pizza", "pasta"],
  "facilities": ["wifi", "parking"],
  "menu": [
    {
      "id": 1,
      "name": "Pizza Margherita",
      "price": 150000,
      "description": "...",
      "imageUrl": "https://..."
    }
  ]
}
```

#### GET `/restaurants/:id/reviews`

Query params: `?limit=10&offset=0&sort=newest`

```json
Response:
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "userName": "Nguyễn Văn A",
      "userAvatar": "https://...",
      "rating": 5,
      "comment": "Rất ngon!",
      "images": ["url1", "url2"],
      "createdAt": "2025-12-20T10:00:00Z",
      "bookingId": 123
    }
  ],
  "total": 120,
  "averageRating": 4.5
}
```

---

### 📅 Bookings (`/bookings`)

#### POST `/bookings`

Headers: `Authorization: Bearer {token}`

```json
Request:
{
  "restaurantId": 1,
  "date": "2025-12-25",
  "time": "19:00",
  "guests": 4,
  "specialRequests": "Cần ghế trẻ em",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "customerEmail": "user@example.com"
}

Response:
{
  "id": 123,
  "restaurantId": 1,
  "restaurantName": "Nhà hàng ABC",
  "date": "2025-12-25",
  "time": "19:00",
  "guests": 4,
  "status": "PENDING", // PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED
  "specialRequests": "Cần ghế trẻ em",
  "createdAt": "2025-12-20T10:00:00Z"
}
```

#### GET `/bookings`

Headers: `Authorization: Bearer {token}`
Query params: `?status=CONFIRMED&limit=10`

```json
Response:
{
  "data": [
    {
      "id": 123,
      "restaurantId": 1,
      "restaurantName": "Nhà hàng ABC",
      "date": "2025-12-25",
      "time": "19:00",
      "guests": 4,
      "status": "CONFIRMED",
      "createdAt": "2025-12-20T10:00:00Z"
    }
  ]
}
```

#### GET `/bookings/:id`

Headers: `Authorization: Bearer {token}`

#### PUT `/bookings/:id`

Headers: `Authorization: Bearer {token}`

```json
Request:
{
  "date": "2025-12-26",
  "time": "20:00",
  "guests": 5
}
```

#### DELETE `/bookings/:id` (Cancel)

Headers: `Authorization: Bearer {token}`

```json
Request:
{
  "cancelReason": "Có việc đột xuất"
}
```

#### POST `/bookings/:id/checkin`

Headers: `Authorization: Bearer {token}`

```json
Response:
{
  "id": 123,
  "status": "CHECKED_IN",
  "checkedInAt": "2025-12-25T19:00:00Z"
}
```

---

### ⭐ Reviews (`/reviews`)

#### POST `/reviews`

Headers: `Authorization: Bearer {token}`

```json
Request:
{
  "restaurantId": 1,
  "bookingId": 123,
  "rating": 5,
  "comment": "Rất ngon!",
  "images": ["base64_or_url"]
}

Response:
{
  "id": 1,
  "restaurantId": 1,
  "userId": 1,
  "rating": 5,
  "comment": "Rất ngon!",
  "createdAt": "2025-12-25T20:00:00Z"
}
```

#### GET `/reviews/my-reviews`

Headers: `Authorization: Bearer {token}`

#### PUT `/reviews/:id`

Headers: `Authorization: Bearer {token}`

#### DELETE `/reviews/:id`

Headers: `Authorization: Bearer {token}`

---

### ❤️ Favorites (`/favorites`)

#### POST `/favorites`

Headers: `Authorization: Bearer {token}`

```json
Request:
{
  "restaurantId": 1
}
```

#### DELETE `/favorites/:restaurantId`

Headers: `Authorization: Bearer {token}`

#### GET `/favorites`

Headers: `Authorization: Bearer {token}`

```json
Response:
{
  "data": [
    {
      "id": 1,
      "name": "Nhà hàng ABC",
      "rating": 4.5,
      "imageUrl": "https://...",
      "priceRange": "$$$"
    }
  ]
}
```

---

### 👤 User Profile (`/user`)

#### GET `/user/profile`

Lấy thông tin profile của user hiện tại

Headers: `Authorization: Bearer {token}`

```json
Response:
{
  "success": true,
  "user": {
    "id": 1,
    "display_name": "Nguyễn Văn A",
    "email": "user@example.com",
    "avatar_url": "https://...",
    "phone": "0901234567",
    "bio": "Mô tả về bản thân",
    "created_at": "2024-12-01T00:00:00.000Z"
  }
}
```

#### PUT `/user/profile`

Cập nhật thông tin profile

Headers: `Authorization: Bearer {token}`

```json
Request:
{
  "display_name": "Tên mới",
  "avatar_url": "https://...",
  "phone": "0901234567",
  "bio": "Mô tả..."
}

Response:
{
  "success": true,
  "message": "Cập nhật thông tin thành công",
  "user": {
    "id": 1,
    "display_name": "Tên mới",
    "email": "user@example.com",
    "avatar_url": "https://...",
    "phone": "0901234567",
    "bio": "Mô tả...",
    "updated_at": "2025-12-20T10:00:00.000Z"
  }
}
```

#### POST `/user/avatar`

Upload avatar mới (alternative - nếu upload file riêng)

Headers: `Authorization: Bearer {token}`
Content-Type: `multipart/form-data`

```
Form Data:
- avatar: File (image/jpeg, image/png)

Response:
{
  "success": true,
  "avatar_url": "https://storage.example.com/avatars/user_1.jpg"
}
```

---

## 🔧 Cấu hình Backend cần thiết

### CORS Headers

```javascript
Access-Control-Allow-Origin: * (hoặc domain cụ thể)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Response Format

Tất cả response nên theo format:

```json
Success: { "data": {...}, "message": "Success" }
Error: { "error": "Error message", "code": "ERROR_CODE" }
```

### Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

---

## 🚀 Cách chuyển từ Mock sang Real API

### Bước 1: Tắt Mock Data

Trong các file API, đổi flag:

```javascript
// src/api/restaurantApi.js
const USE_MOCK_API = false; // Đổi từ true sang false

// src/api/reviewApi.js
const USE_MOCK_API = false; // Đổi từ true sang false
```

### Bước 2: Test Authentication

1. Test login với email/password
2. Test Zalo login
3. Kiểm tra token được lưu đúng
4. Test refresh token

### Bước 3: Test từng module

1. Restaurants listing & detail
2. Bookings create/read/update/delete
3. Reviews create/read/update/delete
4. Favorites
5. User profile

### Bước 4: Error Handling

Kiểm tra app xử lý đúng các trường hợp:

- Network error
- 401 Unauthorized → redirect login
- 404 Not Found
- 500 Server Error

---

## 📝 Ghi chú

### Token Storage

- Access Token: `localStorage.dinelink_access_token`
- Refresh Token: `localStorage.dinelink_refresh_token`
- User Data: `localStorage.dinelink_user_data`

### Current Mock Users (for testing)

```javascript
- admin@dinelink.com / Admin123456
- nguyenvana@gmail.com / User123456
- tranthib@gmail.com / User123456
- demo@dinelink.com / Demo123456
```

### Base URL

```javascript
Production: https://pyramidally-unborrowed-cherie.ngrok-free.dev
Development: Can override with VITE_API_BASE_URL env variable
```

---

## 🔔 Hệ thống Notifications

### Frontend Polling

Frontend đã được setup để tự động poll notifications từ backend mỗi 60 giây khi user đăng nhập:

```javascript
// Tự động bắt đầu khi user login
startNotificationPolling(60000); // Poll mỗi 60 giây
```

### GET `/notifications?since={timestamp}`

Lấy các notifications mới từ timestamp cụ thể:

```json
Request:
Headers: {
  "Authorization": "Bearer {access_token}"
}

Response:
{
  "data": [
    {
      "id": "notif_123",
      "bookingId": 456,
      "type": "REMINDER",
      "status": "REMINDER",
      "title": "Nhắc nhở đặt bàn!",
      "message": "Đặt bàn của bạn tại Nhà hàng ABC sẽ bắt đầu trong 30 phút nữa (lúc 18:00). Chuẩn bị khởi hành thôi!",
      "createdAt": "2025-12-20T17:30:00.000Z",
      "isRead": false
    }
  ]
}
```

### Notification Types

Frontend hỗ trợ các loại notification sau:

1. **CONFIRMED** - Đặt bàn được xác nhận

   - Icon: Checkmark
   - Màu: Xanh lá (#4caf50)

2. **CHECKED_IN** - Check-in thành công

   - Icon: Layers
   - Màu: Cam (#ef6c00)

3. **CANCELLED** - Đặt bàn bị hủy

   - Icon: X Circle
   - Màu: Đỏ (#c62828)

4. **REMINDER** - Nhắc nhở 30 phút trước giờ đặt bàn ⚡
   - Icon: Clock
   - Màu: Cam vàng (#ff9800)
   - **Backend cần gửi notification này 30 phút trước booking time**

### Backend Implementation Guidelines

#### 1. Scheduled Reminder Job

Backend cần implement scheduled job (cron job hoặc background worker) để:

```python
# Pseudocode
def send_booking_reminders():
    # Lấy tất cả bookings có booking_time trong 30 phút tới
    upcoming_bookings = Booking.query.filter(
        Booking.booking_datetime >= now(),
        Booking.booking_datetime <= now() + timedelta(minutes=30),
        Booking.status == "CONFIRMED",
        Booking.reminder_sent == False
    )

    for booking in upcoming_bookings:
        # Tạo notification
        notification = Notification.create(
            user_id=booking.user_id,
            booking_id=booking.id,
            type="REMINDER",
            status="REMINDER",
            title="Nhắc nhở đặt bàn!",
            message=f"Đặt bàn của bạn tại {booking.restaurant.name} sẽ bắt đầu trong 30 phút nữa (lúc {booking.time}). Chuẩn bị khởi hành thôi!",
            created_at=now(),
            is_read=False
        )

        # Đánh dấu đã gửi reminder
        booking.reminder_sent = True
        booking.save()

        # Optional: Push notification qua Firebase/OneSignal
        send_push_notification(booking.user_id, notification)

# Schedule job chạy mỗi 5 phút
schedule.every(5).minutes.do(send_booking_reminders)
```

#### 2. Notification Endpoints

**POST `/notifications` (Optional - for manual testing)**

```json
Request:
{
  "userId": 123,
  "bookingId": 456,
  "type": "REMINDER",
  "status": "REMINDER",
  "title": "Nhắc nhở đặt bàn!",
  "message": "Đặt bàn của bạn tại Nhà hàng ABC sẽ bắt đầu trong 30 phút nữa"
}

Response:
{
  "success": true,
  "data": {
    "id": "notif_123",
    "createdAt": "2025-12-20T17:30:00.000Z"
  }
}
```

**GET `/notifications?since={timestamp}`**
Trả về tất cả notifications mới hơn timestamp (ISO 8601 format)

```json
Response:
{
  "data": [
    {
      "id": "notif_123",
      "bookingId": 456,
      "type": "REMINDER",
      "status": "REMINDER",
      "title": "Nhắc nhở đặt bàn!",
      "message": "...",
      "createdAt": "2025-12-20T17:30:00.000Z",
      "isRead": false
    }
  ]
}
```

#### 3. Database Schema Suggestion

```sql
CREATE TABLE notifications (
    id VARCHAR PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT,
    type VARCHAR(50), -- CONFIRMED, CHECKED_IN, CANCELLED, REMINDER
    status VARCHAR(50), -- Same as type for compatibility
    title VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Add reminder tracking to bookings table
ALTER TABLE bookings ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_bookings_reminder ON bookings(booking_datetime, status, reminder_sent);
```

#### 4. Testing Reminders

Để test reminder notifications:

```bash
# Tạo booking với booking_time = now + 25 minutes
POST /bookings
{
  "restaurantId": 1,
  "date": "2025-12-20",
  "time": "18:00", # 25 phút từ bây giờ
  "guests": 4
}

# Đợi 5 phút để cron job chạy (hoặc trigger manual)
# Kiểm tra frontend có nhận được notification không
```

---

**Cập nhật:** 20/12/2025
**Status:** ✅ Sẵn sàng tích hợp API | 🔔 Reminder notification ready
