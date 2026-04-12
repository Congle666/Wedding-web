# Phase 1: DB + API — Thêm theme management

## Context
- Parent: [plan.md](plan.md)
- Priority: HIGH
- Status: Pending

## Overview
Thêm bảng `themes` và liên kết với `templates`. Mỗi template thuộc 1 theme.
Bỏ cột `html_content` (không cần nữa vì dùng React components).

## Architecture

```sql
CREATE TABLE themes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,        -- "Song Phụng Đỏ"
  slug VARCHAR(100) UNIQUE NOT NULL, -- "songphung-red"
  description TEXT,
  thumbnail_url VARCHAR(500),        -- Ảnh preview theme
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0
);

-- Seed data:
INSERT INTO themes (name, slug, description, is_active) VALUES
('Song Phụng Đỏ', 'songphung-red', 'Phong cách Á Đông truyền thống', 1),
('Tối Giản Trắng', 'minimal-white', 'Phong cách hiện đại tối giản', 1),
('Vintage Hoa', 'vintage-floral', 'Phong cách vintage lãng mạn', 1);

-- Thêm cột theme_slug vào templates:
ALTER TABLE templates ADD COLUMN theme_slug VARCHAR(100) DEFAULT 'songphung-red';
```

## API Changes
- GET /admin/themes — list all themes (for dropdown in admin form)
- Template create/update: accept `theme_slug` field

## Implementation Steps
1. Create migration SQL
2. Add Theme model in Go
3. Add theme_slug to Template model
4. Add AdminListThemes handler
5. Update template create/update to accept theme_slug
6. Add route GET /admin/themes

## Related Files
- models/template.go
- handlers/admin_handler.go
- routes/routes.go
- migrations/004_add_themes_table.sql
