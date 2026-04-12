# Kiến Trúc Hệ Thống — JunTech Wedding Platform

> Cập nhật lần cuối: 06/04/2026

---

## 1. Sơ Đồ Tổng Quan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NGƯỜI DÙNG CUỐI                                   │
│                                                                             │
│    Khách mời (Mobile/Desktop)    Cặp đôi (khách hàng)    Quản trị viên     │
│           │                              │                      │           │
└───────────┼──────────────────────────────┼──────────────────────┼───────────┘
            │                              │                      │
            ▼                              ▼                      ▼
┌───────────────────┐         ┌────────────────────┐   ┌──────────────────────┐
│  /w/:slug         │         │  wedding-web        │   │  wedding-admin       │
│  Trang Thiệp Cưới │         │  Next.js 14         │   │  React + Vite        │
│  (Next.js SSR/CSR)│         │  Port 3001          │   │  Ant Design 5        │
│                   │         │                    │   │  Port 5173           │
│  - Cover Section  │         │  - Trang chủ       │   │                      │
│  - Hero + Phoenix │         │  - Mẫu thiệp       │   │  - Dashboard         │
│  - Family Info    │         │  - Đặt thuê        │   │  - Quản lý template  │
│  - Ceremony + RSVP│         │  - Dashboard       │   │  - Quản lý đơn hàng  │
│  - Countdown      │         │  - Đăng ký/nhập    │   │  - Quản lý coupon    │
│  - Gallery        │         │                    │   │  - Duyệt đánh giá    │
│  - Wishes/Guestbook│        └────────┬───────────┘   └──────────┬───────────┘
│  - Bank QR        │                  │                           │
│  - Music Player   │                  │ /api/* (proxy)            │ /api/admin/*
└───────────────────┘                  │                           │
            │                          │                           │
            │  GET /api/wedding/:slug   │                           │
            │  POST /api/wedding/:slug/rsvp                        │
            │  POST /api/wedding/:slug/wishes                      │
            └──────────────────────────┼───────────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────┐
                        │     Go Backend API        │
                        │     Gin Framework          │
                        │     Port 8080             │
                        │                          │
                        │  ┌────────────────────┐  │
                        │  │     Middleware      │  │
                        │  │  - CORS (*)        │  │
                        │  │  - AuthMiddleware  │  │
                        │  │  - AdminMiddleware │  │
                        │  └────────────────────┘  │
                        │                          │
                        │  ┌────────────────────┐  │
                        │  │     Handlers       │  │
                        │  │  - auth            │  │
                        │  │  - order           │  │
                        │  │  - wedding_info    │  │
                        │  │  - public_wedding  │  │
                        │  │  - template        │  │
                        │  │  - admin           │  │
                        │  │  - upload          │  │
                        │  └────────────────────┘  │
                        │                          │
                        │  ┌────────────────────┐  │
                        │  │     GORM ORM       │  │
                        │  └────────────────────┘  │
                        └──────────────┬───────────┘
                                       │
                          ┌────────────┼────────────┐
                          │                         │
                          ▼                         ▼
              ┌───────────────────┐    ┌────────────────────┐
              │   MySQL Database  │    │   File System      │
              │   Port 3306       │    │   ./uploads/       │
              │   Charset: utf8mb4│    │   (ảnh upload)     │
              └───────────────────┘    └────────────────────┘
```

---

## 2. Luồng Dữ Liệu Chi Tiết

### 2.1 Luồng Xem Thiệp Cưới (Khách Mời)

```
Khách mời truy cập /w/ten-co-dau-chu-re
    │
    ▼
Next.js Client Component (app/w/[slug]/page.tsx)
    │
    ├─ fetch GET /api/wedding/:slug
    │       │
    │       ▼ (qua next.config.mjs rewrite)
    │  Go Handler: GetPublicWeddingData
    │       │
    │       ├─ Query: orders WHERE custom_domain = slug AND status = 'published'
    │       ├─ Query: order_items → templates
    │       ├─ Query: wedding_info WHERE order_id = ?
    │       ├─ Query: guest_wishes (50 mới nhất)
    │       ├─ Query: COUNT rsvp_responses WHERE attending = true
    │       └─ Parse JSON: bank_accounts, gallery_urls
    │
    ▼ Response: WeddingData
getThemeComponent(data.template.theme_slug)
    │
    ▼ → SongPhungTheme (mặc định)
    │
    ├─ CoverSection (màn hình bìa, animation)
    ├─ HeroSection (phượng hoàng + tên)
    ├─ FamilySection (cha mẹ hai bên)
    ├─ CeremonySection (lễ cưới + RSVP form)
    │       │ POST /api/wedding/:slug/rsvp
    │       └─ Go: SubmitRSVP → INSERT rsvp_responses
    ├─ CountdownSection (đồng hồ đếm ngược)
    ├─ GallerySection (ảnh từ gallery_urls)
    ├─ WishesSection (sổ lưu bút)
    │       │ POST /api/wedding/:slug/wishes
    │       └─ Go: SubmitWish → INSERT guest_wishes
    ├─ BankSection (QR VietQR API)
    └─ FooterSection
```

### 2.2 Luồng Đặt Thuê Thiệp (Khách Hàng)

```
Khách hàng chọn mẫu thiệp
    │
    ├─ GET /api/templates?category_id=&sort=&page=
    │   → GetTemplates → SELECT templates WHERE is_active = 1
    │
    ├─ GET /api/templates/:slug
    │   → GetTemplateBySlug → view_count += 1
    │
    ▼ (Đăng nhập nếu chưa có token)
POST /api/auth/login → { token, user }
    │ → JWT HS256, TTL 72 giờ
    │ → Lưu vào localStorage qua Zustand
    │
    ▼ (Tạo đơn hàng)
POST /api/orders (Authorization: Bearer <token>)
    Body: { package_type, rental_start, duration_days, items, coupon_code }
    │
    ▼ Go: CreateOrder
    ├─ Tính giá: daily = price_per_day × days; monthly = price_per_month × ⌈days/30⌉
    ├─ Kiểm tra coupon (nếu có): valid + chưa hết hạn + chưa đủ max_uses + min_order
    │   → used_count += 1 (atomic)
    ├─ INSERT orders + order_items
    └─ Response: order với status = 'pending'
    │
    ▼ (Thanh toán — hiện tại thủ công)
Admin cập nhật: PUT /api/admin/orders/:id/status { status: "paid" }
    │
    ▼ (Nhập thông tin đám cưới)
PUT /api/orders/:id/wedding
    Body: { groom_name, bride_name, ..., bank_accounts, gallery_urls }
    → UPSERT wedding_info
    │
    ▼ (Xuất bản)
POST /api/orders/:id/publish
    → order.status = 'published'
    → published_url = custom_domain hoặc /wedding/{order_id}
    │
    ▼ Thiệp có thể truy cập tại /w/:slug
```

### 2.3 Luồng Xác Thực JWT

```
Client gửi POST /api/auth/login { email, password }
    │
    ▼ Go: Login handler
    ├─ SELECT user WHERE email = ?
    ├─ bcrypt.CompareHashAndPassword(storedHash, inputPassword)
    └─ utils.GenerateToken(user.ID, user.Email, user.Role)
        → JWT với claims: { user_id, email, role }
        → Ký bằng HMAC-SHA256 với JWT_SECRET
        → TTL: 72 giờ
    │
    ▼ Response: { token, user }

Request tiếp theo gửi: Authorization: Bearer <token>
    │
    ▼ AuthMiddleware
    ├─ Parse header → token string
    ├─ utils.ParseToken() → *JWTClaims
    ├─ Set context: user_id, user_email, user_role
    └─ c.Next()

AdminMiddleware (áp dụng sau AuthMiddleware)
    ├─ Đọc user_role từ context
    └─ Nếu role != "admin" → 403 Forbidden
```

---

## 3. Kiến Trúc Theme System

```
registry.ts
┌─────────────────────────────────────────────────────┐
│  THEME_REGISTRY: Record<string, ComponentType<...>> │
│                                                     │
│  'songphung-red' → SongPhungTheme                  │
│  'minimal-white' → (chưa có — Phase 4)             │
│  'vintage-floral' → (chưa có — Phase 4)            │
│                                                     │
│  getThemeComponent(slug) → Component (fallback SongPhung)│
│  getAvailableThemes() → string[]                    │
└─────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  SongPhungTheme (root component)        │
│  Props: { data: WeddingData }           │
│                                         │
│  State:                                 │
│  - coverVisible: boolean                │
│  - isPlaying: boolean (music)           │
│  - audioRef: HTMLAudioElement           │
│  - parallaxRefs: []                     │
│                                         │
│  Layout (max-width: 800px, centered):   │
│  ┌─────────────────────────────────┐    │
│  │ [CoverSection] — fixed overlay  │    │
│  │ [HeroSection]                   │    │
│  │ [FamilySection]                 │    │
│  │ [CeremonySection + RSVP]        │    │
│  │ [CountdownSection]              │    │
│  │ [GallerySection]                │    │
│  │ [WishesSection]                 │    │
│  │ [BankSection]                   │    │
│  │ [FooterSection]                 │    │
│  └─────────────────────────────────┘    │
│  [Music Button] — fixed bottom-right    │
└─────────────────────────────────────────┘
```

### Thiết Kế Theme songphung-red

**Bảng Màu:**
- Đỏ đậm (primary): `#5F191D`
- Nền kem (background): `#F8F2ED`
- Nền ngoài: `#E8D5C4`
- Vàng (accent): `#C8963C`
- Nâu đất (text): `#3D1010`

**Typography:**
- Tiêu đề: `'Cormorant Garamond', serif` (font chữ cổ điển sang trọng)
- Body: `'Be Vietnam Pro', sans-serif` (font tiếng Việt rõ ràng)

**Assets:**
- `phoenix.webp`: Phượng hoàng xuất hiện ở Cover (2 con, vị trí asymmetric) và Hero (full height)
- `chu-hy.webp`: Chữ Hỷ trung tâm ở Hero + trang trí Cover
- `flower.webp`: Hoa trang trí góc các section
- `paper-bg.jpg`: Texture nền giấy lặp lại

**Animation:**
- Framer Motion cho: fade in, slide in từ trái/phải, scale
- CSS Keyframes cho: musicPulse, floatSlow, shimmer, blink, fadeInUp
- Parallax: scroll event + rAF, clamp ±80px

---

## 4. Cấu Trúc Database (ERD Đơn Giản)

```
users (1) ──────────────────── (N) orders
                                        │
                                        ├── (N) order_items ──── (1) templates
                                        │                               │
                                        │                        (1) template_categories
                                        │
                                        ├── (1) wedding_info
                                        │
                                        ├── (N) rsvp_responses
                                        │
                                        ├── (N) guest_wishes
                                        │
                                        └── (1) coupons [optional]

templates ──── (N) reviews ──── (1) users

themes ── (standalone, slug maps to THEME_REGISTRY in frontend)

banners ── (standalone, không liên kết)

payments ── (N) → orders [model có nhưng chưa được sử dụng]
```

---

## 5. Giao Tiếp Giữa Các Service

### 5.1 wedding-web → Go API

| Cơ chế | Mô tả |
|--------|-------|
| Next.js rewrites | `/api/*` → `http://localhost:8080/api/*` (development) |
| Axios interceptor | Tự đính kèm `Authorization: Bearer <token>` từ localStorage |
| TanStack Query | Cache response, retry 1 lần khi lỗi |

### 5.2 wedding-admin → Go API

| Cơ chế | Mô tả |
|--------|-------|
| Vite proxy (cần cấu hình) hoặc CORS | Gọi trực tiếp backend |
| Axios instance | `baseURL: '/api'`, đính kèm token admin |

### 5.3 BankSection → VietQR API

```
BankSection.tsx
    │
    ├─ getBankCode(bankName) → 'VCB', 'TCB', 'MB'...
    └─ getQrUrl(bank, account)
           → `https://img.vietqr.io/image/${bankCode}-${account}-compact.png`

Gọi trực tiếp từ browser — không qua backend
Hỗ trợ 30+ ngân hàng Việt Nam
```

### 5.4 CeremonySection → Google Calendar

Tạo URL Google Calendar với params: text, dates, details, location — mở tab mới.

---

## 6. Bảo Mật

| Lớp | Cơ Chế |
|-----|--------|
| Xác thực | JWT HS256, TTL 72h, secret từ env |
| Mật khẩu | bcrypt với DefaultCost (10) |
| File upload | Whitelist MIME type, giới hạn 5MB |
| Phân quyền | Role-based: `user` / `admin` |
| CORS | Hiện tại `*` — cần giới hạn trong production |
| SQL Injection | GORM parameterized queries |

---

## 7. Điểm Cần Cải Thiện Về Kiến Trúc

| Vấn Đề | Hiện Tại | Đề Xuất |
|--------|----------|---------|
| File upload | Local filesystem `./uploads/` | CDN (S3, Cloudflare R2) |
| Refresh token | Không có | Thêm refresh token với TTL 30 ngày |
| CORS | `*` | Giới hạn theo domain cụ thể |
| Payment | Chưa có | Tích hợp SePay/VNPay |
| Logging | Gin default | Structured logging (zap/slog) |
| Health check | Không có | GET /health endpoint |
| Rate limiting | Không có | gin-ratelimit cho API công khai |
| Migrations | Thư mục rỗng | golang-migrate hoặc GORM AutoMigrate |
| Monitoring | Không có | Prometheus + Grafana |
