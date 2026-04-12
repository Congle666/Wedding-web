# Ke Hoach Triem Khai Tinh Nang Con Thieu — JunTech Wedding Platform

> Ngay tao: 06/04/2026
> Trang thai: DRAFT - cho review

---

## Muc Luc

1. [Tong Quan](#1-tong-quan)
2. [P0 - Nhac Nen Tuy Chinh](#2-p0---nhac-nen-tuy-chinh)
3. [P0 - Ca Nhan Hoa Khach Moi](#3-p0---ca-nhan-hoa-khach-moi)
4. [P1 - Anh Ca Nhan Co Dau / Chu Re](#4-p1---anh-ca-nhan-co-dau--chu-re)
5. [P1 - Dia Chi Gia Dinh Hai Ben](#5-p1---dia-chi-gia-dinh-hai-ben)
6. [P1 - Tach Rieng Le Gia Tien va Tiec Cuoi](#6-p1---tach-rieng-le-gia-tien-va-tiec-cuoi)
7. [P1 - Add to Calendar (.ics)](#7-p1---add-to-calendar-ics)
8. [P1 - Parallax Scroll Effect](#8-p1---parallax-scroll-effect)
9. [P2 - View Count / Analytics](#9-p2---view-count--analytics)
10. [P2 - Ngay Am Lich](#10-p2---ngay-am-lich)
11. [P2 - Section Visibility Toggles](#11-p2---section-visibility-toggles)
12. [Tong Hop Migration SQL](#12-tong-hop-migration-sql)

---

## 1. Tong Quan

### Nguyen tac

- Moi tinh nang them cot/bang moi deu dung migration SQL rieng (khong dung AutoMigrate)
- Giu nguyen tuong thich nguoc (backward compatible) — cot moi deu co DEFAULT hoac nullable
- WeddingData interface la "contract" giua backend va frontend — moi thay doi phai dong bo ca 2 phia
- Admin panel chi can cap nhat khi co truong nhap lieu moi cho cap doi

### Thu tu thuc hien khuyen nghi

```
P0-1 (Nhac nen)  →  P0-2 (Guest personalization)  →  P1-3,4,5 (Family/Address/Events)
→  P1-6 (Calendar .ics)  →  P1-7 (Parallax)  →  P2-8,9,10 (Analytics/Lunar/Toggles)
```

---

## 2. P0 - Nhac Nen Tuy Chinh

### 2.1 Van de hien tai

- `SongPhungTheme.tsx` dong 29: `new Audio('/themes/songphung-red/music.mp3')` — hardcoded
- `wedding_info` khong co cot `music_url`
- Cap doi khong the chon nhac rieng

### 2.2 Database Migration

```sql
-- Migration: 005_add_music_url_to_wedding_info.sql
ALTER TABLE `wedding_info`
  ADD COLUMN `music_url` VARCHAR(500) DEFAULT NULL
  AFTER `bank_accounts`;
```

### 2.3 Go Model — `models/wedding_info.go`

Them truong vao struct `WeddingInfo`:

```go
// Them sau BankAccounts
MusicURL string `gorm:"type:varchar(500)" json:"music_url"`
```

### 2.4 Go Handler — `handlers/wedding_info_handler.go`

Them vao `UpdateWeddingInfoInput`:

```go
MusicURL string `json:"music_url"`
```

Them vao `UpdateWeddingInfo()` (sau dong xu ly BankAccounts):

```go
weddingInfo.MusicURL = input.MusicURL
```

### 2.5 Go Handler — `handlers/public_wedding_handler.go`

Them vao response cua `GetPublicWeddingData()`:

```go
"music_url": weddingInfo.MusicURL,
```

### 2.6 Frontend — `wedding-web/app/w/[slug]/page.tsx`

Them vao `WeddingData` interface:

```typescript
music_url?: string;
```

### 2.7 Frontend — `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx`

Thay doi dong 29:

```typescript
// TRUOC:
audioRef.current = new Audio('/themes/songphung-red/music.mp3');

// SAU:
const musicSrc = data.music_url || '/themes/songphung-red/music.mp3';
audioRef.current = new Audio(musicSrc);
```

Truyen `musicUrl` prop tu SongPhungTheme khong can thiet — dung truc tiep `data.music_url` trong `handleOpen`.

### 2.8 Frontend — Form nhap lieu (wedding-web + admin)

**`wedding-web/app/dashboard/don-hang/[id]/page.tsx`:**

Them vao `WeddingFormData`:

```typescript
music_url: string;
```

Them input field (type URL hoac file upload) trong tab "editor":

```tsx
<Input
  label="Nhac nen (URL)"
  placeholder="https://example.com/music.mp3"
  {...register('music_url')}
/>
```

**`wedding-admin/src/types/index.ts`:**

Them vao `WeddingInfo` interface:

```typescript
music_url: string;
```

**`wedding-admin/src/pages/orders/components/WeddingInfoCard.tsx`:**

Hien thi `music_url` trong card (chi doc, khong can form).

### 2.9 Upload nhac (tuy chon)

Co the dung endpoint upload hien tai (`POST /upload/image`) nhung can mo rong:
- Them MIME type `audio/mpeg`, `audio/wav`, `audio/ogg` vao whitelist trong `upload_handler.go`
- Gioi han file size: 10MB cho audio
- Hoac: chi cho paste URL (SoundCloud, Google Drive) — don gian hon, khong ton storage

**Khuyen nghi:** Giai doan dau chi cho nhap URL. Giai doan sau them upload file.

---

## 3. P0 - Ca Nhan Hoa Khach Moi

### 3.1 Van de hien tai

- `CoverSection.tsx` da co prop `guestName` (dong 13) va hien thi (dong 323-348)
- Nhung `SongPhungTheme.tsx` khong truyen `guestName` prop vao CoverSection
- Khong co bang `guests` de luu danh sach khach moi va tao link rieng
- Khong co co che doc ten khach tu URL

### 3.2 Database Migration

```sql
-- Migration: 006_add_guests_table.sql
CREATE TABLE IF NOT EXISTS `guests` (
    `id`            CHAR(36)        NOT NULL,
    `order_id`      CHAR(36)        NOT NULL,
    `name`          VARCHAR(150)    NOT NULL,
    `slug`          VARCHAR(100)    NOT NULL COMMENT 'Unique slug per order, dung cho URL',
    `phone`         VARCHAR(20)     DEFAULT NULL,
    `group_name`    VARCHAR(100)    DEFAULT NULL COMMENT 'Nhom: Gia dinh, Ban be, Dong nghiep...',
    `side`          ENUM('groom','bride','both') NOT NULL DEFAULT 'both' COMMENT 'Khach cua nha trai/gai/chung',
    `notes`         TEXT            DEFAULT NULL,
    `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_guest_order` (`order_id`),
    UNIQUE KEY `uq_guest_order_slug` (`order_id`, `slug`),
    CONSTRAINT `fk_guest_order`
        FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Giai thich:**
- `slug`: tao tu ten khach (VD: `nguyen-van-a`), unique trong 1 order
- `side`: xac dinh khach cua nha trai hay nha gai (huu ich cho RSVP analytics)
- `group_name`: nhom khach (tuy chon)

### 3.3 Go Model — `models/guest.go` (file moi)

```go
package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Guest struct {
    ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
    OrderID   string    `gorm:"type:char(36);not null" json:"order_id"`
    Name      string    `gorm:"type:varchar(150);not null" json:"name"`
    Slug      string    `gorm:"type:varchar(100);not null" json:"slug"`
    Phone     string    `gorm:"type:varchar(20)" json:"phone"`
    GroupName string    `gorm:"type:varchar(100)" json:"group_name"`
    Side      string    `gorm:"type:enum('groom','bride','both');not null;default:'both'" json:"side"`
    Notes     string    `gorm:"type:text" json:"notes"`
    IsActive  bool      `gorm:"type:tinyint(1);not null;default:1" json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

func (g *Guest) BeforeCreate(tx *gorm.DB) error {
    if g.ID == "" {
        g.ID = uuid.New().String()
    }
    return nil
}

func (Guest) TableName() string {
    return "guests"
}
```

### 3.4 Go Handler — `handlers/guest_handler.go` (file moi)

API CRUD cho cap doi quan ly danh sach khach moi:

```
GET    /api/orders/:id/guests          — Lay danh sach khach (phan trang)
POST   /api/orders/:id/guests          — Them khach moi (1 hoac nhieu)
PUT    /api/orders/:id/guests/:guestId — Cap nhat thong tin khach
DELETE /api/orders/:id/guests/:guestId — Xoa khach
```

**Logic tao slug tu ten:**
```go
func generateGuestSlug(name string) string {
    // Bo dau tieng Viet, lowercase, thay space bang "-"
    // VD: "Nguyen Van A" -> "nguyen-van-a"
    // Neu trung -> them "-2", "-3"...
}
```

**Batch import (tuy chon giai doan sau):**
```
POST /api/orders/:id/guests/import — Nhap tu CSV/Excel
```

### 3.5 Go Handler — `handlers/public_wedding_handler.go`

Sua `GetPublicWeddingData()` — doc query param `?guest=slug`:

```go
// Sau khi lay weddingInfo
guestSlug := c.Query("guest")
var guestName string
if guestSlug != "" {
    var guest models.Guest
    if err := config.DB.Where("order_id = ? AND slug = ? AND is_active = ?",
        order.ID, guestSlug, true).First(&guest).Error; err == nil {
        guestName = guest.Name
    }
}

// Them vao response
"guest_name": guestName,
```

### 3.6 Frontend — `wedding-web/app/w/[slug]/page.tsx`

Them vao `WeddingData` interface:

```typescript
guest_name?: string;
```

Truyen query param khi fetch:

```typescript
async function fetchWedding(slug: string, guestSlug?: string): Promise<WeddingData> {
  const params = guestSlug ? `?guest=${encodeURIComponent(guestSlug)}` : '';
  const res = await fetch(`/api/wedding/${slug}${params}`);
  // ...
}

// Trong WeddingPage component:
const searchParams = useSearchParams();
const guestSlug = searchParams.get('guest');

const { data } = useQuery({
  queryKey: ['wedding', slug, guestSlug],
  queryFn: () => fetchWedding(slug, guestSlug || undefined),
  enabled: !!slug,
});
```

### 3.7 Frontend — `SongPhungTheme.tsx`

Truyen `guestName` vao CoverSection (dong 174):

```tsx
<CoverSection
  groomName={data.groom_name}
  brideName={data.bride_name}
  weddingDate={data.wedding_date}
  guestName={data.guest_name}   // <-- THEM MOI
  onOpen={handleOpen}
/>
```

`CoverSection.tsx` da san sang hien thi `guestName` — khong can sua them.

### 3.8 Routes — `routes/routes.go`

Them vao nhom `protected`:

```go
// Guests
protected.GET("/orders/:id/guests", handlers.GetGuests)
protected.POST("/orders/:id/guests", handlers.CreateGuest)
protected.PUT("/orders/:id/guests/:guestId", handlers.UpdateGuest)
protected.DELETE("/orders/:id/guests/:guestId", handlers.DeleteGuest)
```

### 3.9 Frontend — Form quan ly khach moi

**`wedding-web/app/dashboard/don-hang/[id]/page.tsx`:**

Them tab "Khach moi" trong phan tab navigation:

```typescript
type TabKey = 'info' | 'editor' | 'guests' | 'preview';
```

Noi dung tab:
- Bang danh sach khach (ten, nhom, phia, link rieng)
- Nut "Them khach" (modal/form inline)
- Copy link rieng: `{domain}/w/{slug}?guest={guest-slug}`
- Nut "Sao chep tat ca link" (copy toan bo danh sach dang text)

**`wedding-admin/src/types/index.ts`:**

```typescript
export interface Guest {
  id: string;
  order_id: string;
  name: string;
  slug: string;
  phone: string;
  group_name: string;
  side: 'groom' | 'bride' | 'both';
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Admin panel:** Hien thi danh sach khach trong `OrderDetailPage` (chi doc).

---

## 4. P1 - Anh Ca Nhan Co Dau / Chu Re

### 4.1 Van de hien tai

- `FamilySection.tsx` hien thi ten + "Ong Ba" + ten cha me, KHONG co anh ca nhan
- `wedding_info` khong co cot anh co dau/chu re

### 4.2 Database Migration

```sql
-- Migration: 007_add_individual_photos.sql
ALTER TABLE `wedding_info`
  ADD COLUMN `groom_photo_url` VARCHAR(500) DEFAULT NULL AFTER `bride_parent`,
  ADD COLUMN `bride_photo_url` VARCHAR(500) DEFAULT NULL AFTER `groom_photo_url`;
```

### 4.3 Go Model — `models/wedding_info.go`

```go
// Them sau BrideParent
GroomPhotoURL string `gorm:"type:varchar(500)" json:"groom_photo_url"`
BridePhotoURL string `gorm:"type:varchar(500)" json:"bride_photo_url"`
```

### 4.4 Go Handlers

**`wedding_info_handler.go`** — them vao `UpdateWeddingInfoInput` va `UpdateWeddingInfo()`:

```go
GroomPhotoURL string `json:"groom_photo_url"`
BridePhotoURL string `json:"bride_photo_url"`
```

**`public_wedding_handler.go`** — them vao response:

```go
"groom_photo_url": weddingInfo.GroomPhotoURL,
"bride_photo_url": weddingInfo.BridePhotoURL,
```

### 4.5 Frontend — WeddingData

```typescript
groom_photo_url?: string;
bride_photo_url?: string;
```

### 4.6 Frontend — `FamilySection.tsx`

Them props:

```typescript
interface Props {
  groomName: string;
  brideName: string;
  groomParent: string;
  brideParent: string;
  groomPhotoUrl?: string;   // MOI
  bridePhotoUrl?: string;   // MOI
}
```

Them anh tron (avatar) phia tren ten moi ben:

```tsx
{bridePhotoUrl && (
  <div style={{
    width: 120, height: 120, borderRadius: '50%',
    overflow: 'hidden', margin: '0 auto 16px',
    border: '3px solid #5F191D',
  }}>
    <Image src={bridePhotoUrl} alt={brideName}
      width={120} height={120}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </div>
)}
```

Tuong tu cho groom. Hien thi co dieu kien — khong co anh thi giu layout cu.

### 4.7 SongPhungTheme.tsx

Truyen props moi:

```tsx
<FamilySection
  groomName={data.groom_name}
  brideName={data.bride_name}
  groomParent={data.groom_parent}
  brideParent={data.bride_parent}
  groomPhotoUrl={data.groom_photo_url}   // MOI
  bridePhotoUrl={data.bride_photo_url}   // MOI
/>
```

### 4.8 Form nhap lieu

Them 2 truong upload anh (dung ImageUpload component da co trong admin) trong form thong tin dam cuoi.

---

## 5. P1 - Dia Chi Gia Dinh Hai Ben

### 5.1 Van de hien tai

- `wedding_info` co `venue_address` (dia chi nha hang)
- KHONG co dia chi nha trai / nha gai (can thiet cho thong bao le gia tien)

### 5.2 Database Migration

```sql
-- Migration: 008_add_family_addresses.sql
ALTER TABLE `wedding_info`
  ADD COLUMN `groom_address` VARCHAR(500) DEFAULT NULL AFTER `bride_parent`,
  ADD COLUMN `bride_address` VARCHAR(500) DEFAULT NULL AFTER `groom_address`;
```

Luu y: neu migration 007 da them `groom_photo_url`/`bride_photo_url`, thi cot nay se o sau cot anh.

### 5.3 Go Model

```go
GroomAddress string `gorm:"type:varchar(500)" json:"groom_address"`
BrideAddress string `gorm:"type:varchar(500)" json:"bride_address"`
```

### 5.4 Go Handlers

Tuong tu nhu muc 4.4 — them vao input, handler, va response.

### 5.5 Frontend — WeddingData

```typescript
groom_address?: string;
bride_address?: string;
```

### 5.6 Frontend — FamilySection.tsx

Hien thi dia chi phia duoi ten cha me:

```tsx
{brideAddress && (
  <p style={{
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 14, color: '#5F191D', fontStyle: 'italic',
    opacity: 0.8, marginTop: 8,
  }}>
    {brideAddress}
  </p>
)}
```

---

## 6. P1 - Tach Rieng Le Gia Tien va Tiec Cuoi

### 6.1 Van de hien tai

- `wedding_info` co: `ceremony_venue`, `reception_venue`, `venue_address`, `wedding_time`
- Chi ho tro 1 dia diem + 1 gio
- Khong the tach: "Le gia tien luc 8h tai nha" va "Tiec cuoi luc 17h tai nha hang"

### 6.2 Database Migration

```sql
-- Migration: 009_add_ceremony_events.sql
ALTER TABLE `wedding_info`
  ADD COLUMN `ceremony_time` VARCHAR(20) DEFAULT NULL
    AFTER `wedding_time`
    COMMENT 'Gio le gia tien (neu khac wedding_time)',
  ADD COLUMN `ceremony_address` VARCHAR(500) DEFAULT NULL
    AFTER `ceremony_venue`
    COMMENT 'Dia chi le gia tien (neu khac venue_address)',
  ADD COLUMN `ceremony_maps_url` VARCHAR(1000) DEFAULT NULL
    AFTER `ceremony_address`
    COMMENT 'Google Maps le gia tien',
  ADD COLUMN `reception_time` VARCHAR(20) DEFAULT NULL
    AFTER `reception_venue`
    COMMENT 'Gio tiec cuoi (neu khac wedding_time)',
  ADD COLUMN `reception_address` VARCHAR(500) DEFAULT NULL
    AFTER `reception_time`
    COMMENT 'Dia chi nha hang tiec cuoi',
  ADD COLUMN `reception_maps_url` VARCHAR(1000) DEFAULT NULL
    AFTER `reception_address`
    COMMENT 'Google Maps nha hang';
```

**Logic tuong thich nguoc:**
- Neu `ceremony_time` = NULL → dung `wedding_time` (nhu hien tai)
- Neu `reception_address` = NULL → dung `venue_address` (nhu hien tai)
- Frontend xu ly fallback

### 6.3 Go Model

```go
CeremonyTime    string `gorm:"type:varchar(20)" json:"ceremony_time"`
CeremonyAddress string `gorm:"type:varchar(500)" json:"ceremony_address"`
CeremonyMapsURL string `gorm:"type:varchar(1000)" json:"ceremony_maps_url"`
ReceptionTime   string `gorm:"type:varchar(20)" json:"reception_time"`
ReceptionAddress string `gorm:"type:varchar(500)" json:"reception_address"`
ReceptionMapsURL string `gorm:"type:varchar(1000)" json:"reception_maps_url"`
```

### 6.4 Go Handlers

Them vao `UpdateWeddingInfoInput`, `UpdateWeddingInfo()`, va `GetPublicWeddingData()` response.

### 6.5 Frontend — WeddingData

```typescript
ceremony_time?: string;
ceremony_address?: string;
ceremony_maps_url?: string;
reception_time?: string;
reception_address?: string;
reception_maps_url?: string;
```

### 6.6 Frontend — CeremonySection.tsx

Thiet ke lai thanh 2 khoi rieng biet:

```
+----------------------------------+
|         LE GIA TIEN              |
|    [Gio] [Ngay]                  |
|    [Dia diem] [Dia chi]          |
|    [Google Maps embed]           |
+----------------------------------+
|                                  |
+----------------------------------+
|         TIEC CUOI                |
|    [Gio] [Ngay]                  |
|    [Dia diem] [Dia chi]          |
|    [Google Maps embed]           |
|    [RSVP Form]                   |
+----------------------------------+
```

**Logic fallback:**

```typescript
const ceremonyTime = data.ceremony_time || data.wedding_time;
const receptionTime = data.reception_time || data.wedding_time;
const receptionAddr = data.reception_address || data.venue_address;
const receptionMaps = data.reception_maps_url || data.maps_embed_url;

const hasSeperateEvents = !!(data.ceremony_time || data.ceremony_address);
```

- Neu `hasSeperateEvents = false` → giu layout hien tai (1 khoi duy nhat)
- Neu `true` → hien thi 2 khoi

### 6.7 Props moi cua CeremonySection

```typescript
interface Props {
  weddingTime: string;
  weddingDate: string;
  ceremonyVenue: string;
  receptionVenue: string;
  venueAddress: string;
  mapsEmbedUrl: string;
  slug: string;
  // MOI
  ceremonyTime?: string;
  ceremonyAddress?: string;
  ceremonyMapsUrl?: string;
  receptionTime?: string;
  receptionAddress?: string;
  receptionMapsUrl?: string;
}
```

---

## 7. P1 - Add to Calendar (.ics)

### 7.1 Van de hien tai

- `CeremonySection.tsx` dong 64-71: chi co "Them vao Google Calendar" qua URL
- Khong ho tro .ics file (Apple Calendar, Outlook)

### 7.2 Giai phap

Them endpoint backend tao .ics file:

```
GET /api/wedding/:slug/calendar.ics
```

### 7.3 Go Handler — `handlers/calendar_handler.go` (file moi)

```go
func GenerateICS(c *gin.Context) {
    slug := c.Param("slug")

    // Tim order va wedding_info (giong GetPublicWeddingData)
    var order models.Order
    // ...

    var weddingInfo models.WeddingInfo
    // ...

    // Tao noi dung .ics
    // Neu co 2 su kien (ceremony + reception) → tao 2 VEVENT
    ics := fmt.Sprintf(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JunTech//Wedding//VI
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:%s
DTEND:%s
SUMMARY:Tiec cuoi %s & %s
LOCATION:%s
DESCRIPTION:%s
END:VEVENT
END:VCALENDAR`,
        formatICSDate(weddingInfo.WeddingDate, receptionTime),
        formatICSDate(weddingInfo.WeddingDate, receptionTimeEnd),
        weddingInfo.GroomName, weddingInfo.BrideName,
        receptionVenue + ", " + receptionAddress,
        weddingInfo.EventDescription,
    )

    c.Header("Content-Type", "text/calendar; charset=utf-8")
    c.Header("Content-Disposition",
        fmt.Sprintf("attachment; filename=wedding-%s.ics", slug))
    c.String(http.StatusOK, ics)
}
```

### 7.4 Routes

```go
// Trong nhom PUBLIC WEDDING API
api.GET("/wedding/:slug/calendar.ics", handlers.GenerateICS)
```

### 7.5 Frontend — CeremonySection.tsx

Them nut tai .ics ben canh link Google Calendar:

```tsx
<div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
  <a onClick={handleAddToCalendar} style={linkStyle}>
    Them vao Google Calendar
  </a>
  <a
    href={`/api/wedding/${slug}/calendar.ics`}
    download
    style={linkStyle}
  >
    Tai file .ics (Apple/Outlook)
  </a>
</div>
```

---

## 8. P1 - Parallax Scroll Effect

### 8.1 Van de hien tai

- `SongPhungTheme.tsx` dong 51-89: parallax system da duoc implement day du
- `registerParallax()` callback san sang
- NHUNG: khong co section nao goi `registerParallax()`

### 8.2 Giai phap

Truyen `registerParallax` callback xuong cac section co phan tu trang tri.

### 8.3 Thay doi code

**SongPhungTheme.tsx** — truyen prop:

```tsx
<HeroSection
  groomName={data.groom_name}
  brideName={data.bride_name}
  registerParallax={registerParallax}   // MOI
/>
<FamilySection
  ...
  registerParallax={registerParallax}   // MOI
/>
<CeremonySection
  ...
  registerParallax={registerParallax}   // MOI
/>
```

**Moi section** — them prop va su dung:

```typescript
interface Props {
  // ... props hien tai
  registerParallax?: (el: HTMLElement | null, speed: number, template?: string) => void;
}
```

Vi du trong `FamilySection.tsx`, anh hoa trang tri:

```tsx
<div
  ref={(el) => registerParallax?.(el, 0.03)}
  style={{
    position: 'absolute', top: -40, right: -80,
    width: 450, opacity: 0.35, pointerEvents: 'none',
  }}
>
  <Image src="/themes/songphung-red/flower.webp" ... />
</div>
```

**Cac phan tu nen ap dung parallax:**
- `FamilySection`: flower decoration (speed: 0.03)
- `CeremonySection`: phoenix-line top-left (speed: -0.02), flower bottom-left (speed: 0.04)
- `HeroSection`: phoenix trai/phai (speed: 0.02 va -0.02)

**Khong thay doi DB hay API** — chi la thay doi frontend.

---

## 9. P2 - View Count / Analytics

### 9.1 Van de hien tai

- `templates.view_count` da co (tang khi xem chi tiet template)
- KHONG co view count cho trang thiep cuoi (trang `/w/:slug`)

### 9.2 Database Migration

```sql
-- Migration: 010_add_wedding_analytics.sql
CREATE TABLE IF NOT EXISTS `wedding_page_views` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id`      CHAR(36)        NOT NULL,
    `ip_hash`       VARCHAR(64)     DEFAULT NULL COMMENT 'SHA256 cua IP, de-identify',
    `user_agent`    VARCHAR(500)    DEFAULT NULL,
    `referer`       VARCHAR(500)    DEFAULT NULL,
    `guest_slug`    VARCHAR(100)    DEFAULT NULL COMMENT 'Khach nao da xem (neu co)',
    `viewed_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_pageview_order` (`order_id`),
    KEY `idx_pageview_time` (`viewed_at`),
    CONSTRAINT `fk_pageview_order`
        FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `wedding_info`
  ADD COLUMN `view_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `music_url`;
```

### 9.3 Go Model — `models/page_view.go` (file moi)

```go
type WeddingPageView struct {
    ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
    OrderID   string    `gorm:"type:char(36);not null" json:"order_id"`
    IPHash    string    `gorm:"type:varchar(64)" json:"ip_hash"`
    UserAgent string    `gorm:"type:varchar(500)" json:"user_agent"`
    Referer   string    `gorm:"type:varchar(500)" json:"referer"`
    GuestSlug string    `gorm:"type:varchar(100)" json:"guest_slug"`
    ViewedAt  time.Time `gorm:"autoCreateTime" json:"viewed_at"`
}
```

### 9.4 Go Handler — `public_wedding_handler.go`

Them vao `GetPublicWeddingData()` (cuoi ham, truoc response):

```go
// Ghi nhan luot xem (async, khong block response)
go func() {
    ipHash := sha256Hex(c.ClientIP())
    view := models.WeddingPageView{
        OrderID:   order.ID,
        IPHash:    ipHash,
        UserAgent: c.GetHeader("User-Agent"),
        Referer:   c.GetHeader("Referer"),
        GuestSlug: guestSlug,
    }
    config.DB.Create(&view)
    config.DB.Model(&models.WeddingInfo{}).
        Where("order_id = ?", order.ID).
        UpdateColumn("view_count", gorm.Expr("view_count + 1"))
}()
```

Them `view_count` vao response.

### 9.5 Admin / Dashboard

Hien thi `view_count` trong `WeddingInfoCard` va `OrderDetailPage`.

API thong ke (tuy chon giai doan sau):

```
GET /api/orders/:id/analytics — Thong ke luot xem theo ngay, guest_slug
```

---

## 10. P2 - Ngay Am Lich

### 10.1 Van de hien tai

- `CeremonySection.tsx` dong 29-32: `getLunarDateApprox()` tra ve chuoi placeholder `"(Tuc ngay ... thang ... nam YYYY)"`
- Chua co thu vien chuyen doi am lich

### 10.2 Giai phap

**Phuong an A (khuyen nghi): Tinh am lich o backend**

Dung thu vien Go: `github.com/nicewook/golunar` hoac implement thuat toan chuyen doi.

Them cot luu cache:

```sql
-- Migration: 011_add_lunar_date.sql
ALTER TABLE `wedding_info`
  ADD COLUMN `lunar_date` VARCHAR(50) DEFAULT NULL
    AFTER `wedding_date`
    COMMENT 'Ngay am lich tu dong tinh, VD: 15/02/2026';
```

**`wedding_info_handler.go`** — tu dong tinh khi save:

```go
if input.WeddingDate != "" {
    t, err := time.Parse("2006-01-02", input.WeddingDate)
    if err == nil {
        weddingInfo.WeddingDate = &t
        weddingInfo.LunarDate = convertToLunar(t) // "15/02/2026"
    }
}
```

**`public_wedding_handler.go`** — them vao response:

```go
"lunar_date": weddingInfo.LunarDate,
```

**Phuong an B: Tinh am lich o frontend**

Dung npm package: `lunar-calendar` hoac `vietnamese-lunar-calendar`.

```typescript
import { solarToLunar } from 'lunar-calendar';

function getLunarDate(dateStr: string): string {
  const d = dayjs(dateStr);
  const lunar = solarToLunar(d.year(), d.month() + 1, d.date());
  return `(Tuc ngay ${lunar.lunarDay} thang ${lunar.lunarMonth} nam ${lunar.lunarYear})`;
}
```

**Khuyen nghi phuong an A** vi: tinh 1 lan, luu cache, tranh sai sot giua cac thu vien frontend.

### 10.3 Frontend — WeddingData

```typescript
lunar_date?: string;
```

### 10.4 Frontend — CeremonySection.tsx

Thay the `getLunarDateApprox()`:

```typescript
// TRUOC:
{getLunarDateApprox(weddingDate)}

// SAU:
{lunarDate ? `(Tuc ngay ${lunarDate})` : null}
```

Them prop `lunarDate`:

```typescript
interface Props {
  // ...
  lunarDate?: string;  // MOI
}
```

---

## 11. P2 - Section Visibility Toggles

### 11.1 Van de hien tai

- Cap doi khong the an/hien cac phan: Gallery, Wishes, Bank, Countdown...
- Tat ca section luon hien thi

### 11.2 Database Migration

```sql
-- Migration: 012_add_section_visibility.sql
ALTER TABLE `wedding_info`
  ADD COLUMN `visible_sections` JSON DEFAULT NULL
    AFTER `view_count`
    COMMENT 'Danh sach section hien thi, VD: {"gallery":true,"wishes":true,"bank":false}';
```

### 11.3 Go Model

```go
VisibleSections datatypes.JSON `gorm:"type:json" json:"visible_sections"`
```

### 11.4 Cau truc JSON

```json
{
  "hero": true,
  "family": true,
  "ceremony": true,
  "countdown": true,
  "gallery": true,
  "wishes": true,
  "bank": true,
  "rsvp": true
}
```

Mac dinh (null hoac tat ca true) = hien thi tat ca.

### 11.5 Go Handlers

Them vao `UpdateWeddingInfoInput` va `GetPublicWeddingData()`.

### 11.6 Frontend — WeddingData

```typescript
visible_sections?: Record<string, boolean>;
```

### 11.7 Frontend — SongPhungTheme.tsx

```typescript
const sections = data.visible_sections || {};
const isVisible = (key: string) => sections[key] !== false; // default = visible
```

```tsx
{isVisible('gallery') && <GallerySection galleryUrls={data.gallery_urls} />}
{isVisible('wishes') && <WishesSection wishes={data.wishes} slug={data.slug} />}
{isVisible('bank') && <BankSection ... />}
{isVisible('countdown') && <CountdownSection weddingDate={data.wedding_date} />}
```

### 11.8 Form nhap lieu

Them nhom switch/toggle trong form thong tin dam cuoi:

```tsx
<h4>Hien thi cac phan</h4>
<Switch label="Thu vien anh" checked={sections.gallery !== false} onChange={...} />
<Switch label="So luu but" checked={sections.wishes !== false} onChange={...} />
<Switch label="Hop mung cuoi" checked={sections.bank !== false} onChange={...} />
<Switch label="Dem nguoc" checked={sections.countdown !== false} onChange={...} />
<Switch label="RSVP" checked={sections.rsvp !== false} onChange={...} />
```

---

## 12. Tong Hop Migration SQL

Gop tat ca migration thanh 1 file chay tuan tu:

```sql
-- File: migrations/005_feature_gaps.sql
-- Chay tuan tu, moi ALTER TABLE doc lap

-- 1. Nhac nen
ALTER TABLE `wedding_info`
  ADD COLUMN `music_url` VARCHAR(500) DEFAULT NULL AFTER `bank_accounts`;

-- 2. Anh ca nhan
ALTER TABLE `wedding_info`
  ADD COLUMN `groom_photo_url` VARCHAR(500) DEFAULT NULL AFTER `bride_parent`,
  ADD COLUMN `bride_photo_url` VARCHAR(500) DEFAULT NULL AFTER `groom_photo_url`;

-- 3. Dia chi gia dinh
ALTER TABLE `wedding_info`
  ADD COLUMN `groom_address` VARCHAR(500) DEFAULT NULL AFTER `bride_photo_url`,
  ADD COLUMN `bride_address` VARCHAR(500) DEFAULT NULL AFTER `groom_address`;

-- 4. Le gia tien + Tiec cuoi rieng
ALTER TABLE `wedding_info`
  ADD COLUMN `ceremony_time` VARCHAR(20) DEFAULT NULL AFTER `wedding_time`,
  ADD COLUMN `ceremony_address` VARCHAR(500) DEFAULT NULL AFTER `ceremony_venue`,
  ADD COLUMN `ceremony_maps_url` VARCHAR(1000) DEFAULT NULL AFTER `ceremony_address`,
  ADD COLUMN `reception_time` VARCHAR(20) DEFAULT NULL AFTER `reception_venue`,
  ADD COLUMN `reception_address` VARCHAR(500) DEFAULT NULL AFTER `reception_time`,
  ADD COLUMN `reception_maps_url` VARCHAR(1000) DEFAULT NULL AFTER `reception_address`;

-- 5. Am lich
ALTER TABLE `wedding_info`
  ADD COLUMN `lunar_date` VARCHAR(50) DEFAULT NULL AFTER `wedding_date`;

-- 6. Luot xem
ALTER TABLE `wedding_info`
  ADD COLUMN `view_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `music_url`;

-- 7. Section visibility
ALTER TABLE `wedding_info`
  ADD COLUMN `visible_sections` JSON DEFAULT NULL AFTER `view_count`;

-- 8. Bang khach moi
CREATE TABLE IF NOT EXISTS `guests` (
    `id`            CHAR(36)        NOT NULL,
    `order_id`      CHAR(36)        NOT NULL,
    `name`          VARCHAR(150)    NOT NULL,
    `slug`          VARCHAR(100)    NOT NULL,
    `phone`         VARCHAR(20)     DEFAULT NULL,
    `group_name`    VARCHAR(100)    DEFAULT NULL,
    `side`          ENUM('groom','bride','both') NOT NULL DEFAULT 'both',
    `notes`         TEXT            DEFAULT NULL,
    `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_guest_order` (`order_id`),
    UNIQUE KEY `uq_guest_order_slug` (`order_id`, `slug`),
    CONSTRAINT `fk_guest_order`
        FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Analytics
CREATE TABLE IF NOT EXISTS `wedding_page_views` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id`      CHAR(36)        NOT NULL,
    `ip_hash`       VARCHAR(64)     DEFAULT NULL,
    `user_agent`    VARCHAR(500)    DEFAULT NULL,
    `referer`       VARCHAR(500)    DEFAULT NULL,
    `guest_slug`    VARCHAR(100)    DEFAULT NULL,
    `viewed_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_pageview_order` (`order_id`),
    KEY `idx_pageview_time` (`viewed_at`),
    CONSTRAINT `fk_pageview_order`
        FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tong Ket Thay Doi Theo File

### Files can sua

| File | Thay doi |
|------|----------|
| `models/wedding_info.go` | Them 12 truong moi |
| `handlers/wedding_info_handler.go` | Them cac truong vao input + update logic |
| `handlers/public_wedding_handler.go` | Them cac truong vao response, doc `?guest=`, ghi pageview |
| `routes/routes.go` | Them routes: guests CRUD, calendar.ics |
| `wedding-web/app/w/[slug]/page.tsx` | Mo rong WeddingData interface, doc searchParams |
| `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx` | Truyen props moi, dung music_url, section visibility |
| `wedding-web/components/themes/songphung-red/CoverSection.tsx` | Da san sang (khong can sua) |
| `wedding-web/components/themes/songphung-red/FamilySection.tsx` | Them anh, dia chi, parallax |
| `wedding-web/components/themes/songphung-red/CeremonySection.tsx` | 2 su kien, am lich, .ics link, parallax |
| `wedding-web/app/dashboard/don-hang/[id]/page.tsx` | Them form fields moi, tab khach moi |
| `wedding-admin/src/types/index.ts` | Cap nhat WeddingInfo, them Guest interface |
| `wedding-admin/src/pages/orders/components/WeddingInfoCard.tsx` | Hien thi cac truong moi |

### Files moi

| File | Muc dich |
|------|----------|
| `models/guest.go` | Guest model |
| `models/page_view.go` | WeddingPageView model |
| `handlers/guest_handler.go` | CRUD khach moi |
| `handlers/calendar_handler.go` | Generate .ics file |
| `migrations/005_feature_gaps.sql` | Tat ca migration SQL |

---

## Cau Hoi Chua Giai Quyet

1. **Upload nhac:** Cho phep upload file MP3 hay chi URL? Upload can mo rong MIME whitelist + tang size limit. URL don gian hon nhung phu thuoc nguon ben ngoai.
2. **Thu vien am lich Go:** Nen dung thu vien nao? `nicewook/golunar`, `6tail/lunar-go`, hay tu viet? Can kiem tra do chinh xac.
3. **Guest slug collision:** Khi 2 khach trung ten (VD: 2 "Nguyen Van A"), slug generation can logic unique (them so dem). Can xac dinh ruleup front hay backend.
4. **Parallax tren mobile:** Co nen tat parallax tren mobile de tiet kiem pin/performance? Hien tai code da clamp +-80px.
5. **Analytics privacy:** IP hash co du de tuan thu PDPA/luat bao ve du lieu ca nhan VN? Can review.
