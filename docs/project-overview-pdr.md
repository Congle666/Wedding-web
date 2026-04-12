# Tổng Quan Dự Án & Yêu Cầu Phát Triển Sản Phẩm (PDR)

> Cập nhật lần cuối: 06/04/2026

---

## 1. Tổng Quan Dự Án

**JunTech** là nền tảng thiệp cưới trực tuyến dành cho thị trường Việt Nam. Khách hàng có thể thuê mẫu thiệp cưới đẹp, nhập thông tin đám cưới, xuất bản thiệp lên một đường dẫn riêng và chia sẻ đến khách mời chỉ trong vài phút.

### 1.1 Mục Tiêu Sản Phẩm

- Cung cấp các mẫu thiệp cưới trực tuyến đẹp, mang phong cách Việt Nam
- Cho phép cặp đôi tự tuỳ chỉnh thông tin (tên, ngày cưới, địa điểm, ảnh, tài khoản ngân hàng) mà không cần kỹ thuật
- Khách mời có thể xác nhận tham dự (RSVP), gửi lời chúc, và quét mã QR chuyển khoản mừng cưới ngay trên thiệp
- Quản trị viên có thể quản lý toàn bộ mẫu thiệp, đơn hàng, người dùng, mã giảm giá và banner qua giao diện admin

### 1.2 Đối Tượng Người Dùng

| Vai trò | Mô tả |
|---------|-------|
| Cặp đôi (khách hàng) | Đăng ký, chọn mẫu, thuê, nhập thông tin đám cưới, xuất bản thiệp |
| Khách mời | Xem thiệp, RSVP, gửi lời chúc, xem QR chuyển khoản |
| Quản trị viên | Quản lý toàn bộ hệ thống qua trang admin |

---

## 2. Tính Năng Hiện Tại

### 2.1 Trang Thiệp Cưới (Guest-Facing)

Các tính năng đã triển khai trong theme `songphung-red`:

| Tính năng | Mô tả |
|-----------|-------|
| **Trang bìa (Cover)** | Màn hình full-screen với tên cặp đôi, ngày cưới, ảnh phượng hoàng hai bên, nút "Mở thiệp" có animation fade-out |
| **Hero Section** | Hai phượng hoàng đối xứng, tên cặp đôi, chữ Hỷ (Double Happiness) trung tâm, dải đỏ phía dưới |
| **Thông Tin Gia Đình** | Tên cha mẹ hai bên, tên cô dâu và chú rể |
| **Chi Tiết Lễ Cưới** | Giờ đón khách, giờ khai tiệc (+30 phút), ngày, địa điểm, địa chỉ, nhúng Google Maps, thêm vào Google Calendar |
| **Đếm Ngược** | Đồng hồ đếm ngược theo giây đến ngày cưới |
| **Thư Viện Ảnh** | Gallery ảnh cưới từ URL được lưu trong `gallery_urls` |
| **Sổ Lưu Bút / Lời Chúc** | Form gửi lời chúc (tên + nội dung), hiển thị danh sách lời chúc (optimistic update) |
| **Hộp Mừng Cưới** | QR code chuyển khoản ngân hàng (VietQR API), sao chép số tài khoản, tải QR |
| **RSVP** | Form xác nhận tham dự (tên, điện thoại, số người, lời chúc) tích hợp trong phần lễ |
| **Nhạc Nền** | Nhạc nền tự động phát khi mở thiệp, nút bật/tắt nhạc cố định góc phải màn hình |
| **Hiệu Ứng Parallax** | Các phần tử trang trí di chuyển với tốc độ khác nhau khi cuộn trang |
| **Responsive** | Thiết kế tương thích với màn hình mobile, tablet, desktop |

### 2.2 Trang Thương Mại (wedding-web)

