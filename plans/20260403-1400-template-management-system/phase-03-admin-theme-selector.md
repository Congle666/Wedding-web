# Phase 3: Admin UI — Chọn theme khi tạo template

## Context
- Parent: [plan.md](plan.md)
- Depends on: Phase 1, 2
- Priority: HIGH
- Status: Pending

## Overview
Admin form tạo/sửa template cần có dropdown chọn theme.
Bỏ phần upload HTML file (không cần nữa).

## Changes to Admin Template Form

### Bỏ:
- Upload HTML file section
- html_content field
- CustomFieldEditor (đã bỏ)

### Thêm:
- Dropdown "Chọn kiểu thiệp" (load từ GET /admin/themes)
- Preview ảnh theme khi chọn
- Link "Xem trước theme" mở tab mới

### Form layout mới:
```
Cột trái:
  Card "Thông tin cơ bản": tên, slug, danh mục, mô tả
  Card "Kiểu thiệp": dropdown chọn theme + preview ảnh
  Card "Giá thuê": giá/ngày, giá/tháng

Cột phải:
  Card "Ảnh đại diện": upload từ máy
  Card "Cài đặt": có video, hiển thị
```

## API Needed
- GET /admin/themes → [{id, name, slug, thumbnail_url, description}]

## Implementation Steps
1. Add theme API to admin dashboard.api
2. Replace HTML upload with theme selector dropdown
3. Remove html_content from form submission
4. Add theme preview (thumbnail + "Xem trước" link)
5. Update TemplateFormData type to include theme_slug

## Related Files
- wedding-admin/src/pages/templates/TemplateFormPage.tsx
- wedding-admin/src/api/template.api.ts
