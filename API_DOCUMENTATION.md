# 📚 RESTAURANT BOOKING SYSTEM - API DOCUMENTATION

---

## PART 1: AUTHENTICATION & AUTHORIZATION

### 1.1. Authentication Overview

MINIAPP (Customer)\*\*

- **CUSTOMER:** Khách hàng đặt bàn
- **Table:** `users`

### 1.2. Token System

**Access Token (Short-lived: 30 minutes)**

```json
{
  "sub": 123,
  "subType": "CUSTOMER",
  "role": "CUSTOMER",
  "provider": "ZALO",
  "type": "ACCESS",
  "iat": 1703000000,
  "exp": 1703604800
}
```

**Refresh Token (Long-lived: 30 days)**

```json
{
  "sub": 123,
  "subType": "CUSTOMER",
  "role": "CUSTOMER",
  "provider": "ZALO",
  "type": "REFRESH",
  "iat": 1703000000,
  "exp": 1705592800
}
```

** Lưu ý**

- Dashboard: Lưu 2 tokens vào localStorage, mỗi request thì gửi accessToken kèm vào header với cú pháp Authorization: Beare <accessToken>. Khi req nào hết hạn accessToken thì gửi ngay refreshToken vào header với cú pháp refreshToken để có thể nhận lại tokens mới và sau đó gửi accessToken đính kèm lại cho req cũ

- Miniapp: Lưu 2 tokens vào nativeStorage của zalo hỗ trợ (nếu môi trường test web thì lưu localStorage). Flow giống với dashboard nêu trên.

### 1.3. Authorization Header

```http
Authorization: Bearer <access_token>
```

3. MINIAPP AUTHENTICATION

### 3.1. Login with Zalo

**Endpoint:** `POST /api/v1/miniapp/auth/zalo/login`

**Description:** Đăng nhập MiniApp bằng tài khoản Zalo

**Frontend Flow:**

```javascript
// 1. Get access token from Zalo
import { getAccessToken, getUserInfo } from "zmp-sdk";

const { accessToken } = await getAccessToken();
const { userInfo } = await getUserInfo();

// Miniapp tự gọi api của zalo hỗ trợ và lấy thông tin, sau đó truyền vào req.body gửi lên cho server. Đây là giả lập code
// 2. Call API
const response = await fetch("${base_URL}/api/v1/miniapp/auth/zalo/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    accessToken,
    userInfo,
    phone: "0901234567", // Optional
  }),
});
```

**Request Body:**

```json
{
  "accessToken": "zalo_access_token_here",
  "userInfo": {
    "id": "zalo_user_id_123",
    "name": "Nguyễn Văn C",
    "avatar": "https://avatar.zaloapp.com/..."
  },
  "phone": "0901234567"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đăng nhập bằng Zalo thành công",
  "data": {
    "user": {
      "id": 10,
      "display_name": "Nguyễn Văn C",
      "email": null,
      "phone": "0901234567",
      "avatar_url": "https://avatar.zaloapp.com/...",
      "created_at": "2025-12-20 10:30:00",
      "updated_at": "2025-12-20 10:30:00"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

> **Note:** Nếu user lần đầu login → Tự động tạo account mới

---

### 3.2. Register Local

**Endpoint:** `POST /api/v1/miniapp/auth/register`

**Description:** Đăng ký tài khoản local (email/password) cho MiniApp

**Request Body:**

```json
{
  "display_name": "Lê Thị D",
  "email": "customer@example.com",
  "password": "Password123!",
  "phone": "0901234567" (optional, không cần nhập)
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Đăng ký tài khoản miniapp thành công",
  "data": {
    "user": {
      "id": 11,
      "display_name": "Lê Thị D",
      "email": "customer@example.com",
      "phone": "0901234567",
      "avatar_url": null,
      "created_at": "2025-12-20 11:00:00"
    },
    "tokens": {
      "accessToken": ".. .",
      "refreshToken": "..."
    }
  }
}
```

---

### 3.3. Login Local

**Endpoint:** `POST /api/v1/miniapp/auth/login`

**Description:** Đăng nhập MiniApp bằng email/password

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đăng nhập miniapp thành công",
  "data": {
    "user": {
      "id": 11,
      "display_name": "Lê Thị D",
      "email": "customer@example.com",
      "phone": "0901234567",
      "avatar_url": null
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

---

## 4. Refresh Token

**Endpoint:** `POST /api/v1/common/auth/refresh`

**Description:** Làm mới access token (dùng chung cho cả Dashboard & MiniApp)

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "new_access_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

## 5. Logout

**Endpoint:** `POST /api/v1/common/auth/logout`

**Description:** Đăng xuất thu hồi token (dùng chung cho cả Dashboard & MiniApp)

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đăng xuất phiên hiện tại thành công"
}
```

