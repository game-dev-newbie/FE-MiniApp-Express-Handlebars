# 🔐 Tài Khoản Test - DineLink Mini App

## 📧 Đăng nhập bằng Email

### Tài khoản Admin
```
Email: admin@dinelink.com
Password: Admin123456
```

### Tài khoản User 1
```
Email: nguyenvana@gmail.com
Password: User123456
```

### Tài khoản User 2
```
Email: tranthib@gmail.com
Password: User123456
```

### Tài khoản Demo
```
Email: demo@dinelink.com
Password: Demo123456
```

---

## 📱 Đăng nhập bằng Zalo

- Nhấn nút "Đăng nhập bằng Zalo"
- Cho phép quyền truy cập thông tin cơ bản
- Hệ thống sẽ tự động tạo tài khoản nếu là lần đầu đăng nhập

---

## 🎭 Chế độ Khách

- Không cần đăng nhập
- Xem được danh sách nhà hàng
- Tìm kiếm nhà hàng
- **Không thể**:
  - Đặt bàn
  - Thích nhà hàng
  - Viết đánh giá
  - Xem lịch sử
  - Thay đổi giao diện (chỉ có chế độ sáng)

---

## 🔧 Lưu ý cho Backend Developer

Khi implement backend, các endpoint sau cần xử lý:

### POST /api/auth/login
**Request:**
```json
{
  "email": "nguyenvana@gmail.com",
  "password": "User123456",
  "provider": "EMAIL"
}
```

**Response (Success):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "display_name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "avatar_url": "https://i.pravatar.cc/150?img=1",
    "phone": "0901234567"
  }
}
```

### POST /api/auth/register
**Request:**
```json
{
  "email": "newuser@gmail.com",
  "password": "Password123",
  "display_name": "Tên người dùng",
  "provider": "EMAIL"
}
```

### POST /api/auth/zalo
**Request:**
```json
{
  "zalo_user_id": "1234567890",
  "display_name": "Tên Zalo",
  "avatar_url": "https://avatar.zalo.me/..."
}
```

### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // optional - nếu rotate
}
```

### POST /api/auth/logout
**Headers:**
```
Authorization: Bearer {accessToken}
```

---

## 🧪 Cách Test

1. **Mở ứng dụng** → Chế độ Khách (giao diện sáng cố định)
2. **Nhấn icon profile** → Yêu cầu đăng nhập
3. **Chọn "Đăng nhập"** → Điền email và mật khẩu từ danh sách trên
4. **Đăng nhập thành công** → Có thể đổi giao diện, đặt bàn, thích nhà hàng
5. **Test Logout** → Quay về chế độ Khách

---

## 🎨 Tính năng theo phân quyền

| Tính năng | Khách | Đã đăng nhập |
|-----------|-------|--------------|
| Xem danh sách nhà hàng | ✅ | ✅ |
| Tìm kiếm nhà hàng | ✅ | ✅ |
| Xem chi tiết nhà hàng | ✅ | ✅ |
| Đặt bàn | ❌ | ✅ |
| Thích nhà hàng | ❌ | ✅ |
| Viết đánh giá | ❌ | ✅ |
| Xem lịch sử đặt bàn | ❌ | ✅ |
| Xem yêu thích | ❌ | ✅ |
| Đổi giao diện sáng/tối | ❌ | ✅ |
| Nhận thông báo | ❌ | ✅ |

---

**Cập nhật:** 15/12/2025
