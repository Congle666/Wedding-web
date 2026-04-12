# Template Management System — Implementation Plan

> Xây dựng hệ thống quản lý mẫu thiệp cưới giống chungdoi.com
> Date: 2026-04-03 | Priority: CRITICAL

## Vấn đề hiện tại

Hệ thống hiện tại có **lỗ hổng kiến trúc**:
- Admin upload file HTML → backend render bằng placeholder (SSR)
- Frontend Next.js chỉ có **1 theme React hardcoded** (SongPhungDo) → mọi thiệp đều giống nhau
- **Không có cách chọn theme** cho mỗi template
- Admin không thể tạo theme mới qua UI (phải code)

## Giải pháp: Component-Based Theme System

Mỗi mẫu thiệp = 1 React theme component. Admin chọn theme khi tạo template.
Bỏ hoàn toàn HTML placeholder engine.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | DB + API: Thêm `theme_id` vào templates | Pending | [phase-01](phase-01-db-theme-field.md) |
| 2 | Theme Registry: Dynamic theme loading | Pending | [phase-02](phase-02-theme-registry.md) |
| 3 | Admin UI: Chọn theme khi tạo template | Pending | [phase-03](phase-03-admin-theme-selector.md) |
| 4 | Thêm 2-3 theme mẫu | Pending | [phase-04](phase-04-additional-themes.md) |
| 5 | Preview + Test | Pending | [phase-05](phase-05-preview-test.md) |

## Flow sau khi hoàn thành

```
Admin tạo template:
  1. Chọn theme (Song Phụng Đỏ / Minimal White / ...)
  2. Nhập tên, giá, upload ảnh đại diện
  3. Xem trước theme với data mẫu
  4. Lưu

Khách thuê:
  1. Chọn template → xem preview
  2. Đặt thuê → nhập thông tin cưới
  3. Admin publish → link /w/ten-cua-ban
  4. Hệ thống: load theme component + data → render thiệp đẹp
```

## Research
- [Phân tích chungdoi.com](research/researcher-01-chungdoi-analysis.md)
- [Codebase scout](scout/scout-01-codebase.md)
