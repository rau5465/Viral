-- =========================================================
-- FAR (Forget About Recharge) Migration: 003_update_schema.sql
-- Covers:
--  1. users table: mobile-only/WhatsApp auth, device fingerprinting, security Q/A
--  2. transactions table: category enum update ('bonus_multiplier', 'multiply_game')
--  3. platform_settings table: dynamic settings (credit rate, referral bonus, maintenance)
--  4. contact_messages table: customer inquiries and feedback
--  5. game_rolls table: Multiply Credits HI-LO game rolls ledger
--  6. phone_verifications table: WhatsApp wacli verification tokens
--  7. active_user_snapshots table: Real-time traffic & live user telemetry history
-- =========================================================

-- 1. Users Table Updates
ALTER TABLE `users`
  MODIFY COLUMN `email` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `device_fingerprint` VARCHAR(64) NULL AFTER `role`,
  ADD COLUMN IF NOT EXISTS `signup_ip` VARCHAR(45) NULL AFTER `device_fingerprint`,
  ADD COLUMN IF NOT EXISTS `security_q1` VARCHAR(255) NULL AFTER `signup_ip`,
  ADD COLUMN IF NOT EXISTS `security_a1` VARCHAR(255) NULL AFTER `security_q1`,
  ADD COLUMN IF NOT EXISTS `security_q2` VARCHAR(255) NULL AFTER `security_a1`,
  ADD COLUMN IF NOT EXISTS `security_a2` VARCHAR(255) NULL AFTER `security_q2`,
  ADD COLUMN IF NOT EXISTS `security_questions_set` TINYINT(1) DEFAULT 0 AFTER `security_a2`,
  ADD COLUMN IF NOT EXISTS `reset_locked_until` DATETIME NULL AFTER `security_questions_set`,
  ADD COLUMN IF NOT EXISTS `reset_attempts_failed` INT DEFAULT 0 AFTER `reset_locked_until`;

-- 2. Transactions Category Enum Update
ALTER TABLE `transactions`
  MODIFY COLUMN `category` ENUM(
    'signup_bonus',
    'referral',
    'task',
    'recharge',
    'adjustment',
    'bonus_multiplier',
    'multiply_game'
  ) NOT NULL;

-- 3. Platform Settings Table
CREATE TABLE IF NOT EXISTS `platform_settings` (
  `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL,
  `updated_by` VARCHAR(100) DEFAULT 'Admin',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default platform settings if not present
INSERT IGNORE INTO `platform_settings` (`setting_key`, `setting_value`, `updated_by`) VALUES
('credit_rate', '{"credit_rate_display":"1Rs = 1 Credit","rupees":1,"credits":1}', 'System Administrator'),
('maintenance', '{"enabled":false,"message":"We are currently performing scheduled maintenance. We will be back shortly."}', 'System Administrator'),
('referral_settings', '{"bonus_reward_2h":50,"standard_reward":10,"target_referrals":1,"bonus_window_hours":2}', 'System Administrator');

-- 4. Contact Messages Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_contact_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Game Rolls Table (Multiply Credits HI-LO Game)
CREATE TABLE IF NOT EXISTS `game_rolls` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `bet_amount` INT NOT NULL,
  `bet_type` ENUM('HI', 'LO') NOT NULL,
  `target_condition` VARCHAR(20) NOT NULL,
  `roll_result` INT NOT NULL,
  `multiplier` DECIMAL(4,2) DEFAULT 2.00,
  `payout` INT DEFAULT 0,
  `profit` INT NOT NULL,
  `status` ENUM('won', 'lost') NOT NULL,
  `in_loss_zone` TINYINT(1) DEFAULT 0,
  `balance_after` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_game_rolls_user` (`user_id`),
  CONSTRAINT `fk_game_rolls_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Phone Verifications Table (WhatsApp wacli)
CREATE TABLE IF NOT EXISTS `phone_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mobile` VARCHAR(20) NOT NULL,
  `code` VARCHAR(16) NOT NULL,
  `sender_jid` VARCHAR(100) DEFAULT NULL,
  `sender_phone` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('pending', 'verified', 'expired', 'used') NOT NULL DEFAULT 'pending',
  `expires_at` DATETIME NOT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pv_mobile_code` (`mobile`, `code`),
  INDEX `idx_pv_code_status` (`code`, `status`),
  INDEX `idx_pv_mobile_status` (`mobile`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Active User Snapshots Table (Live Users Telemetry)
CREATE TABLE IF NOT EXISTS `active_user_snapshots` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `live_users_count` INT NOT NULL DEFAULT 0,
  `authenticated_count` INT NOT NULL DEFAULT 0,
  `guest_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_snapshot_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