## PART 3: MINIAPP APIs

## 15. RESTAURANT DISCOVERY

### 15.1. Get Top Rated Restaurants

**Endpoint:** `GET /api/v1/miniapp/restaurants/home/top-rated`

**Auth Required:** ❌ No (Public)

**Description:** Lấy top 5 nhà hàng có rating cao nhất cho trang home

**Request**

```http
GET /api/v1/miniapp/restaurants/home/top-rated
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy top nhà hàng rating cao nhất thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Nhà Hàng ABC",
        "address": "123 Đường XYZ, Quận 1, TP.HCM",
        "phone": "0901234567",
        "description": "Nhà hàng chuyên về món Việt",
        "tags": "morning,lunch,dinner,vietnamese",
        "average_rating": 4.8,
        "review_count": 150,
        "favorite_count": 68,
        "main_image_url": "/uploads/restaurants/1/cover/image.jpg",
        "open_time": "08:00:00",
        "close_time": "22:00:00",
        "is_active": true
      },
      {
        "id": 2,
        "name": "Nhà Hàng XYZ",
        "address": "456 Đường ABC, Quận 3, TP.HCM",
        "average_rating": 4.7,
        "review_count": 120,
        "favorite_count": 55,
        "main_image_url": "/uploads/restaurants/2/cover/image.jpg"
      }
    ]
  }
}
```

---

### 15.2. Get Top Favorite Restaurants

**Endpoint:** `GET /api/v1/miniapp/restaurants/home/top-favorites`

**Auth Required:** ❌ No (public)

**Description:** Lấy top 5 nhà hàng được yêu thích nhiều nhất

**Request**

```http
GET /api/v1/miniapp/restaurants/home/top-favorites
```

**Response:** `200 OK` (format tương tự top-rated)

---

### 15.3. Get Top by Tag

**Endpoint:** `GET /api/v1/miniapp/restaurants/home/top-by-tag`

**Auth Required:** ❌ No (public)

**Query parameters**

- `tag` - Optional: morning, lunch, dinner, vietnamese, seafood, etc.

**Request**

```http
GET /api/v1/miniapp/restaurants/home/top-by-tag?tag=lunch
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy top nhà hàng theo tag thành công",
  "data": {
    "items": [
      {
        "id": 3,
        "name": "Nhà Hàng Trưa Ngon",
        "tags": "lunch,vietnamese,business",
        "average_rating": 4.6,
        "review_count": 80,
        "main_image_url": "/uploads/restaurants/3/cover/image. jpg"
      }
    ]
  }
}
```

---

### 15.4. Search Restaurants

**Endpoint:** `GET /api/v1/miniapp/restaurants/search`

**Auth Required:** ❌ No (public)

**Query Parameters:**

- `q` - Từ khóa tìm kiếm
- `limit` - Default: 20
- `offset` - Default: 0

**Request**

```http
GET /api/v1/miniapp/restaurants/search?q=hải&limit=10&offser
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tìm kiếm nhà hàng thành công",
  "data": {
    "items": [
      {
        "id": 5,
        "name": "Nhà Hàng Hải Sản Tươi",
        "address": "789 Đường Biển, Quận 7, TP.HCM",
        "tags": "seafood,lunch,dinner",
        "average_rating": 4.5,
        "review_count": 95,
        "favorite_count": 42,
        "main_image_url": "/uploads/restaurants/5/cover/image.jpg"
      }
    ],
    "pagination": {
      "total": 8,
      "limit": 10,
      "offset": 0,
      "page": 1,
      "totalPages": 1
    }
  }
}
```

---

### 15.5. Get Restaurant Detail

**Endpoint:** `GET /api/v1/miniapp/restaurants/:id`

**Auth Required:** ❌ No (public)

**Request**

```http
GET /api/v1/miniapp/restaurants/1
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy thông tin nhà hàng thành công",
  "data": {
    "id": 1,
    "name": "Nhà Hàng ABC",
    "address": "123 Đường XYZ, Quận 1, TP.HCM",
    "phone": "0901234567",
    "description": "Nhà hàng chuyên về món Việt Nam đặc sắc với hơn 10 năm kinh nghiệm",
    "tags": "morning,lunch,dinner,vietnamese",
    "require_deposit": true,
    "default_deposit_amount": 50000,
    "average_rating": 4.8,
    "review_count": 150,
    "favorite_count": 68,
    "main_image_url": "/uploads/restaurants/1/cover/image.jpg",
    "open_time": "08:00:00",
    "close_time": "22:00:00",
    "is_active": true,
    "created_at": "2025-12-20 10:00:00",
    "images": [
      {
        "id": 10,
        "type": "COVER",
        "file_path": "/uploads/restaurants/1/cover/image.jpg",
        "caption": "Hình ảnh nhà hàng ban đêm",
        "is_primary": true
      },
      {
        "id": 11,
        "type": "GALLERY",
        "file_path": "/uploads/restaurants/1/gallery/image1.jpg",
        "caption": "Không gian nhà hàng"
      },
      {
        "id": 12,
        "type": "MENU",
        "file_path": "/uploads/restaurants/1/menu/menu1.jpg",
        "caption": "Menu món chính"
      }
    ]
  }
}
```

