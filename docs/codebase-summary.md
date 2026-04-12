# Tóm Tắt Codebase — JunTech Wedding Platform

> Cập nhật lần cuối: 06/04/2026

---

## 1. Cấu Trúc Thư Mục Tổng Quan

```
GoLang_Wedding/
├── config/                     # Kết nối cơ sở dữ liệu
│   └── database.go
├── handlers/                   # HTTP handlers (business logic)
│   ├── admin_handler.go        # Quản lý template, banner, order, review, user, category, coupon, dashboard
│   ├── auth_handler.go         # Đăng ký, đăng nhập, profile
│   ├── banner_handler.go       # Banner công khai (GET + click tracking)
│   ├── coupon_handler.go       # Kiểm tra mã giảm giá (admin CRUD trong admin_handler)
│   ├── helpers.go              # Hàm tiện ích dùng chung (parseDateTime)
│   ├── order_handler.go        # CRUD đơn hàng của người dùng
│   ├── public_wedding_handler.go # API công khai thiệp cưới, RSVP, lời chúc
│   ├── review_handler.go       # Đánh giá template
│   ├── template_handler.go     # Danh sách template công khai
│   ├── theme_handler.go        # Danh sách themes (admin)
│   ├── upload_handler.go       # Upload ảnh (single + multiple)
│   ├── wedding_info_handler.go # CRUD thông tin đám cưới, xuất bản
│   └── wedding_render_handler.go # Server-side render trang cưới (GET /w/:slug)
├── middleware/
│   └── auth_middleware.go      # JWT auth + admin role check
├── migrations/                 # Thư mục rỗng (schema quản lý bên ngoài)
├── models/                     # GORM models / database schema
│   ├── banner.go
│   ├── coupon.go
│   ├── order.go
│   ├── order_item.go
│   ├── payment.go
│   ├── review.go
│   ├── rsvp.go                 # RSVPResponse + GuestWish
│   ├── template.go             # Template + TemplateCategory
│   ├── theme.go
│   ├── user.go
│   └── wedding_info.go
├── routes/
│   └── routes.go               # Toàn bộ routing của ứng dụng
├── utils/
│   ├── jwt.go                  # Tạo và parse JWT token
│   └── response.go             # Chuẩn hoá JSON response + PaginatedData
├── uploads/                    # Thư mục lưu file ảnh upload (local)
├── main.go                     # Entry point, CORS, static file serving
├── go.mod                      # Module: wedding-api, Go 1.25
├── wedding-web/                # Next.js 14 App Router (khách hàng + trang thiệp)
└── wedding-admin/              # React + Vite (admin panel)
```

---

## 2. Backend (Go)

### 2.1 Models / Database Schema

#### `users`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| full_name | varchar(100) | Họ tên |
| email | varchar(150) UNIQUE | Email đăng nhập |
| phone | varchar(20) | Số điện thoại |
| password_hash | varchar(255) | bcrypt hash (không trả về JSON) |
| avatar_url | varchar(500) | URL ảnh đại diện |
| role | varchar(20) | `user` hoặc `admin` |
| provider | enum | `local`, `google`, `facebook` |
| provider_id | varchar(100) | ID OAuth (nullable) |
| is_verified | tinyint(1) | Đã xác thực email |

#### `orders`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| user_id | char(36) FK | Tham chiếu users |
| status | enum | `pending`, `paid`, `published`, `expired`, `cancelled` |
| package_type | enum | `daily`, `monthly` |
| rental_start | date | Ngày bắt đầu thuê |
| rental_end | date | Ngày kết thúc thuê |
| duration_days | int | Số ngày thuê |
| subtotal | decimal(12,0) | Tổng tiền trước giảm giá |
| discount | decimal(12,0) | Số tiền giảm giá |
| total | decimal(12,0) | Tổng tiền cuối |
| custom_domain | varchar(100) | Slug tuỳ chỉnh |
| published_url | varchar(500) | URL đã xuất bản |
| coupon_id | char(36) FK | Mã giảm giá áp dụng (nullable) |

#### `order_items`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| order_id | char(36) FK | Tham chiếu orders |
| template_id | char(36) FK | Tham chiếu templates |
| price_snapshot | decimal(12,0) | Giá tại thời điểm mua |
| config_snapshot | json | Cấu hình template tại thời điểm mua |

