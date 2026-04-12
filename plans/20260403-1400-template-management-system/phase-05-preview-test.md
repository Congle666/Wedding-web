# Phase 5: Preview + Testing

## Context
- Parent: [plan.md](plan.md)
- Depends on: Phase 1-4
- Priority: HIGH
- Status: Pending

## Overview
Admin cần xem trước theme với data mẫu. E2E test toàn bộ flow.

## Preview System
- URL: /w/preview/:themeSlug — render theme với data mẫu hardcoded
- Admin bấm "Xem trước" trên template form → mở tab mới
- Data mẫu: "Minh & Nhí", ngày cưới 24/03/2026, địa chỉ mẫu

## Test Cases

### Backend API
1. GET /admin/themes → list themes
2. POST /admin/templates with theme_slug → create OK
3. PUT /admin/templates/:id with theme_slug → update OK
4. GET /api/wedding/:slug → returns theme_slug in template

### Frontend
1. /w/minh-va-nhi → renders correct theme based on template's theme_slug
2. /w/preview/songphung-red → renders preview with mock data
3. RSVP form submit → saves to DB
4. Wishes form submit → saves to DB + shows optimistically
5. Bank copy button → clipboard works

### Admin
1. Template form shows theme dropdown
2. Changing theme shows preview thumbnail
3. Create template with selected theme → saves theme_slug
4. Edit template → theme_slug pre-selected

## Success Criteria
- Admin can create template with theme selection (no code needed)
- Public wedding page renders correct theme
- All interactive features work (RSVP, wishes, bank copy)
- Mobile responsive
- Multiple themes available
