-- Add role column to users table (required for admin middleware)
ALTER TABLE `users`
    ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'user' AFTER `avatar_url`;

-- Create index for role lookups
ALTER TABLE `users`
    ADD KEY `idx_users_role` (`role`);