---

### 15.6. Get Restaurant Reviews

**Endpoint:** `GET /api/v1/miniapp/restaurants/:id/reviews`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /api/v1/miniapp/restaurants/1/reviews?limit=10&offset
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách review của nhà hàng thành công",
  "data": {
    "items": [
      {
        "id": 50,
        "booking_id": 101,
        "restaurant_id": 1,
        "user_id": 10,
        "rating": 5,
        "comment": "Món ăn ngon, phục vụ tốt! ",
        "status": "VISIBLE",
        "reply_comment": "Cảm ơn quý khách! ",
        "reply_created_at": "2025-12-22 10:00:00",
        "created_at": "2025-12-22 08:00:00",
        "user": {
          "id": 10,
          "display_name": "Nguyễn Văn C",
          "avatar_url": "https://avatar.zaloapp.com/..."
        }
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

## 16. BOOKING FLOW

### 16.1. Get Available Tables

**Endpoint:** `GET /api/v1/miniapp/bookings/available-tables`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `restaurant_id` - Required
- `booking_date` - Required (YYYY-MM-DD)
- `booking_time` - Required (HH:mm)
- `people_count` - Required

**Request**

```http
GET /api/v1/miniapp/bookings/available-tables?restaurant_id=1&booking_date=2025-12-25&booking_time=19:00&people_count=4
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách bàn phù hợp thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Bàn 1",
        "capacity": 4,
        "location": "Tầng 1 - Gần cửa sổ",
        "status": "ACTIVE",
        "view_image_url": "/uploads/restaurants/1/tables/1/view/image.jpg",
        "view_note": "View đẹp nhìn ra vườn",
        "is_available": true
      },
      {
        "id": 5,
        "name": "Bàn 5",
        "capacity": 6,
        "location": "Tầng 1 - Góc trái",
        "status": "ACTIVE",
        "is_available": true
      }
    ]
  }
}
```

**Business Logic:**

- ✅ Chỉ trả về bàn có `capacity >= people_count`
- ✅ Chỉ bàn `status = ACTIVE`
- ✅ Chưa có booking trùng giờ

---

### 16.2. Create Booking

**Endpoint:** `POST /api/v1/miniapp/bookings`

**Auth Required:** ✅ Customer

**Description:** tạo booking mới

**Request Body:**

```json
{
  "restaurant_id": 1,
  "table_id": 1,
  "phone": "0901234567",
  "customer_name": "Nguyễn Văn C",
  "people_count": 4,
  "booking_date": "2025-12-25",
  "booking_time": "19:00",
  "note": "Muốn ngồi gần cửa sổ"
}
```

**Field Definitions**
`restaurant_id` - Required: ID nhà hàng
`table_id` - Required: ID bàn (từ available-tables)
`phone` - Required: SĐT liên hệ
`customer_name` - Required: Tên khách hàng
`people_count` - Required: Số người (min: 1)
`booking_date` - Required: Ngày đặt (YYYY-MM-DD)
`booking_time` - Required: Giờ đặt (HH:mm)
`note` - Optional: Ghi chú

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Tạo booking thành công",
  "data": {
    "id": 101,
    "restaurant_id": 1,
    "table_id": 1,
    "user_id": 10,
    "phone": "0901234567",
    "customer_name": "Nguyễn Văn C",
    "people_count": 4,
    "booking_time": "2025-12-25 19:00:00",
    "status": "PENDING",
    "status_label": "Chờ xác nhận",
    "deposit_amount": 50000,
    "payment_status": "PENDING",
    "payment_status_label": "Chờ thanh toán",
    "note": "Muốn ngồi gần cửa sổ",
    "created_at": "2025-12-20 15:00:00",
    "updated_at": "2025-12-20 15:00:00"
  }
}
```

**Side Effects:**

- ✅ Tự động tính deposit_amount từ restaurant. default_deposit_amount
- ✅ Set payment_status = PENDING nếu cần đặt cọc
- ✅ Set payment_status = NONE nếu không yêu cầu cọc
- ✅ Gửi notification cho customer
- ✅ Gửi notification cho restaurant (dashboard)

**Error case**

```json
// 400 - Bàn đã có người đặt
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Bàn đã được đặt ở thời điểm này, vui lòng chọn bàn hoặc thời gian khác"
  }
}

