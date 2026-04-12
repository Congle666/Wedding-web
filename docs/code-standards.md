# Tiêu Chuẩn Mã Nguồn — JunTech Wedding Platform

> Cập nhật lần cuối: 06/04/2026

---

## 1. Go Backend

### 1.1 Tổ Chức Package

Dự án sử dụng cấu trúc phẳng (flat structure) theo chức năng, không dùng DDD hay hexagonal:

```
handlers/   → HTTP layer (nhận request, validate, gọi DB, trả response)
models/     → GORM models (mỗi file = 1-2 models liên quan)
middleware/ → Gin middleware
routes/     → Đăng ký toàn bộ routes trong 1 file
config/     → Kết nối DB, biến môi trường
utils/      → Hàm tiện ích chung (JWT, response)
```

**Quy tắc**: Không có service layer; business logic nằm trực tiếp trong handlers. Phù hợp với dự án quy mô nhỏ-vừa.

### 1.2 Đặt Tên

| Loại | Quy tắc | Ví dụ |
|------|---------|-------|
| Package | lowercase, không underscore | `handlers`, `models`, `utils` |
| Struct | PascalCase | `WeddingInfo`, `OrderItem`, `RSVPResponse` |
| Interface | PascalCase + er suffix | (chưa có trong dự án) |
| Function (exported) | PascalCase | `GetPublicWeddingData`, `AuthMiddleware` |
| Function (internal) | camelCase | `buildChartPoint`, `parseDateTime` |
| Constant | UPPER_SNAKE hoặc camelCase | `allowedTypes` (map), `bcrypt.DefaultCost` |
| GORM column | snake_case qua tag `gorm:"column:..."` | `category_id`, `is_active` |
| JSON field | snake_case qua tag `json:"..."` | `groom_name`, `wedding_date` |

### 1.3 GORM Models

Mỗi model phải có:
- `TableName() string` để tường minh tên bảng
- `BeforeCreate(tx *gorm.DB) error` để tự sinh UUID nếu cần
- Tag `gorm` đầy đủ cho type, constraint
- Tag `json` luôn dùng snake_case; dùng `json:"-"` cho trường nhạy cảm (ví dụ: `password_hash`)

```go
// Ví dụ chuẩn
type WeddingInfo struct {
    ID      string         `gorm:"type:char(36);primaryKey" json:"id"`
    OrderID string         `gorm:"type:char(36);uniqueIndex;not null" json:"order_id"`
    // ...
}

func (w *WeddingInfo) BeforeCreate(tx *gorm.DB) error {
    if w.ID == "" {
        w.ID = uuid.New().String()
    }
    return nil
}

func (WeddingInfo) TableName() string {
    return "wedding_info"
}
```

### 1.4 Handlers

**Pattern chuẩn cho một handler**:

```go
func HandlerName(c *gin.Context) {
    // 1. Lấy context (user_id, user_role từ middleware)
    userID, _ := c.Get("user_id")

    // 2. Lấy path/query params
    orderID := c.Param("id")
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))

    // 3. Bind và validate input
    var input SomeInput
    if err := c.ShouldBindJSON(&input); err != nil {
        utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
        return
    }

    // 4. Business logic / DB queries
    var record models.SomeModel
    if err := config.DB.Where("id = ?", id).First(&record).Error; err != nil {
        utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy")
        return
    }

    // 5. Trả response chuẩn
    utils.SuccessResponse(c, http.StatusOK, "Thành công", record)
}
```

**Quy tắc**:
- Luôn dùng `utils.SuccessResponse` và `utils.ErrorResponse` — không gọi `c.JSON` trực tiếp
- Error code (tham số thứ 3 của `ErrorResponse`) dùng snake_case: `"not_found"`, `"validation_error"`, `"invalid_coupon"`
- Thông báo lỗi (tham số thứ 4) có thể dùng tiếng Việt
- Không dùng `c.AbortWithError` — dùng `return` sau `ErrorResponse`

### 1.5 Response Format

Tất cả API trả về JSON theo chuẩn:

```json
// Thành công
{
  "success": true,
  "data": { ... },
  "message": "Thông báo tùy chọn"
}

// Lỗi
{
  "success": false,
  "error": "error_code",
  "message": "Mô tả lỗi"
}

// Phân trang
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  }
}
```

### 1.6 Input Validation

Dùng Gin binding tags + `ShouldBindJSON`:

```go
type CreateOrderInput struct {
    PackageType  string           `json:"package_type" binding:"required,oneof=daily monthly"`
    RentalStart  string           `json:"rental_start" binding:"required"`
    DurationDays int              `json:"duration_days" binding:"required,min=1"`
    Items        []OrderItemInput `json:"items" binding:"required,min=1"`
}
```

### 1.7 Xác Thực & Phân Quyền

