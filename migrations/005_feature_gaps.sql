-- Migration: 005_feature_gaps.sql
-- Tất cả thay đổi DB cho 10 tính năng mới
-- Chạy tuần tự, mỗi ALTER TABLE độc lập

-- ============================================
-- 1. Nhạc nền tùy chỉnh
-- ============================================
ALTER TABLE `wedding_info`
  ADD COLUMN `music_url` VARCHAR(500) DEFAULT NULL AFTER `bank_accounts`;

-- ============================================
-- 2. Ảnh cá nhân cô dâu / chú rể
-- ============================================
ALTER TABLE `wedding_info`
  ADD COLUMN `groom_photo_url` VARCHAR(500) DEFAULT NULL AFTER `bride_parent`,
  ADD COLUMN `bride_photo_url` VARCHAR(500) DEFAULT NULL AFTER `groom_photo_url`;

-- ============================================
-- 3. Địa chỉ gia đình hai bên
-- ============================================
ALTER TABLE `wedding_info`
  ADD COLUMN `groom_address` VARCHAR(500) DEFAULT NULL AFTER `bride_photo_url`,
  ADD COLUMN `bride_address` VARCHAR(500) DEFAULT NULL AFTER `groom_address`;

-- ============================================
-- 4. Tach rieng Le Gia Tien va Tiec Cuoi
-- ============================================
ALTER TABLE `wedding_info`
  ADD COLUMN `ceremony_time` VARCHAR(20) DEFAULT NULL AFTER `wedding_time`,
  ADD COLUMN `ceremony_address` VARCHAR(500) DEFAULT NULL AFTER `ceremony_venue`,
  ADD COLUMN `ceremony_maps_url` VARCHAR(1000) DEFAULT NULL AFTER `ceremony_address`,
  ADD COLUMN `reception_time` VARCHAR(20) DEFAULT NULL AFTER `reception_venue`,
  ADD COLUMN `reception_address` VARCHAR(500) DEFAULT NULL AFTER `reception_time`,
  ADD COLUMN `reception_maps_url` VARCHAR(1000) DEFAULT NULL AFTER `reception_address`;

-- ============================================
-- 5. Ngay am lich
-- ============================================
ALTER TABLE `wedding_info`
  ADD COLUMN `lunar_date` VARCHAR(50) DEFAULT NULL AFTER `wedding_date`;

-- ============================================
-- 6. Lượt xem
-- ============================================
ALTER TABLE `wedding_info`
  ADD COLUMN `view_count` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `music_url`;

-- ============================================
-- 7. Section visibility toggles
-- ============================================
ALTER TABLE `wedding_info`
  ADD COLUMN `visible_sections` JSON DEFAULT NULL AFTER `view_count`;

-- ============================================
-- 8. Bảng khách mời (cá nhân hóa link)
-- ============================================
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

-- ============================================
-- 9. Analytics - page views
-- ============================================
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