// 400 - Đặt trong quá khứ
{
  "success": false,
  "error": {
    "code":  "BAD_REQUEST",
    "message": "Không thể đặt bàn trong quá khứ"
  }
}

// 400 - Bàn không đủ chỗ
{
  "success":  false,
  "error": {
    "code": "BAD_REQUEST",
    "message":  "Bàn chỉ hỗ trợ tối đa 4 người"
  }
}
```

---

### 16.3. List My Bookings

**Endpoint:** `GET /api/v1/miniapp/bookings`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `category` - Filter theo danh mục: - "upcoming": Booking sắp tới (future + PENDING/CONFIRMED) - "history": Booking đã qua (past + COMPLETED) - "cancelled": Booking đã hủy - "all": Tất cả (default)
- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /api/v1/miniapp/bookings?category=upcoming&limit=10
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách booking của bạn thành công",
  "data": {
    "items": [
      {
        "id": 101,
        "restaurant_id": 1,
        "table_id": 1,
        "people_count": 4,
        "phone": "0901234567",
        "customer_name": "Nguyễn Văn C",
        "booking_time": "2025-12-25 19:00:00",
        "status": "PENDING",
        "status_label": "Chờ xác nhận",
        "deposit_amount": 50000,
        "payment_status": "PENDING",
        "payment_status_label": "Chờ thanh toán",
        "note": "Muốn ngồi gần cửa sổ",
        "created_at": "2025-12-20 15:00:00",
        "restaurant": {
          "id": 1,
          "name": "Nhà Hàng ABC",
          "address": "123 Đường XYZ, Quận 1, TP. HCM",
          "phone": "0901234567",
          "main_image_url": "/uploads/restaurants/1/cover/image. jpg"
        },
        "table": {
          "id": 1,
          "name": "Bàn 1",
          "capacity": 4,
          "location": "Tầng 1 - Gần cửa sổ"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 16.4. Get Booking Detail

**Endpoint:** `GET /api/v1/miniapp/bookings/:id`

**Auth Required:** ✅ Customer

**Request**

```http
GET /api/v1/miniapp/bookings/101
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```josn
{
  "success": true,
  "message": "Lấy chi tiết booking thành công",
  "data": {
    "id": 101,
    "restaurant_id": 1,
    "table_id": 1,
    "people_count":  4,
    "phone":  "0901234567",
    "customer_name": "Nguyễn Văn C",
    "booking_time": "2025-12-25 19:00:00",
    "status": "PENDING",
    "status_label": "Chờ xác nhận",
    "deposit_amount": 50000,
    "payment_status": "PENDING",
    "payment_status_label": "Chờ thanh toán",
    "payment_provider": null,
    "payment_reference": null,
    "paid_at": null,
    "refunded_at": null,
    "note": "Muốn ngồi gần cửa sổ",
    "created_at": "2025-12-20 15:00:00",
    "updated_at": "2025-12-20 15:00:00",
    "restaurant": {
      "id": 1,
      "name": "Nhà Hàng ABC",
      "address": "123 Đường XYZ, Quận 1, TP.HCM",
      "phone": "0901234567",
      "main_image_url": "/uploads/restaurants/1/cover/image. jpg"
    },
    "table": {
      "id":  1,
      "name":  "Bàn 1",
      "capacity": 4,
      "location": "Tầng 1 - Gần cửa sổ",
      "view_image_url": "/uploads/restaurants/1/tables/1/view/image.jpg"
    }
  }
}
```

---

### 16.5. Update My Booking

**Endpoint:** `PATCH /api/v1/miniapp/bookings/:id`

**Auth Required:** ✅ Customer

**Description:** Chỉ khi status = PENDING

**Request Body:** (all optional)

```json
{
  "customer_name": "Nguyễn Văn C (Updated)",
  "phone": "0907654321",
  "people_count": 5,
  "booking_date": "2025-12-25",
  "booking_time": "20:00",
  "table_id": 2,
  "note": "Muốn bàn lớn hơn"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Cập nhật booking thành công",
  "data": {
    "id": 101,
    "customer_name": "Nguyễn Văn C (Updated)",
    "phone": "0907654321",
    "people_count": 5,
    "booking_time": "2025-12-25 20:00:00",
    "table_id": 2,
    "note": "Muốn bàn lớn hơn",
    "updated_at": "2025-12-20 16:00:00"
  }
}
```

**Business Logic:**

- ✅ Chỉ cho phép update khi status = PENDING
- ✅ Nếu đổi thời gian/bàn → Check conflict
- ✅ Nếu đổi số người → Check capacity
- ✅ Gửi notification cho restaurant

**Error case**