```
Public:  GET /api/wedding/:slug, POST /api/wedding/:slug/rsvp, GET /api/templates, v.v.
User:    AuthMiddleware() → user_id, user_email, user_role trong context
Admin:   AuthMiddleware() + AdminMiddleware() → kiểm tra role == "admin"
```

Trong handler cần phân biệt admin và user:
```go
userRole, _ := c.Get("user_role")
if userRole != "admin" {
    query = query.Where("user_id = ?", userID)
}
```

### 1.8 Upload File

- Cho phép: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Giới hạn: 5MB/file, 10 file/request (multiple upload)
- Lưu tại: `./uploads/<uuid>.<ext>`
- Trả về URL đầy đủ bao gồm scheme và host

---

## 2. Frontend Khách Hàng (wedding-web — Next.js)

### 2.1 Quy Ước File

| Loại | Quy tắc | Ví dụ |
|------|---------|-------|
| Page components | `page.tsx` trong thư mục tương ứng | `app/w/[slug]/page.tsx` |
| Layout | `layout.tsx` | `app/layout.tsx` |
| Client component | `'use client'` ở đầu file | `CoverSection.tsx` |
| Server component | Mặc định (không có directive) | `app/mau-thiep/page.tsx` |
| Component files | PascalCase | `HeroSection.tsx`, `BankSection.tsx` |
| API modules | camelCase + `.api.ts` | `order.api.ts`, `auth.api.ts` |
| Hook files | camelCase + `use` prefix | `useAuth.ts`, `useDebounce.ts` |
| Store files | camelCase + `.store.ts` | `auth.store.ts` |
| Type/interface | PascalCase trong file `.ts` | `WeddingData`, `BankAccount` |

### 2.2 Tổ Chức Component Theme

**Nguyên tắc**: Mỗi theme là một thư mục tự chứa (self-contained) dưới `components/themes/`:

```
components/themes/
├── registry.ts           # Điểm kết nối duy nhất — map slug → component
└── songphung-red/        # Tên thư mục = theme slug
    ├── SongPhungTheme.tsx  # Root component, nhận data: WeddingData
    ├── CoverSection.tsx
    ├── HeroSection.tsx
    └── ...
```

**Thêm theme mới**:
1. Tạo thư mục `components/themes/<theme-slug>/`
2. Tạo root component `<ThemeName>Theme.tsx` với interface `{ data: WeddingData }`
3. Đăng ký trong `registry.ts`: `'<theme-slug>': <ThemeName>Theme`
4. Thêm assets vào `public/themes/<theme-slug>/`

### 2.3 Props Interface

Mỗi section component định nghĩa interface props ngay trong file:

```typescript
interface Props {
  groomName: string;
  brideName: string;
  weddingDate: string;
  // ...
}

export default function CeremonySection({ weddingTime, weddingDate, ... }: Props) {
  // ...
}
```

### 2.4 Animation & Hiệu Ứng

Theme `songphung-red` sử dụng **Framer Motion**:
- `motion.div` với `initial` + `animate` props
- `useInView` từ framer-motion để trigger animation khi phần tử vào viewport: `{ once: true, margin: '-80px' }`
- Parallax: custom `useEffect` + `requestAnimationFrame` để tối ưu hiệu năng

### 2.5 Styling

Theme `songphung-red` dùng **inline styles** (không dùng Tailwind CSS bên trong theme):
- Lý do: Theme là component độc lập, không phụ thuộc vào CSS framework của app
- CSS global dành cho animations: định nghĩa trực tiếp qua `<style>` tag trong `SongPhungTheme.tsx`
- Màu chủ đạo theme: `#5F191D` (đỏ đậm), `#F8F2ED` (nền kem), `#C8963C` (vàng)
- Font: `'Cormorant Garamond', serif` (tiêu đề) + `'Be Vietnam Pro', sans-serif` (body)

Các trang thương mại (mau-thiep, dat-thue...) dùng **Tailwind CSS 4**.

### 2.6 Data Fetching

```typescript
// Pattern chuẩn với TanStack Query
const { data, isLoading, isError } = useQuery({
  queryKey: ['wedding', slug],
  queryFn: () => fetchWedding(slug),
  enabled: !!slug,
});
```

- `staleTime: 60_000` ms cho data ít thay đổi
- Axios `api` instance tự gắn token từ `localStorage`
- Khi 401: tự redirect về `/dang-nhap`

### 2.7 State Management (Zustand)

```typescript
// auth.store.ts pattern
export const useAuthStore = create<AuthState>((set) => ({
  token: null, user: null, hydrated: false,
  hydrate: () => { /* load từ localStorage */ },
  setAuth: (token, user) => { /* lưu localStorage + set state */ },
  logout: () => { /* xoá localStorage + reset state */ },
}));
```

**Quy tắc quan trọng**: Không đọc `localStorage` khi render (SSR-safe) — luôn gọi `hydrate()` trong `useEffect`.

