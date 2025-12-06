# Miniapp Zalo FE (Vite)

Frontend cho miniapp đặt bàn nhà hàng, build bằng **Vite + JavaScript**.

---

## 1. Yêu cầu môi trường

- **Node.js**: khuyến nghị **v18+** (ít nhất v16)
- **npm**: đi kèm Node

Kiểm tra nhanh:

```bash
node -v
npm -v
```

---

## 2. Clone & cài đặt

```bash
git clone <URL-REPO>
cd <TEN_FOLDER_PROJECT>
npm install    # hoặc: npm ci nếu muốn dùng đúng package-lock
```

Sau bước này trong project sẽ có thư mục `node_modules/`.

---

## 3. Cấu hình biến môi trường

Project dùng file `.env` cho các biến môi trường phía FE.

1. Tạo file `.env` từ template có sẵn:

   ```bash
   # Linux / macOS
   cp .env.example .env

   # Windows (PowerShell) có thể copy bằng tay trong Explorer
   ```

2. Mở file `.env` và chỉnh sửa cho phù hợp môi trường dev:

   Ví dụ:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

   **Lưu ý:**  
   - Mọi biến muốn dùng trong code FE **bắt buộc** phải bắt đầu bằng `VITE_`.
   - Khi chỉnh `.env` xong cần **restart** lệnh `npm run dev`.

---

## 4. Chạy môi trường development

```bash
npm run dev
```

Vite sẽ in ra địa chỉ, thường là:

- `http://localhost:5173/`

Mở trình duyệt vào URL đó để xem miniapp FE.

Nếu port 5173 bị chiếm, Vite sẽ tự chọn port khác – nhìn log trên terminal để biết port chính xác.

---

## 5. Build bản production

Khi cần build để deploy (hoặc tích hợp vào Zalo Mini App):

```bash
npm run build
```

Kết quả sẽ nằm trong thư mục `dist/`:

- `dist/index.html`
- `dist/assets/...` (JS/CSS đã bundle)

Có thể dùng `npm run preview` để chạy thử bản build:

```bash
npm run preview
```

---

## 6. Cấu trúc thư mục (tóm tắt)

```txt
public/
  vite.svg              # static assets public

src/
  api/                  # hàm gọi API tới backend (fetch)
  assets/               # hình ảnh/icon dùng trong FE
  core/                 # router, config lõi, helpers chung
  styles/               # file CSS global
  templates/            # template Handlebars / HTML fragment
  views/                # file JS cho từng "màn" (home, search, booking,...)
  main.js               # entry chính, khởi tạo app, router

.env.example            # mẫu biến môi trường
index.html              # HTML gốc cho Vite
vite.config.js          # cấu hình Vite
package.json            # scripts & dependencies
```

Team FE tuân theo cấu trúc này khi thêm view/API/template mới để dễ maintain.

---

## 7. Lỗi thường gặp

- **`Missing script: dev`**  
  → Đảm bảo đang đứng đúng thư mục (chỗ có `package.json`), và `package.json` có script `"dev": "vite"`.

- **Không đọc được biến môi trường**  
  - Kiểm tra đã có file `.env` chưa (không phải `.env.example`).
  - Key phải bắt đầu bằng `VITE_`.
  - Restart `npm run dev` sau khi sửa `.env`.

- **Không vào được `localhost:5173`**  
  - Xem log Vite trên terminal, có thể nó đang chạy port khác (VD: 5174).
  - Kiểm tra firewall / proxy nếu có.

---

## 8. Quy ước chung cho team

- Mọi URL gọi backend đọc từ `import.meta.env.VITE_API_BASE_URL`.
- Khi thêm màn hình mới:
  - Tạo file view trong `src/views/`.
  - Nếu cần template `.hbs` thì đặt trong `src/templates/`.
  - Đăng ký route trong router (trong `src/core/...` hoặc `main.js` tuỳ cách tổ chức hiện tại).
- Không commit file `.env` (chỉ commit `.env.example`).