```json
// 400 - Booking không thể sửa
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Chỉ có thể chỉnh sửa booking đang ở trạng thái PENDING"
  }
}
```

---

### 16.6. Cancel My Booking

**Endpoint:** `PATCH /api/v1/miniapp/bookings/:id/cancel`

**Auth Required:** ✅ Customer

**Description:** Hủy booking (chỉ khi status = PENDING/CONFIRMED)

**Request**

```http
PATCH /api/v1/miniapp/bookings/101/cancel
Authorization: Bearer <access_token>
```

**Response**

```json
{
  "success": true,
  "message": "Huỷ booking thành công",
  "data": {
    "id": 101,
    "status": "CANCELLED",
    "payment_status": "REFUNDED",
    "refunded_at": "2025-12-20 16:30:00",
    "updated_at": "2025-12-20 16:30:00"
  }
}
```

**Side Effects:**

- ✅ Nếu đã thanh toán → Hoàn tiền (payment_status = REFUNDED)
- ✅ Gửi notification + email cho customer
- ✅ Gửi notification cho restaurant

**Error case**

```json
// 400 - Booking không thể hủy
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Không thể huỷ booking đã hoàn tất hoặc NO_SHOW"
  }
}
```

---

## 17. PAYMENT

### 17.1. Pay Deposit

**Endpoint:** `POST /api/v1/miniapp/bookings/:id/pay-deposit`

**Auth Required:** ✅ Customer

**Description:** Thanh toán đặt cọc cho booking

**Request Body:**

```json
{
  "provider": "ZALOPAY",
  "mock_result": "SUCCESS"
}
```

**Field Definitions:**

- `provider` - Required: ZALOPAY | MOMO | VNPAY | CARD
- `mock_result` - Optional: SUCCESS | FAILED (test only)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Thanh toán cọc cho booking thành công",
  "data": {
    "id": 101,
    "payment_status": "PAID",
    "payment_status_label": "Đã thanh toán",
    "payment_provider": "ZALOPAY",
    "payment_reference": "PAY-101-1703123456789",
    "paid_at": "2025-12-20 17:00:00",
    "deposit_amount": 50000,
    "updated_at": "2025-12-20 17:00:00"
  }
}
```

**Side Effects:**

- ✅ Update payment_status = PAID
- ✅ Lưu payment_reference (transaction ID)
- ✅ Lưu paid_at (timestamp)
- ✅ Gửi notification cho customer
- ✅ Gửi notification cho restaurant
- ✅ Gửi email xác nhận thanh toán 📧 📧

**Error case**

```json
// 400 - Booking không yêu cầu cọc
{
  "success": false,
  "error":  {
    "code": "BAD_REQUEST",
    "message": "Booking này không yêu cầu đặt cọc"
  }
}