### 2.8 URL Routing (tiếng Việt)

Dự án dùng URL tiếng Việt có dấu cách được encode:
- `/dang-nhap`, `/dang-ky` (không phải `/login`, `/register`)
- `/mau-thiep` (không phải `/templates`)
- `/dat-thue/:templateId` (không phải `/order/:id`)
- `/don-hang` (không phải `/orders`)

Thiệp cưới: `/w/:slug` (ngắn gọn, không dùng `/wedding/:slug`)

---

## 3. Admin Panel (wedding-admin — React + Vite)

### 3.1 Cấu Trúc Theo Tính Năng

```
pages/
├── <feature>/
│   ├── <Feature>Page.tsx     # Trang chính (danh sách)
│   ├── <Feature>FormPage.tsx # Form tạo/sửa (nếu có)
│   └── components/           # Components con chỉ dùng trong feature này
│       ├── <Feature>Table.tsx
│       └── <Feature>Filter.tsx
```

### 3.2 Ant Design Conventions

- Dùng `Table`, `Form`, `Modal`, `Select`, `Input` từ Ant Design 5
- Locale: `vi_VN` — tất cả text mặc định của Ant Design sẽ hiển thị tiếng Việt
- Màu primary: `#8B1A1A` (cấu hình trong `ConfigProvider`)
- Form validation: Ant Design `Form.Item` rules (không dùng Zod trong admin)

### 3.3 API Layer Admin

```typescript
// Mỗi api file export các hàm async
export const getOrders = (params) => axios.get('/admin/orders', { params });
export const updateOrderStatus = (id, status) => axios.put(`/admin/orders/${id}/status`, { status });
```

Axios baseURL của admin: `/api` (qua Vite proxy hoặc cấu hình riêng).

### 3.4 Query Keys Convention

```typescript
// Pattern: ['resource', 'action', ...params]
queryKey: ['admin-orders', page, limit, status]
queryKey: ['admin-template', id]
queryKey: ['dashboard-stats', period, date]
```

---

## 4. Quy Tắc Chung

### 4.1 API Field Naming

| Bối cảnh | Quy tắc | Ví dụ |
|----------|---------|-------|
| Go JSON tags | snake_case | `groom_name`, `wedding_date`, `is_active` |
| GORM column names | snake_case | `order_id`, `price_per_day` |
| TypeScript interfaces | camelCase cho local vars, snake_case cho API response | `data.groom_name` (từ API) |
| React props | camelCase | `groomName`, `weddingDate` (khi truyền xuống component) |

### 4.2 Error Handling

**Backend**:
- Không panic trong handlers — dùng `return` sau error response
- DB error → log và trả 500, không expose chi tiết DB
- Validation error → trả 400 với message từ validator

**Frontend**:
- Axios interceptor xử lý lỗi toàn cục (toast notification cho 4xx)
- Loading state và error state phải luôn được xử lý trong UI
- Optimistic update cho UX mượt (ví dụ: WishesSection)

### 4.3 Bảo Mật

- `password_hash` có tag `json:"-"` — không bao giờ được trả về API
- JWT secret lấy từ `os.Getenv("JWT_SECRET")` — không hardcode
- CORS hiện tại cho phép `*` — cần giới hạn trong production
- File upload kiểm tra Content-Type và kích thước

### 4.4 Tiêu Chuẩn Commit

Chưa có quy tắc commit message chính thức. Đề xuất dùng Conventional Commits:

```
feat: thêm tính năng đếm ngược âm lịch
fix: sửa lỗi QR code không hiển thị với ngân hàng mới
docs: cập nhật hướng dẫn cài đặt
refactor: tách BankSection thành BankCard component riêng
```

### 4.5 Môi Trường Phát Triển

| Service | Port | Lệnh |
|---------|------|-------|
| Go API | 8080 | `go run main.go` |
| wedding-web | 3001 | `npm run dev` |
| wedding-admin | 5173 | `npm run dev` |
| MySQL | 3306 | Local hoặc Docker |

Proxy: wedding-web tự proxy `/api/*` → `localhost:8080/api/*` qua `next.config.mjs`.

---

## 5. Những Gì Không Có (Anti-patterns Cần Tránh)

- **Không** gọi `c.JSON` trực tiếp trong handler — dùng `utils.SuccessResponse`/`utils.ErrorResponse`
- **Không** lưu business logic trong models — chỉ định nghĩa struct và BeforeCreate hook
- **Không** dùng `console.log` trong production code frontend — dùng `toast` hoặc error boundary
- **Không** đọc `localStorage` trực tiếp trong component — dùng Zustand store qua `useAuthStore`
- **Không** import trực tiếp theme component vào page — luôn dùng `getThemeComponent()` từ registry
- **Không** thêm logic vào `registry.ts` — file chỉ chứa mapping slug → component