| Tính năng | Mô tả |
|-----------|-------|
| Trang chủ | Hero banner, mẫu thiệp nổi bật, cách hoạt động, thống kê, đánh giá |
| Danh sách mẫu thiệp | Lọc theo danh mục, giá, có video; sắp xếp theo mới nhất/phổ biến/giá |
| Chi tiết mẫu thiệp | Xem ảnh preview, thông tin giá, đặt thuê |
| Đặt thuê | Chọn gói (ngày/tháng), thời gian thuê, nhập mã giảm giá |
| Dashboard người dùng | Quản lý đơn hàng, nhập thông tin đám cưới, xuất bản thiệp |
| Xác thực | Đăng ký, đăng nhập (JWT), quản lý profile |

### 2.3 Trang Quản Trị (wedding-admin)

| Module | Tính năng |
|--------|-----------|
| Dashboard | Thống kê đơn hàng, doanh thu, người dùng mới, lời nhận xét chờ duyệt; biểu đồ theo ngày/tuần/tháng/quý/năm |
| Mẫu thiệp | CRUD mẫu thiệp, quản lý trường tuỳ chỉnh, gán theme |
| Danh mục | CRUD danh mục mẫu thiệp |
| Đơn hàng | Xem danh sách, lọc theo trạng thái, cập nhật trạng thái, xem chi tiết kèm thông tin đám cưới |
| Người dùng | Xem danh sách, tìm kiếm, xem chi tiết kèm số đơn hàng |
| Banner | CRUD banner quảng cáo theo vị trí (home_top, home_middle...) |
| Mã giảm giá | CRUD coupon (phần trăm/cố định), quản lý giới hạn sử dụng và hạn dùng |
| Đánh giá | Duyệt/xoá đánh giá của người dùng |

---

## 3. Kiến Trúc Kỹ Thuật

### 3.1 Stack Công Nghệ

| Lớp | Công nghệ |
|-----|-----------|
| Backend API | Go 1.25, Gin v1.12, GORM v1.31 |
| Cơ sở dữ liệu | MySQL (utf8mb4) |
| Frontend khách hàng | Next.js 14 (App Router), React 18, TypeScript 5 |
| Frontend admin | React 18, Vite 6, Ant Design 5, React Router v6 |
| Xác thực | JWT (HS256, TTL 72 giờ) |
| State management | Zustand 5 |
| Data fetching | TanStack Query v5 |
| Form | React Hook Form + Zod |

### 3.2 Luồng Nghiệp Vụ Chính

```
Khách hàng đăng ký
    → Chọn mẫu thiệp (GET /api/templates)
    → Tạo đơn hàng (POST /api/orders) + áp mã giảm giá
    → Thanh toán (thủ công/chuyển khoản)
    → Admin xác nhận thanh toán → status = "paid"
    → Khách hàng nhập thông tin đám cưới (PUT /api/orders/:id/wedding)
    → Xuất bản thiệp (POST /api/orders/:id/publish) → status = "published"
    → Khách mời truy cập /w/:slug → xem thiệp, RSVP, gửi lời chúc
```

---

## 4. Yêu Cầu Phát Triển Sản Phẩm (PDR)

### 4.1 Yêu Cầu Chức Năng Đã Hoàn Thành

- [x] Xác thực người dùng JWT (đăng ký, đăng nhập, cập nhật profile)
- [x] Quản lý đơn hàng với trạng thái (pending → paid → published → expired/cancelled)
- [x] Hệ thống mã giảm giá (phần trăm và cố định, giới hạn số lần dùng, ngày hết hạn)
- [x] Tải ảnh lên server (JPG, PNG, WebP, GIF, tối đa 5MB, tối đa 10 file/lần)
- [x] Xuất bản thiệp theo custom domain hoặc slug
- [x] API công khai cho thiệp cưới (không cần xác thực)
- [x] RSVP và sổ lưu bút công khai
- [x] Theme `songphung-red` hoàn chỉnh với tất cả các section
- [x] Registry hệ thống theme (dễ thêm theme mới)
- [x] Trang preview theme `/w/preview/:theme`
- [x] Dashboard admin với biểu đồ doanh thu
- [x] Banner quảng cáo với theo dõi click/view

### 4.2 Khoảng Trống Đã Xác Định (Gaps)