// 400 - Đã thanh toán rồi
{
  "success":  false,
  "error": {
    "code": "BAD_REQUEST",
    "message":  "Trạng thái thanh toán hiện tại không cho phép thanh toán cọc"
  }
}
```

**Frontend Integration:**

```javascript
// Flow thanh toán thực tế (production)
async function handlePayment(bookingId) {
  try {
    // 1. Call backend để tạo payment
    const response = await fetch(
      `/api/v1/miniapp/bookings/${bookingId}/pay-deposit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "ZALOPAY",
          mock_result: "SUCCESS", // Remove in production
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // 2. Show success message
      showToast("Thanh toán thành công! ");

      // 3. Navigate to booking detail
      navigateTo(`/bookings/${bookingId}`);

      // 4. User sẽ nhận email trong vài giây
    }
  } catch (error) {
    showToast("Thanh toán thất bại");
  }
}
```

---

## 18. REVIEWS

### 18.1. Create Review

**Endpoint:** `POST /api/v1/miniapp/reviews/bookings/:id/comment`

**Auth Required:** ✅ Customer

**Description:** Tạo review cho booking COMPLETED

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Món ăn ngon, phục vụ tốt!  Sẽ quay lại!"
}
```

**Field definitions**
`rating` - Required: 1-5 (integer)
`comment` - Optional: Nội dung review (max 500 chars)

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Tạo review thành công",
  "data": {
    "id": 50,
    "booking_id": 101,
    "restaurant_id": 1,
    "user_id": 10,
    "rating": 5,
    "comment": "Món ăn ngon, phục vụ tốt!  Sẽ quay lại!",
    "status": "VISIBLE",
    "created_at": "2025-12-22 08:00:00"
  }
}
```

**Side Effects:**

- ✅ Update restaurant.average_rating & review_count
- ✅ Gửi notification cho restaurant

**Error case**

```json
// 400 - Booking chưa COMPLETED
{
  "success":  false,
  "error": {
    "code": "BAD_REQUEST",
    "message":  "Chỉ có thể review booking đã hoàn tất (COMPLETED)"
  }
}

// 400 - Đã review rồi
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Bạn đã review booking này rồi"
  }
}
```

---

### 18.2. List My Reviews

**Endpoint:** `GET /api/v1/miniapp/reviews/my-reviews`

**Auth Required:** ✅ Customer

**Query parameters**
`limit` - Số lượng records
`offset` - Offset for pagination

**Request**

```http
GET /api/v1/miniapp/reviews/my-reviews?limit=10
Authorization: Bearer <access_token>
```

**Response**

```json
{
  "success": true,
  "message": "Lấy danh sách review của bạn thành công",
  "data": {
    "items": [
      {
        "id": 50,
        "booking_id": 101,
        "restaurant_id": 1,
        "rating": 5,
        "comment": "Món ăn ngon, phục vụ tốt! ",
        "status": "VISIBLE",
        "reply_comment": "Cảm ơn quý khách!",
        "reply_created_at": "2025-12-22 10:00:00",
        "created_at": "2025-12-22 08:00:00",
        "restaurant": {
          "id": 1,
          "name": "Nhà Hàng ABC",
          "main_image_url": "/uploads/restaurants/1/cover/image.jpg"
        }
      }
    ],
    "pagination": {
      "total": 8,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 18.3. Delete My Review

**Endpoint:** `DELETE /api/v1/miniapp/reviews/:id`

**Auth Required:** ✅ Customer

**Request**

```http
DELETE /api/v1/miniapp/reviews/50
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Xoá review thành công"
}
```

**Side Effects:**

- ✅ Update restaurant.average_rating & review_count

---

## 19. FAVORITES

### 19.1. List My Favorites

**Endpoint:** `GET /api/v1/miniapp/favorites`

**Auth Required:** ✅ Customer

**Query parameters**
`limit` - Số lượng records
`offset` - Offset for pagination

**Request**

```http
GET /api/v1/miniapp/favorites?limit=10
Authorization:  Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách nhà hàng yêu thích thành công",
  "data": {
    "items": [
      {
        "id": 30,
        "user_id": 10,
        "restaurant_id": 1,
        "created_at": "2025-12-20 10:00:00",
        "restaurant": {
          "id": 1,
          "name": "Nhà Hàng ABC",
          "address": "123 Đường XYZ, Quận 1, TP.HCM",
          "average_rating": 4.8,
          "review_count": 150,
          "main_image_url": "/uploads/restaurants/1/cover/image.jpg"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 19.2. Check Favorite Status

**Endpoint:** `GET /api/v1/miniapp/favorites/restaurants/:id/status`

**Auth Required:** ✅ Customer

**Request**

```http
GET /api/v1/miniapp/favorites/restaurants/1/status
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Kiểm tra trạng thái yêu thích thành công",
  "data": {
    "restaurant_id": 1,
    "is_favorite": true,
    "favorite_id": 30
  }
}
```

---

### 19.3. Add to Favorites

**Endpoint:** `POST /api/v1/miniapp/favorites/restaurants/:id/add`

**Auth Required:** ✅ Customer

**Request**

```http
POST /api/v1/miniapp/favorites/restaurants/1/add
Authorization: Bearer <access_token>
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Đã thêm vào danh sách yêu thích",
  "data": {
    "id": 30,
    "user_id": 10,
    "restaurant_id": 1,
    "created_at": "2025-12-20 10:00:00"
  }
}
```

**Side Effects:**

- ✅ Update restaurant.favorite_count

---

### 19.4. Remove from Favorites

**Endpoint:** `DELETE /api/v1/miniapp/favorites/restaurants/:id/remove`

**Auth Required:** ✅ Customer

**Request**

```http
DELETE /api/v1/miniapp/favorites/restaurants/1/remove
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Đã bỏ khỏi danh sách yêu thích"
}
```

**Side Effects:**

- ✅ Update restaurant.favorite_count

---

## 20. USER PROFILE

### 20.1. Get My Profile

**Endpoint:** `GET /api/v1/miniapp/users/me`

**Auth Required:** ✅ Customer

**Request**

```http
GET /api/v1/miniapp/users/me
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "id": 10,
    "display_name": "Nguyễn Văn C",
    "email": "customer@example.com",
    "phone": "0901234567",
    "avatar_url": "https://avatar.zaloapp.com/.. .",
    "created_at": "2025-12-15 10:00:00",
    "updated_at": "2025-12-20 10:00:00"
  }
}
```

---

### 20.2. Update My Profile

**Endpoint:** `PATCH /api/v1/miniapp/users/me`

**Auth Required:** ✅ Customer

**Request Body:** (all optional)

```json
{
  "display_name": "Nguyễn Văn C (Updated)",
  "phone": "0907654321",
  "email": "newemail@example.com",
  "avatar_url": "/uploads/users/10/avatar/new-avatar.jpg"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Cập nhật thông tin tài khoản thành công",
  "data": {
    "id": 10,
    "display_name": "Nguyễn Văn C (Updated)",
    "phone": "0907654321",
    "email": "newemail@example.com",
    "avatar_url": "/uploads/users/10/avatar/new-avatar.jpg",
    "updated_at": "2025-12-20 18:00:00"
  }
}
```

**Side Effects:**

- ✅ Tự động xóa avatar cũ nếu thay đổi

---

### 20.3. Change Password

**Endpoint:** `POST /api/v1/miniapp/users/me/change-password`

**Auth Required:** ✅ Customer

**Description:** Đổi mật khẩu (chỉ cho tài khoản local)

**Request Body:**

```json
{
  "current_password": "OldPassword123! ",
  "new_password": "NewPassword456!"
}
```

**Response** `200 Ok`

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công.  Vui lòng đăng nhập lại.",
  "data": {
    "id": 10
  }
}
```

**Side Effects:**

- ✅ **TẤT CẢ refresh tokens bị thu hồi**

**Error case**

```json
// 400 - Tài khoản Zalo không có password
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Tài khoản Zalo không hỗ trợ đổi mật khẩu"
  }
}

// 401 - Mật khẩu hiện tại sai
{
  "success":  false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Mật khẩu hiện tại không đúng"
  }
}
```

---

### 20.4. Upload User Avatar

**Endpoint:** `POST /api/v1/miniapp/uploads/images/users/avatar`

**Auth Required:** ✅ Customer

**Content-Type:** `multipart/form-data`

**Request**

```http
POST /api/v1/miniapp/uploads/images/users/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file:  [binary image data]
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "filename": "1703123456789-avatar.jpg",
    "path": "/uploads/users/10/avatar/1703123456789-avatar.jpg",
    "url": "http://localhost:3000/uploads/users/10/avatar/1703123456789-avatar.jpg"
  }
}
```

- Sau khi upload mới có ảnh để gọi api update profile user

**Notes:**

- ✅ Max size: 5MB
- ✅ Rate limit: 5 uploads/10 phút
- ✅ Sau khi upload → Call PATCH /users/me để update avatar_url

---

## 21. NOTIFICATIONS (MiniApp)

### 21.1. List My Notifications

**Endpoint:** `GET /api/v1/miniapp/notifications`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `read_status` - all/read/unread
- `type` - các loại notification type bên dưới
- `from_time` - cột mốc bắt đầu (optional)
- `to_time` - cột mốc kết thúc (optional)
- `limit`
- `offset`

**Request**

```http
GET /api/v1/miniapp/notifications?read_status=all&limit=20
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách notification thành công",
  "data": {
    "items": [
      {
        "id": 600,
        "user_id": 10,
        "restaurant_id": null,
        "type": "BOOKING_CREATED",
        "title": "Đặt bàn thành công",
        "message": "Bạn đã tạo booking mới tại Nhà Hàng ABC vào lúc 2025-12-20 15:00:00",
        "target_type": "BOOKING",
        "target_id": 101,
        "is_read": false,
        "created_at": "2025-12-20 15:00:00"
      },
      {
        "id": 601,
        "type": "BOOKING_PAYMENT_SUCCESS",
        "title": "Thanh toán cọc thành công",
        "message": "Bạn đã thanh toán cọc cho booking thành công",
        "is_read": false,
        "created_at": "2025-12-20 17:00:00"
      },
      {
        "id": 602,
        "type": "BOOKING_CONFIRMED",
        "title": "Booking đã được xác nhận",
        "message": "Nhà hàng đã xác nhận booking của bạn",
        "is_read": false,
        "created_at": "2025-12-20 18:00:00"
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 20,
      "offset": 0
    }
  }
}
```

**Notification Types:**

- `BOOKING_CREATED` - Booking được tạo
- `BOOKING_CONFIRMED` - Booking được xác nhận
- `BOOKING_CANCELLED` - Booking bị hủy
- `BOOKING_CHECKED_IN` - Booking đã check-in
- `BOOKING_PAYMENT_SUCCESS` - Thanh toán thành công
- `BOOKING_PAYMENT_FAILED` - Thanh toán thất bại
- `BOOKING_REFUND_SUCCESS` - Hoàn tiền thành công

---

### 21.2. Get Unread Count

**Endpoint:** `GET /api/v1/miniapp/notifications/unread-count`

**Auth Required:** ✅ Customer

**Request**

```http
GET /api/v1/miniapp/notifications/unread-count
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Lấy số lượng notification chưa đọc thành công",
  "data": {
    "unreadCount": 3
  }
}
```

---

### 21.3. Mark as Read

**Endpoint:** `PATCH /v1/miniapp/notifications/:id/read`

**Auth Required:** ✅ Customer

**Request**

```htpp
PATCH /api/v1/miniapp/notifications/600/read
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Đánh dấu notification là đã đọc thành công",
  "data": {
    "id": 600,
    "is_read": true,
    "updated_at": "2025-12-20 19:00:00"
  }
}
```

---

### 21.4. Mark All as Read

**Endpoint:** `PATCH /api/v1/miniapp/notifications/read-all`

**Auth Required:** ✅ Customer

**Request**

```http
PATCH /api/v1/miniapp/notifications/read-all
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Đánh dấu tất cả notification là đã đọc thành công",
  "data": {
    "affected_rows": []
  }
}
```

---

### 21.5. Delete All Read

**Endpoint:** `DELETE /api/v1/miniapp/notifications/read-all`

**Auth Required:** ✅ Customer

**Request**

```http
DELETE /api/v1/miniapp/notifications/read-all
Authorization: Bearer <access_token>
```

**Response**

```json
{
  "success": true,
  "message": "Xoá tất cả notification đã đọc thành công",
  "data": {
    "deleted_rows": []
  }
}
```

---

## APPENDIX

## Common Error Codes

| Code             | HTTP Status | Description                               |
| ---------------- | ----------- | ----------------------------------------- |
| `UNAUTHORIZED`   | 401         | Chưa đăng nhập hoặc token hết hạn         |
| `FORBIDDEN`      | 403         | Không có quyền truy cập                   |
| `BAD_REQUEST`    | 400         | Dữ liệu gửi lên không hợp lệ              |
| `NOT_FOUND`      | 404         | Tài nguyên không tồn tại                  |
| `CONFLICT`       | 409         | Xung đột dữ liệu (email đã tồn tại, etc.) |
| `INTERNAL_ERROR` | 500         | Lỗi server                                |

## COMMON USE CASES & FLOWS

### Flow 1: User đặt bàn lần đầu

```
1. GET /miniapp/restaurants/home/top-rated
   → Xem nhà hàng nổi bật