#### `wedding_info`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| order_id | char(36) UNIQUE FK | 1-1 với orders |
| groom_name | varchar(255) | Tên chú rể |
| bride_name | varchar(255) | Tên cô dâu |
| groom_parent | varchar(500) | Thông tin cha mẹ chú rể |
| bride_parent | varchar(500) | Thông tin cha mẹ cô dâu |
| wedding_date | date | Ngày cưới |
| wedding_time | varchar(20) | Giờ cưới (HH:MM) |
| ceremony_venue | varchar(500) | Tên địa điểm lễ |
| reception_venue | varchar(500) | Tên địa điểm tiệc |
| venue_address | varchar(500) | Địa chỉ |
| maps_embed_url | varchar(1000) | URL nhúng Google Maps |
| event_description | text | Mô tả sự kiện |
| gallery_urls | json | Mảng URL ảnh |
| guest_book_config | json | Cấu hình sổ lưu bút |
| rsvp_config | json | Cấu hình RSVP |
| bank_accounts | json | Mảng tài khoản ngân hàng `[{bank, account, name}]` |

#### `templates`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| category_id | int unsigned FK | Tham chiếu template_categories |
| name | varchar(150) | Tên mẫu thiệp |
| slug | varchar(180) UNIQUE | Đường dẫn thân thiện |
| thumbnail_url | varchar(500) | Ảnh đại diện |
| preview_images | json | Mảng URL ảnh preview |
| price_per_day | decimal(10,0) | Giá thuê/ngày |
| price_per_month | decimal(10,0) | Giá thuê/tháng |
| customizable_fields | json | Các trường tuỳ chỉnh của template |
| description | text | Mô tả |
| html_content | longtext | Nội dung HTML (không dùng nếu dùng React theme) |
| theme_slug | varchar(100) | Tên theme React (`songphung-red`) |
| has_video | tinyint(1) | Có video nền |
| is_active | tinyint(1) | Đang hoạt động |
| view_count | int unsigned | Số lượt xem |

#### `template_categories`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | int UNSIGNED PK | Auto increment |
| name | varchar(100) | Tên danh mục |
| slug | varchar(120) UNIQUE | Đường dẫn |
| description | text | Mô tả |
| thumbnail_url | varchar(500) | Ảnh đại diện |
| sort_order | int | Thứ tự hiển thị |
| is_active | tinyint(1) | Đang hoạt động |

#### `themes`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | int PK | Auto increment |
| name | varchar(100) | Tên theme |
| slug | varchar(100) UNIQUE | Slug (dùng để map với THEME_REGISTRY) |
| description | text | Mô tả |
| thumbnail_url | varchar(500) | Ảnh đại diện |
| is_active | tinyint(1) | Đang hoạt động |
| sort_order | int | Thứ tự |

#### `rsvp_responses`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| order_id | char(36) FK | Tham chiếu orders |
| guest_name | varchar(100) | Tên khách mời |
| phone | varchar(20) | Số điện thoại |
| attending | tinyint(1) | Có tham dự không |
| guest_count | int | Số người tham dự |
| wish_message | text | Lời chúc kèm theo RSVP |

#### `guest_wishes`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| order_id | char(36) FK | Tham chiếu orders |
| guest_name | varchar(100) | Tên người gửi |
| message | text | Nội dung lời chúc |

#### `coupons`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| code | varchar(50) UNIQUE | Mã giảm giá |
| type | enum | `percent` hoặc `fixed` |
| value | decimal(10,2) | Giá trị giảm |
| min_order | decimal(10,0) | Đơn hàng tối thiểu |
| max_uses | int | Số lần tối đa được dùng (nullable = không giới hạn) |
| used_count | int | Số lần đã dùng |
| expires_at | date | Ngày hết hạn (nullable) |
| is_active | tinyint(1) | Đang hoạt động |

#### `banners`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | int PK | Auto increment |
| title | varchar(200) | Tiêu đề |
| image_url | varchar(500) | URL ảnh desktop |
| image_mobile_url | varchar(500) | URL ảnh mobile |
| link_url | varchar(500) | Đường dẫn khi click |
| link_target | enum | `_self`, `_blank` |
| position | enum | `home_top`, `home_middle`, `home_bottom`, `template_list`, `checkout`, `popup` |
| sort_order | int | Thứ tự |
| is_active | tinyint(1) | Đang hoạt động |
| started_at / ended_at | datetime | Thời gian hiển thị |
| click_count / view_count | int unsigned | Thống kê |

#### `reviews`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| user_id | char(36) FK | Người đánh giá |
| template_id | char(36) FK | Mẫu thiệp được đánh giá |
| order_id | char(36) | Đơn hàng liên quan |
| rating | tinyint | Điểm đánh giá (1-5) |
| comment | text | Nội dung đánh giá |
| is_approved | bool | Đã được admin duyệt |

