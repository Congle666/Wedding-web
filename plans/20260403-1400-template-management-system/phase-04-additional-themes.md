# Phase 4: Thêm 2-3 Theme Mẫu

## Context
- Parent: [plan.md](plan.md)
- Depends on: Phase 2
- Priority: MEDIUM
- Status: Pending

## Overview
Tạo thêm 2 theme mới để admin có lựa chọn. Mỗi theme khác phong cách hoàn toàn.

## Themes cần tạo

### Theme 2: Minimal White (minimal-white)
- Phong cách: Hiện đại, tối giản, thanh lịch
- Màu: Trắng (#FFFFFF), đen (#1A1A1A), vàng nhạt (#D4A574)
- Font: Cormorant Garamond + Inter
- Đặc điểm: Nhiều whitespace, typography lớn, không hoa văn
- Ảnh: Full-width hero ảnh cưới, gallery masonry

### Theme 3: Vintage Floral (vintage-floral)
- Phong cách: Vintage lãng mạn, hoa lá
- Màu: Hồng pastel (#F8E8E0), xanh lá nhạt (#7B9E6B), kem (#FDF6EE)
- Font: Playfair Display + Lora
- Đặc điểm: Watercolor hoa, viền hoa, soft tones
- Ảnh: Cần ảnh hoa watercolor (Canva hoặc free assets)

## Structure mỗi theme
Giống songphung-red, mỗi theme gồm 9 sections:
1. CoverSection (phong bì)
2. CountdownSection (đếm ngược)
3. CeremonySection (lễ cưới)
4. FamilySection (gia đình)
5. GallerySection (ảnh)
6. RSVPSection (xác nhận)
7. WishesSection (lời chúc)
8. BankSection (mừng cưới)
9. FooterSection

## Notes
- Các section logic (RSVP, Wishes, Gallery, Bank, Countdown) có thể tái sử dụng
- Chỉ khác CSS/layout/colors
- Tạo shared hooks: useCountdown, useLightbox, useScrollReveal