| # | Khoảng Trống | Ưu Tiên | Ghi Chú |
|---|-------------|---------|---------|
| 1 | **Nhạc nền hardcoded** | Cao | Đường dẫn `/themes/songphung-red/music.mp3` cứng trong code, không cho phép cặp đôi chọn nhạc |
| 2 | **Không có ngày âm lịch** | Cao | `getLunarDateApprox()` trong `CeremonySection` chỉ trả về chuỗi placeholder `"... tháng ... năm"` |
| 3 | **Chỉ hỗ trợ 1 lễ** | Trung bình | `WeddingInfo` chỉ có 1 `ceremony_venue` + 1 `reception_venue`, không hỗ trợ lễ ăn hỏi riêng |
| 4 | **Không có bảng cá nhân hoá khách mời** | Trung bình | Không có `guest_personalization` table; `CoverSection` nhận `guestName` prop nhưng không có cơ chế truyền tên khách từ URL |
| 5 | **Thanh toán thủ công** | Cao | Chưa tích hợp cổng thanh toán (VNPay, MoMo, ZaloPay); model `Payment` đã tồn tại nhưng chưa dùng |
| 6 | **Chỉ có 1 theme** | Trung bình | Registry đã sẵn sàng cho `minimal-white`, `vintage-floral` (comment Phase 4) nhưng chưa triển khai |
| 7 | **Không có email notification** | Thấp | Không có hệ thống gửi email xác nhận đơn hàng, thông báo RSVP |
| 8 | **Không có tìm kiếm mẫu thiệp** | Thấp | `GetTemplates` lọc theo category_id, giá nhưng không hỗ trợ tìm kiếm full-text |
| 9 | **Custom domain chưa hoạt động hoàn chỉnh** | Trung bình | Trường `custom_domain` lưu trong DB nhưng chưa có cơ chế cấu hình DNS |
| 10 | **Migrations chưa được code hoá** | Trung bình | Thư mục `migrations/` tồn tại nhưng rỗng; schema được quản lý bên ngoài |

### 4.3 Yêu Cầu Phi Chức Năng

| Yêu Cầu | Trạng Thái |
|---------|-----------|
| CORS cho phép `*` (cần giới hạn trong production) | Cần cải thiện |
| JWT TTL 72 giờ, không có refresh token | Cần cải thiện |
| Upload file lưu local `/uploads/` (cần CDN) | Cần cải thiện |
| Rate limiting cho API công khai | Chưa có |
| Logging cấu trúc (structured logging) | Chưa có (dùng gin default) |
| Health check endpoint | Chưa có |

### 4.4 Lộ Trình Phát Triển Đề Xuất

**Giai Đoạn 1 - Hoàn Thiện Core (Ưu tiên cao)**
1. Tích hợp cổng thanh toán (SePay/VNPay)
2. Thêm ngày âm lịch (dùng thư viện chuyển đổi âm dương lịch)
3. Cho phép cặp đôi upload/chọn nhạc nền
4. Thêm URL param `?guest=TênKháchMời` để cá nhân hoá trang bìa

**Giai Đoạn 2 - Mở Rộng Theme**
1. Triển khai theme `minimal-white` (trắng, tối giản)
2. Triển khai theme `vintage-floral` (hoa cổ điển)
3. Admin UI chọn/assign theme cho template

**Giai Đoạn 3 - Tính Năng Nâng Cao**
1. Hỗ trợ nhiều lễ (ăn hỏi + đám cưới)
2. Email notification (SES/SendGrid)
3. Upload ảnh lên CDN (S3/Cloudflare R2)
4. Tìm kiếm full-text mẫu thiệp

---

## 5. Định Nghĩa Thành Công

| Chỉ Số | Mục Tiêu |
|--------|----------|
| Thời gian xuất bản thiệp từ đăng ký | < 10 phút |
| Thời gian load trang thiệp | < 2 giây (LCP) |
| Tỷ lệ thiệp mobile-friendly | 100% |
| Số theme có sẵn | >= 3 theme |
| Tỷ lệ RSVP thành công | >= 99% uptime |