#### `payments`
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | char(36) PK | UUID |
| order_id | char(36) FK | Tham chiếu orders |
| provider | enum | `vnpay`, `momo`, `zalopay`, `bank_transfer`, `cash` |
| transaction_id | varchar(200) | Mã giao dịch |
| amount | decimal(12,0) | Số tiền |
| currency | char(3) | `VND` |
| status | enum | `pending`, `success`, `failed`, `refunded` |
| gateway_response | json | Response thô từ cổng thanh toán |

### 2.2 Handlers

| File | Handlers Chính |
|------|---------------|
| `auth_handler.go` | `Register`, `Login`, `Logout`, `GetMe`, `UpdateMe` |
| `order_handler.go` | `CreateOrder`, `GetOrders`, `GetOrderByID`, `CancelOrder` |
| `wedding_info_handler.go` | `GetWeddingInfo`, `UpdateWeddingInfo`, `PublishWedding` |
| `public_wedding_handler.go` | `GetPublicWeddingData`, `SubmitRSVP`, `SubmitWish`, `GetWishes` |
| `template_handler.go` | `GetCategories`, `GetTemplates`, `GetTemplateBySlug` |
| `review_handler.go` | `GetTemplateReviews`, `CreateReview` |
| `banner_handler.go` | `GetBanners`, `ClickBanner` |
| `upload_handler.go` | `UploadImage`, `UploadMultipleImages` |
| `admin_handler.go` | Admin CRUD cho template, banner, order, review, user, category, coupon, dashboard stats |

### 2.3 Middleware

| Middleware | Mô tả |
|-----------|-------|
| `AuthMiddleware()` | Kiểm tra `Authorization: Bearer <token>`, set `user_id`, `user_email`, `user_role` vào context |
| `AdminMiddleware()` | Kiểm tra `user_role == "admin"`, phải dùng sau AuthMiddleware |

### 2.4 Utils

| File | Mô tả |
|------|-------|
| `utils/jwt.go` | `GenerateToken(userID, email, role)` → JWT HS256, TTL 72h; `ParseToken()` → `*JWTClaims` |
| `utils/response.go` | `SuccessResponse()`, `ErrorResponse()`, struct `PaginatedData` |

---

## 3. Frontend Khách Hàng (wedding-web)

### 3.1 Cấu Trúc Thư Mục

```
wedding-web/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout, font Cormorant Garamond + Be Vietnam Pro
│   ├── providers.tsx                 # QueryClientProvider + AuthHydrator (Zustand)
│   ├── page.tsx                      # Trang chủ
│   ├── globals.css                   # CSS toàn cục
│   ├── (auth)/
│   │   ├── dang-nhap/page.tsx        # Trang đăng nhập
│   │   └── dang-ky/page.tsx          # Trang đăng ký
│   ├── dashboard/
│   │   ├── page.tsx                  # Dashboard tổng quan
│   │   └── don-hang/
│   │       ├── page.tsx              # Danh sách đơn hàng
│   │       └── [id]/page.tsx         # Chi tiết đơn hàng + form nhập thông tin đám cưới
│   ├── mau-thiep/
│   │   ├── page.tsx                  # Danh sách mẫu thiệp
│   │   └── [slug]/page.tsx           # Chi tiết mẫu thiệp
│   ├── dat-thue/[templateId]/page.tsx  # Trang đặt thuê
│   ├── w/
│   │   ├── [slug]/page.tsx           # Trang thiệp cưới (public)
│   │   └── preview/[theme]/page.tsx  # Preview theme với dữ liệu mẫu
│   ├── huong-dan/page.tsx            # Hướng dẫn sử dụng
│   └── lien-he/page.tsx              # Trang liên hệ
├── components/
│   ├── home/                         # Components trang chủ
│   │   ├── HeroBanner.tsx
│   │   ├── FeaturedTemplates.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Stats.tsx
│   │   ├── Testimonials.tsx
│   │   ├── ApiBanner.tsx
│   │   └── PromoBanner.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileMenu.tsx
│   ├── order/
│   │   ├── CouponInput.tsx
│   │   └── OrderSummary.tsx
│   ├── templates/
│   │   ├── TemplateCard.tsx
│   │   ├── TemplateFilter.tsx
│   │   └── TemplateGrid.tsx
│   ├── themes/
│   │   ├── registry.ts               # THEME_REGISTRY, getThemeComponent(), getAvailableThemes()
│   │   └── songphung-red/            # Theme Song Phụng Đỏ
│   │       ├── SongPhungTheme.tsx    # Root component của theme
│   │       ├── CoverSection.tsx      # Màn hình bìa
│   │       ├── HeroSection.tsx       # Phần hero với phượng hoàng
│   │       ├── FamilySection.tsx     # Thông tin gia đình
│   │       ├── CeremonySection.tsx   # Chi tiết lễ cưới + RSVP
│   │       ├── CountdownSection.tsx  # Đếm ngược
│   │       ├── GallerySection.tsx    # Thư viện ảnh
│   │       ├── WishesSection.tsx     # Sổ lưu bút
│   │       ├── BankSection.tsx       # Hộp mừng cưới (QR)
│   │       └── FooterSection.tsx     # Footer thiệp
│   └── ui/                           # UI primitives
│       ├── Badge.tsx, Button.tsx, Card.tsx, Divider.tsx
│       ├── Input.tsx, Modal.tsx, SectionTitle.tsx, Skeleton.tsx
├── lib/
│   ├── api/
│   │   ├── axios.ts                  # Axios instance + interceptors
│   │   ├── auth.api.ts
│   │   ├── banner.api.ts
│   │   ├── order.api.ts
│   │   ├── review.api.ts
│   │   └── template.api.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useIntersection.ts
│   ├── store/
│   │   └── auth.store.ts             # Zustand store: token + user + localStorage
│   └── utils/
│       ├── format.ts
│       └── helpers.ts
└── public/
    └── themes/songphung-red/         # Assets của theme
        ├── phoenix.webp, phoenix2.webp
        ├── flower.webp
        ├── chu-hy.webp               # Chữ Hỷ
        ├── paper-bg.jpg, paper-texture.jpg
        ├── double-happiness.png/svg
        └── music.mp3                 # Nhạc nền (hardcoded)
```