2. GET /miniapp/restaurants/1
   → Xem chi tiết nhà hàng

3. GET /miniapp/bookings/available-tables? restaurant_id=1&date=2025-12-25&time=19:00&people=4
   → Kiểm tra bàn trống

4. POST /miniapp/bookings
   → Tạo booking
   → Status: PENDING, Payment: PENDING

5. POST /miniapp/bookings/101/pay-deposit
   → Thanh toán đặt cọc
   → Status:  PENDING, Payment: PAID
   → Nhận email xác nhận

6. Wait for restaurant confirm...
   → Nhận notification khi restaurant confirm

7. Đến nhà hàng đúng giờ
   → Restaurant mark COMPLETED

8. POST /miniapp/reviews/bookings/101/comment
   → Review nhà hàng
```

---

### Flow 2: User thay đổi/hủy booking

```
1. GET /miniapp/bookings? category=upcoming
   → Xem booking sắp tới

2. GET /miniapp/bookings/101
   → Xem chi tiết booking

3a. PATCH /miniapp/bookings/101
    → Sửa thông tin (thời gian, số người, bàn)

3b.  PATCH /miniapp/bookings/101/cancel
    → Hủy booking
    → Hoàn tiền nếu đã thanh toán
    → Nhận email xác nhận hoàn tiền
