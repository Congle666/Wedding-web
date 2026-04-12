SET NAMES utf8mb4;

-- Themes table
CREATE TABLE IF NOT EXISTS `themes` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(100)    NOT NULL,
    `slug`          VARCHAR(100)    NOT NULL,
    `description`   TEXT            DEFAULT NULL,
    `thumbnail_url` VARCHAR(500)    DEFAULT NULL,
    `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
    `sort_order`    INT             NOT NULL DEFAULT 0,
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_theme_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed themes
INSERT INTO `themes` (`name`, `slug`, `description`, `sort_order`, `is_active`) VALUES
('Song Phụng Đỏ', 'songphung-red', 'Phong cách Á Đông truyền thống với phượng hoàng đỏ', 1, 1),
('Tối Giản Trắng', 'minimal-white', 'Phong cách hiện đại tối giản, thanh lịch', 2, 1),
('Vintage Hoa', 'vintage-floral', 'Phong cách vintage lãng mạn với hoa lá', 3, 1);

-- Add theme_slug to templates
ALTER TABLE `templates` ADD COLUMN `theme_slug` VARCHAR(100) DEFAULT 'songphung-red' AFTER `html_content`;

-- Set existing templates to default theme
UPDATE `templates` SET `theme_slug` = 'songphung-red' WHERE `theme_slug` IS NULL;