### 3.2 Hệ Thống Theme

**registry.ts** là trung tâm của hệ thống theme:

```typescript
const THEME_REGISTRY: Record<string, ComponentType<{ data: WeddingData }>> = {
  'songphung-red': SongPhungTheme,
  // 'minimal-white': MinimalWhiteTheme,   // Phase 4
  // 'vintage-floral': VintageFloralTheme, // Phase 4
};
```

- `getThemeComponent(slug)` → trả về component React tương ứng, fallback về `SongPhungTheme`
- `getAvailableThemes()` → danh sách slug theme có sẵn
- Mỗi theme component nhận prop `data: WeddingData` chứa toàn bộ thông tin đám cưới

**WeddingData interface** (định nghĩa tại `app/w/[slug]/page.tsx`):
```typescript
interface WeddingData {
  order_id, slug, template, groom_name, bride_name,
  groom_parent, bride_parent, wedding_date, wedding_time,
  ceremony_venue, reception_venue, venue_address, maps_embed_url,
  gallery_urls, bank_accounts, wishes, rsvp_count, custom_domain
}
```

### 3.3 Cấu Hình Next.js

- Dev port: 3001
- Proxy `/api/*` → `http://localhost:8080/api/*` (qua `next.config.mjs` rewrites)
- Font: Cormorant Garamond (display) + Be Vietnam Pro (body) từ Google Fonts
- Metadata: title `JunTech — Thiệp cưới online đẹp nhất`

### 3.4 State Management

- **Zustand** (`auth.store.ts`): lưu `token` + `user` vào `localStorage`, hydrate khi mount
- **TanStack Query**: fetch dữ liệu, cache 60 giây, retry 1 lần
- **Axios interceptors**: tự động đính kèm token, redirect về `/dang-nhap` khi 401

---

## 4. Admin Panel (wedding-admin)

### 4.1 Cấu Trúc

