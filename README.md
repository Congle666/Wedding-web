# JunTech — Nền Tảng Thiệp Cưới Trực Tuyến

Nền tảng thiệp cưới online dành cho thị trường Việt Nam. Cặp đôi có thể chọn mẫu thiệp đẹp, nhập thông tin đám cưới và chia sẻ thiệp đến khách mời qua một đường link — không cần kỹ thuật.

---

## Công Nghệ Sử Dụng

| Lớp | Stack |
|-----|-------|
| Backend API | Go 1.25, Gin, GORM, MySQL |
| Frontend (khách hàng) | Next.js 14 (App Router), React 18, TypeScript |
| Admin Panel | React 18, Vite, Ant Design 5 |
| Xác thực | JWT HS256 |
| State | Zustand 5, TanStack Query v5 |

---

## Cấu Trúc Dự Án

```
GoLang_Wedding/
├── main.go              # Entry point Go API (port 8080)
├── config/              # Kết nối MySQL (GORM)
├── handlers/            # HTTP handlers (auth, order, wedding, admin...)
├── middleware/          # JWT auth + admin role check
├── models/              # GORM models (users, orders, templates, v.v.)
├── routes/              # Toàn bộ routes (public, protected, admin)
├── utils/               # JWT, response helpers
├── uploads/             # Ảnh upload lưu local
├── wedding-web/         # Next.js 14 — trang khách hàng + thiệp cưới
└── wedding-admin/       # React + Vite — trang quản trị
```

---

## Tính Năng Chính

### Trang Thiệp Cưới (theme `songphung-red`)
- Màn hình bìa animation với phượng hoàng và nút "Mở thiệp"
- Hero section: hai phượng hoàng đối xứng, chữ Hỷ trung tâm
- Thông tin gia đình hai bên
- Chi tiết lễ cưới, thêm vào Google Calendar
- Đồng hồ đếm ngược đến ngày cưới
- Thư viện ảnh cưới
- Sổ lưu bút / gửi lời chúc
- Hộp mừng cưới: QR code chuyển khoản (VietQR, 30+ ngân hàng)
- RSVP xác nhận tham dự
- Nhạc nền tự động phát, nút bật/tắt

### Hệ Thống Theme
```typescript
// components/themes/registry.ts
const THEME_REGISTRY = {
  'songphung-red': SongPhungTheme,
  // Thêm theme mới tại đây
};
```
Để thêm theme mới: tạo thư mục `components/themes/<slug>/`, export component nhận `{ data: WeddingData }`, đăng ký vào registry.

### Backend API
- Xác thực JWT (đăng ký, đăng nhập, 72h TTL)
- Quản lý đơn hàng (pending → paid → published)
- Mã giảm giá (phần trăm / cố định)
- Upload ảnh (JPG, PNG, WebP, GIF, max 5MB)
- API công khai cho thiệp: RSVP, lời chúc, xem thông tin

### Admin Panel
Dashboard với biểu đồ doanh thu, quản lý template, đơn hàng, người dùng, banner, mã giảm giá, duyệt đánh giá.

---

## Cài Đặt & Chạy

### Yêu Cầu
- Go 1.25+
- Node.js 18+
- MySQL 8.0+

### Backend

```bash
# Tạo file .env
cp .env.example .env
# Điền DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT

go mod download
go run main.go
# → Chạy tại http://localhost:8080
```

### Frontend (cổng 3001)

```bash
cd wedding-web
npm install
npm run dev
# → Chạy tại http://localhost:3001
# Proxy /api/* → http://localhost:8080/api/*
```

### Admin Panel (cổng 5173)

```bash
cd wedding-admin
npm install
npm run dev
# → Chạy tại http://localhost:5173
```

---

## Biến Môi Trường Backend

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=wedding_db
JWT_SECRET=your_jwt_secret
PORT=8080
```

---

## API Nhanh

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/wedding/:slug` | Dữ liệu thiệp công khai | Không |
| POST | `/api/wedding/:slug/rsvp` | Gửi RSVP | Không |
| POST | `/api/wedding/:slug/wishes` | Gửi lời chúc | Không |
| POST | `/api/auth/login` | Đăng nhập | Không |
| POST | `/api/orders` | Tạo đơn thuê thiệp | JWT |
| PUT | `/api/orders/:id/wedding` | Cập nhật thông tin đám cưới | JWT |
| POST | `/api/orders/:id/publish` | Xuất bản thiệp | JWT |
| POST | `/api/upload/image` | Upload ảnh | JWT |

Xem đầy đủ tại [`docs/codebase-summary.md`](./docs/codebase-summary.md).

---

## Xem Trước Theme

```
http://localhost:3001/w/preview/songphung-red
```

---

## Tài Liệu

| Tài liệu | Mô tả |
|----------|-------|
| [`docs/project-overview-pdr.md`](./docs/project-overview-pdr.md) | Tổng quan sản phẩm và yêu cầu phát triển |
| [`docs/codebase-summary.md`](./docs/codebase-summary.md) | Tóm tắt codebase và schema database |
| [`docs/system-architecture.md`](./docs/system-architecture.md) | Kiến trúc hệ thống và luồng dữ liệu |
| [`docs/code-standards.md`](./docs/code-standards.md) | Tiêu chuẩn code Go + React/TypeScript |

---

## Hạn Chế Hiện Tại

- Nhạc nền hardcoded (`/themes/songphung-red/music.mp3`)
- Ngày âm lịch chưa được tính chuyển đổi thực sự
- Thanh toán thủ công (chưa tích hợp VNPay/MoMo)
- Chỉ có 1 theme (`songphung-red`); registry đã sẵn sàng cho theme mới
- Ảnh upload lưu local (chưa có CDN)
