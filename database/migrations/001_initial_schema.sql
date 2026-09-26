-- =========================================================
-- ViralRecharge Database Schema Migration
-- Database: viral
-- Migration: 001_initial_schema
-- Created: 2026-09-27
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `mobile` VARCHAR(15) UNIQUE NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `referral_code` VARCHAR(20) UNIQUE NOT NULL,
  `referred_by` INT DEFAULT NULL,
  `credit_balance` INT DEFAULT 0,
  `total_earned` INT DEFAULT 0,
  `total_recharged` DECIMAL(10,2) DEFAULT 0.00,
  `level` ENUM('bronze','silver','gold','platinum') DEFAULT 'bronze',
  `signup_bonus_multiplied` BOOLEAN DEFAULT FALSE,
  `bonus_deadline` DATETIME DEFAULT NULL,
  `is_banned` BOOLEAN DEFAULT FALSE,
  `role` ENUM('user','admin') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_referral_code` (`referral_code`),
  INDEX `idx_users_mobile` (`mobile`),
  INDEX `idx_users_email` (`email`),
  CONSTRAINT `fk_users_referred_by` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Referrals Table
DROP TABLE IF EXISTS `referrals`;
CREATE TABLE `referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `referrer_id` INT NOT NULL,
  `referred_user_id` INT NOT NULL,
  `status` ENUM('pending','active','expired') DEFAULT 'pending',
  `credits_awarded` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_referrals_referrer` (`referrer_id`),
  INDEX `idx_referrals_referred_user` (`referred_user_id`),
  CONSTRAINT `fk_referrals_referrer` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_referrals_referred` FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tasks Table
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `type` ENUM('visit_site','watch_ad','youtube_subscribe','watch_video','social_follow','other') NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `instructions` TEXT DEFAULT NULL,
  `credits_reward` INT NOT NULL DEFAULT 0,
  `duration_seconds` INT DEFAULT 0,
  `daily_limit` INT DEFAULT 0,
  `total_completions` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `expires_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tasks_type` (`type`),
  INDEX `idx_tasks_active` (`is_active`),
  CONSTRAINT `fk_tasks_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Task Completions Table
DROP TABLE IF EXISTS `task_completions`;
CREATE TABLE `task_completions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `task_id` INT NOT NULL,
  `status` ENUM('started','completed','failed','expired') DEFAULT 'started',
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `credits_awarded` INT DEFAULT 0,
  `verification_data` JSON DEFAULT NULL,
  INDEX `idx_completions_user` (`user_id`),
  INDEX `idx_completions_task` (`task_id`),
  CONSTRAINT `fk_task_completions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_task_completions_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Transactions Table (Credit Ledger)
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` ENUM('credit','debit') NOT NULL,
  `category` ENUM('signup_bonus','referral','task','recharge','adjustment','bonus_multiplier') NOT NULL,
  `amount` INT NOT NULL,
  `balance_after` INT NOT NULL,
  `description` VARCHAR(500) DEFAULT NULL,
  `reference_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tx_user_created` (`user_id`, `created_at`),
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Recharges Table
DROP TABLE IF EXISTS `recharges`;
CREATE TABLE `recharges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `mobile_number` VARCHAR(15) NOT NULL,
  `operator` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `credits_spent` INT NOT NULL,
  `status` ENUM('pending','processing','completed','failed') DEFAULT 'pending',
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `api_response` JSON DEFAULT NULL,
  `processed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_recharges_user` (`user_id`),
  INDEX `idx_recharges_status` (`status`),
  CONSTRAINT `fk_recharges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Announcements Table
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info','warning','promo') DEFAULT 'info',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME DEFAULT NULL,
  CONSTRAINT `fk_announcements_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. OTP Codes Table
DROP TABLE IF EXISTS `otp_codes`;
CREATE TABLE `otp_codes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `mobile` VARCHAR(15) NOT NULL,
  `code` VARCHAR(6) NOT NULL,
  `purpose` ENUM('registration','login','password_reset') NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_used` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_otp_mobile_code` (`mobile`, `code`),
  INDEX `idx_otp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Sessions Table
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sessions_user` (`user_id`),
  INDEX `idx_sessions_token` (`token`(255)),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Admin Activity Logs Table
DROP TABLE IF EXISTS `admin_logs`;
CREATE TABLE `admin_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(50) DEFAULT NULL,
  `target_id` INT DEFAULT NULL,
  `details` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admin_logs_admin` (`admin_id`),
  CONSTRAINT `fk_admin_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
