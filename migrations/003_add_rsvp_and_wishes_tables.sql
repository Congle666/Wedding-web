-- RSVP responses for wedding invitations
CREATE TABLE IF NOT EXISTS `rsvp_responses` (
    `id`            CHAR(36)        NOT NULL,
    `order_id`      CHAR(36)        NOT NULL,
    `guest_name`    VARCHAR(100)    NOT NULL,
    `phone`         VARCHAR(20)     DEFAULT NULL,
    `attending`     TINYINT(1)      NOT NULL DEFAULT 1,
    `guest_count`   INT             NOT NULL DEFAULT 1,
    `wish_message`  TEXT            DEFAULT NULL,
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rsvp_order` (`order_id`),
    CONSTRAINT `fk_rsvp_order`
        FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Guest book wishes
CREATE TABLE IF NOT EXISTS `guest_wishes` (
    `id`            CHAR(36)        NOT NULL,
    `order_id`      CHAR(36)        NOT NULL,
    `guest_name`    VARCHAR(100)    NOT NULL,
    `message`       TEXT            NOT NULL,
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_wishes_order` (`order_id`),
    CONSTRAINT `fk_wishes_order`
        FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