```
wedding-admin/src/
├── App.tsx                           # Root: QueryClient + Ant Design ConfigProvider + Router
├── main.tsx                          # Entry point
├── api/                              # API clients
│   ├── axios.ts                      # Axios instance (baseURL: /api/admin)
│   ├── auth.api.ts
│   ├── banner.api.ts
│   ├── dashboard.api.ts
│   ├── order.api.ts
│   ├── review.api.ts
│   ├── template.api.ts
│   └── user.api.ts
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx           # Layout wrapper với sidebar
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileSidebar.tsx
│   └── ui/
│       ├── ConfirmDialog.tsx, EmptyState.tsx, ErrorBoundary.tsx
│       ├── ImageUpload.tsx, LoadingScreen.tsx, PageHeader.tsx
│       ├── SearchInput.tsx, StatCard.tsx, StatusBadge.tsx
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   └── components/: OrderStatusChart, PendingReviews, RecentOrders, RevenueChart, StatsCards
│   ├── templates/
│   │   ├── TemplatesPage.tsx, TemplateFormPage.tsx
│   │   └── components/: CustomFieldEditor, TemplateFilter, TemplateTable
│   ├── orders/
│   │   ├── OrdersPage.tsx, OrderDetailPage.tsx
│   │   └── components/: OrderFilter, OrderStatusTimeline, OrderTable, WeddingInfoCard
│   ├── banners/
│   │   ├── BannersPage.tsx, BannerFormPage.tsx
│   │   └── components/: BannerTable
│   ├── categories/CategoriesPage.tsx
│   ├── coupons/CouponsPage.tsx
│   ├── reviews/
│   │   ├── ReviewsPage.tsx
│   │   └── components/: ReviewCard, StarRating
│   ├── users/
│   │   ├── UsersPage.tsx
│   │   └── components/: UserTable
│   └── settings/SettingsPage.tsx
├── store/
│   ├── auth.store.ts
│   └── ui.store.ts
├── types/index.ts                    # TypeScript type definitions
└── utils/
    ├── constants.ts
    ├── format.ts
    └── helpers.ts
```

### 4.2 Routing Admin

| Đường dẫn | Component | Mô tả |
|-----------|-----------|-------|
| `/login` | LoginPage | Đăng nhập admin |
| `/dashboard` | DashboardPage | Thống kê tổng quan |
| `/templates` | TemplatesPage | Danh sách mẫu thiệp |
| `/templates/new` | TemplateFormPage | Tạo mẫu mới |
| `/templates/edit/:id` | TemplateFormPage | Sửa mẫu thiệp |
| `/orders` | OrdersPage | Danh sách đơn hàng |
| `/orders/:id` | OrderDetailPage | Chi tiết đơn hàng |
| `/categories` | CategoriesPage | Quản lý danh mục |
| `/banners` | BannersPage | Danh sách banner |
| `/banners/new` | BannerFormPage | Tạo banner mới |
| `/banners/edit/:id` | BannerFormPage | Sửa banner |
| `/coupons` | CouponsPage | Quản lý mã giảm giá |
| `/reviews` | ReviewsPage | Duyệt đánh giá |
| `/users` | UsersPage | Danh sách người dùng |
| `/settings` | SettingsPage | Cài đặt hệ thống |

### 4.3 Cấu Hình Admin

- Ant Design locale: `vi_VN`
- Màu chủ đạo: `#8B1A1A` (đỏ đậm, đồng bộ với brand)
- TanStack Query staleTime: 30 giây
- Dev port: mặc định Vite (5173)

---

## 5. Assets Công Khai

### Theme songphung-red Assets

| File | Mô tả |
|------|-------|
| `phoenix.webp` | Ảnh phượng hoàng chính (dùng ở Cover + Hero) |
| `phoenix2.webp` | Phiên bản phượng hoàng thứ hai |
| `flower.webp` | Hoa trang trí |
| `chu-hy.webp` | Chữ Hỷ (Double Happiness) |
| `paper-bg.jpg` | Texture nền giấy |
| `paper-texture.jpg` | Texture nền giấy (dự phòng) |
| `double-happiness.png/.svg` | Chữ Hỷ vector |
| `hy-symbol.png` | Ký hiệu Hỷ |
| `music.mp3` | Nhạc nền (hardcoded, phát khi mở thiệp) |
| `dh-test1.png`, `dh-test2.png` | Ảnh test |

### Template HTML tĩnh (legacy)

Trong `wedding-web/public/`:
- `demo-wedding.html` — Demo thiệp HTML thuần
- `template-elegant.html` — Template elegant
- `template-phoenix.html` — Template phượng hoàng

---

## 6. Biến Môi Trường

### Backend (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=wedding_db
JWT_SECRET=your-secret-key
PORT=8080
```

### Frontend (wedding-web)

Không cần `.env` riêng vì dùng Next.js rewrites để proxy API qua `next.config.mjs`.

---

## 7. Lệnh Khởi Động

```bash
# Backend
cd GoLang_Wedding
go run main.go

# Frontend (cổng 3001)
cd wedding-web
npm run dev

# Admin panel (cổng 5173)
cd wedding-admin
npm run dev
```
