-- =========================================================
-- ViralRecharge Database Schema Migration
-- Migration: 002_youtube_verification_schema
-- Description: Partner YouTube Channels and User YouTube OAuth & Subscriptions
-- Created: 2026-09-27
-- =========================================================

-- 1. Partner Channels Table
-- Supports multiple YouTube channels per partner/application
CREATE TABLE IF NOT EXISTS `partner_channels` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `partner_id` INT DEFAULT NULL,
  `channel_id` VARCHAR(100) NOT NULL UNIQUE,
  `channel_title` VARCHAR(255) NOT NULL,
  `channel_handle` VARCHAR(100) DEFAULT NULL,
  `channel_url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `credits_reward` INT NOT NULL DEFAULT 50,
  `task_id` INT DEFAULT NULL,
  `subscriber_count` BIGINT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_partner_channels_channel_id` (`channel_id`),
  INDEX `idx_partner_channels_partner` (`partner_id`),
  INDEX `idx_partner_channels_active` (`is_active`),
  CONSTRAINT `fk_partner_channels_partner` FOREIGN KEY (`partner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_partner_channels_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Connected YouTube Accounts Table
-- Securely stores encrypted OAuth tokens and Google profile info
CREATE TABLE IF NOT EXISTS `user_youtube_accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `google_id` VARCHAR(100) NOT NULL,
  `youtube_email` VARCHAR(150) DEFAULT NULL,
  `youtube_channel_id` VARCHAR(100) DEFAULT NULL,
  `youtube_channel_title` VARCHAR(255) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `access_token` TEXT NOT NULL,
  `refresh_token` TEXT DEFAULT NULL,
  `token_expiry` BIGINT NOT NULL,
  `scope` TEXT DEFAULT NULL,
  `is_connected` BOOLEAN DEFAULT TRUE,
  `last_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_youtube_accounts_user` (`user_id`),
  INDEX `idx_youtube_accounts_google` (`google_id`),
  CONSTRAINT `fk_youtube_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User YouTube Subscriptions Verification Table
-- Tracks subscription status and credit claiming per partner channel
CREATE TABLE IF NOT EXISTS `user_youtube_subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `channel_id` VARCHAR(100) NOT NULL,
  `partner_channel_id` INT DEFAULT NULL,
  `is_subscribed` BOOLEAN DEFAULT FALSE,
  `verified_at` TIMESTAMP NULL DEFAULT NULL,
  `credits_claimed` BOOLEAN DEFAULT FALSE,
  `credits_awarded` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_youtube_sub` (`user_id`, `channel_id`),
  INDEX `idx_user_youtube_sub_user` (`user_id`),
  INDEX `idx_user_youtube_sub_channel` (`channel_id`),
  CONSTRAINT `fk_user_sub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_sub_channel` FOREIGN KEY (`partner_channel_id`) REFERENCES `partner_channels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
