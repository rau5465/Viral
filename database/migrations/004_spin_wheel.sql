-- =========================================================
-- FAR (Forget About Recharge) Migration: 004_spin_wheel.sql
-- Covers:
--  1. user_spins table: Rewarded video ad spin wheel history
--  2. transactions table: category enum update ('spin_wheel')
--  3. platform_settings table: seed default spin_settings
-- =========================================================

-- 1. Create user_spins Table
CREATE TABLE IF NOT EXISTS `user_spins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `reward_credits` INT NOT NULL,
  `segment_label` VARCHAR(50) NOT NULL,
  `slice_index` INT NOT NULL DEFAULT 0,
  `ad_session_id` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_spins_user` (`user_id`),
  CONSTRAINT `fk_user_spins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Update Transactions Category Enum to include 'spin_wheel'
ALTER TABLE `transactions`
  MODIFY COLUMN `category` ENUM(
    'signup_bonus',
    'referral',
    'task',
    'recharge',
    'adjustment',
    'bonus_multiplier',
    'multiply_game',
    'spin_wheel'
  ) NOT NULL;

-- 3. Seed Default Spin Settings in platform_settings if not present
INSERT IGNORE INTO `platform_settings` (`setting_key`, `setting_value`, `updated_by`) VALUES
('spin_settings', '{"max_daily_spins":10,"ad_duration_seconds":15,"enabled":true}', 'System Administrator');