```

---

### Flow 3: Dashboard quản lý booking

```
1. GET /dashboard/bookings? status=PENDING
   → Xem booking chờ xác nhận

2. GET /dashboard/bookings/101
   → Xem chi tiết booking

3. PATCH /dashboard/bookings/101/confirm
   → Xác nhận booking
   → Customer nhận notification

4. Khách đến nhà hàng...
   → PATCH /dashboard/bookings/101/complete
   → Mark booking là COMPLETED

5. Customer có thể review sau khi COMPLETED
```

---

## Email System

Hệ thống tự động gửi email khi:

- ✅ Thanh toán thành công → Email xác nhận thanh toán
- ✅ Thanh toán thất bại → Email thông báo thất bại
- ✅ Hoàn tiền → Email xác nhận hoàn tiền
- ✅ Nhắc nhở booking → Email nhắc nhở (24h và 2h trước)

Email sử dụng Gmail SMTP (development) hoặc SendGrid (production).

---

## Rate Limits

**Upload:**

- General: 20 uploads/15 phút
- Avatar: 5 uploads/10 phút
- Multiple: 5 requests/15 phút

**API Calls:**

- General: 100 requests/phút/IP
- Auth: 5 login attempts/phút/IP

---

## Support

**Backend Team:**

- Email: bdat6832@gmail.com
- Slack: #backend-support
