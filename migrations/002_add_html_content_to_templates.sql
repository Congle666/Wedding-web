-- Add html_content column to templates for storing HTML template with placeholders
ALTER TABLE `templates`
    ADD COLUMN `html_content` LONGTEXT DEFAULT NULL AFTER `description`;
