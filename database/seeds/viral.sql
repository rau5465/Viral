-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 27, 2026 at 01:04 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `viral`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','promo') DEFAULT 'info',
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `message`, `type`, `is_active`, `created_by`, `created_at`, `expires_at`) VALUES
(1, 'Welcome to ViralRecharge! 🚀', 'Sign up today and refer 2 friends within 2 hours to get a 4x bonus of 100 credits! Start earning free recharges now.', 'promo', 1, 1, '2026-09-26 21:33:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `otp_codes`
--

CREATE TABLE `otp_codes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `mobile` varchar(15) NOT NULL,
  `code` varchar(6) NOT NULL,
  `purpose` enum('registration','login','password_reset') NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_channels`
--

CREATE TABLE `partner_channels` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `channel_id` varchar(100) NOT NULL,
  `channel_title` varchar(255) NOT NULL,
  `channel_handle` varchar(100) DEFAULT NULL,
  `channel_url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `credits_reward` int(11) NOT NULL DEFAULT 50,
  `task_id` int(11) DEFAULT NULL,
  `subscriber_count` bigint(20) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partner_channels`
--

INSERT INTO `partner_channels` (`id`, `partner_id`, `channel_id`, `channel_title`, `channel_handle`, `channel_url`, `thumbnail_url`, `description`, `credits_reward`, `task_id`, `subscriber_count`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'UC_x5XG1OV2P6uZZ5FSM9Ttw', 'Google for Developers', '@googledevs', 'https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw', 'https://yt3.googleusercontent.com/ytc/AIdro_n8-H0uCcm64b0k9Z2P17P7Z32P-6_N5t_Hw=s176-c-k-c0x00ffffff-no-rj', 'Official Google Developers channel. Subscribe to earn credits and stay updated on the latest tech announcements.', 50, 3, 2340000, 1, '2026-09-26 21:33:02', '2026-09-26 21:33:02'),
(2, 1, 'UCGg-Uq66yoqxZWvNTH3VVmQ', 'YouTube Creators', '@YouTubeCreators', 'https://www.youtube.com/channel/UCGg-Uq66yoqxZWvNTH3VVmQ', 'https://yt3.googleusercontent.com/1B9q2_7g8b9p8v=s176-c-k-c0x00ffffff-no-rj', 'Official YouTube Creators channel sharing best practices, product updates, and creator stories.', 40, NULL, 4500000, 1, '2026-09-26 21:33:02', '2026-09-26 21:33:02'),
(3, 1, 'UCVHFbqXqoYvEWM1Ddxl0QDg', 'Android Developers', '@AndroidDevelopers', 'https://www.youtube.com/channel/UCVHFbqXqoYvEWM1Ddxl0QDg', 'https://yt3.googleusercontent.com/ytc/AIdro_k6_K=s176-c-k-c0x00ffffff-no-rj', 'Official Android Developers channel featuring the latest Android tools, tutorials, and developer talks.', 60, NULL, 1200000, 1, '2026-09-26 21:33:02', '2026-09-26 21:33:02');

-- --------------------------------------------------------

--
-- Table structure for table `recharges`
--

CREATE TABLE `recharges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mobile_number` varchar(15) NOT NULL,
  `operator` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `credits_spent` int(11) NOT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `transaction_id` varchar(100) DEFAULT NULL,
  `api_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`api_response`)),
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `referrals`
--

CREATE TABLE `referrals` (
  `id` int(11) NOT NULL,
  `referrer_id` int(11) NOT NULL,
  `referred_user_id` int(11) NOT NULL,
  `status` enum('pending','active','expired') DEFAULT 'pending',
  `credits_awarded` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('visit_site','watch_ad','youtube_subscribe','watch_video','social_follow','other') NOT NULL,
  `url` varchar(500) NOT NULL,
  `instructions` text DEFAULT NULL,
  `credits_reward` int(11) NOT NULL DEFAULT 0,
  `duration_seconds` int(11) DEFAULT 0,
  `daily_limit` int(11) DEFAULT 0,
  `total_completions` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `type`, `url`, `instructions`, `credits_reward`, `duration_seconds`, `daily_limit`, `total_completions`, `is_active`, `created_by`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'Visit TechPartner Deal Store', 'Visit our sponsor website and stay for at least 30 seconds to earn credits.', 'visit_site', 'https://example.com/deals', 'Click the link, browse the page for 30 seconds, and return to claim credits.', 10, 30, 5, 0, 1, 1, NULL, '2026-09-26 21:33:02', '2026-09-26 21:33:02'),
(2, 'Watch 30s Video Ad', 'Watch a brief promotional advertisement to earn instant recharge credits.', 'watch_ad', 'https://example.com/ad-view', 'Watch the video ad completely without closing the window.', 5, 30, 10, 0, 1, 1, NULL, '2026-09-26 21:33:02', '2026-09-26 21:33:02'),
(3, 'Subscribe to ViralRecharge Official YouTube Channel', 'Subscribe to our official YouTube channel for updates, giveaways, and bonus codes.', 'youtube_subscribe', 'https://youtube.com/@viralrecharge', 'Click subscribe and hit the notification bell.', 20, 0, 1, 0, 1, 1, NULL, '2026-09-26 21:33:02', '2026-09-26 21:33:02'),
(4, 'Watch Product Demo Video', 'Watch 60 seconds of this exciting new gadgets showcase.', 'watch_video', 'https://example.com/video-demo', 'Watch at least 60 seconds of the video to receive rewards.', 15, 60, 3, 0, 1, 1, NULL, '2026-09-26 21:33:02', '2026-09-26 21:33:02'),
(5, 'Follow @ViralRecharge on Instagram', 'Follow our official Instagram page for daily bonus codes and contest alerts.', 'social_follow', 'https://instagram.com/viralrecharge', 'Follow our Instagram handle and verify your username.', 15, 0, 1, 0, 1, 1, NULL, '2026-09-26 21:33:02', '2026-09-26 21:33:02');

-- --------------------------------------------------------

--
-- Table structure for table `task_completions`
--

CREATE TABLE `task_completions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `status` enum('started','completed','failed','expired') DEFAULT 'started',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `credits_awarded` int(11) DEFAULT 0,
  `verification_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `category` enum('signup_bonus','referral','task','recharge','adjustment','bonus_multiplier') NOT NULL,
  `amount` int(11) NOT NULL,
  `balance_after` int(11) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `type`, `category`, `amount`, `balance_after`, `description`, `reference_id`, `created_at`) VALUES
(1, 2, 'credit', 'task', 60, 60, 'YouTube Subscription: Android Developers', 3, '2026-09-26 21:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `referral_code` varchar(20) NOT NULL,
  `referred_by` int(11) DEFAULT NULL,
  `credit_balance` int(11) DEFAULT 0,
  `total_earned` int(11) DEFAULT 0,
  `total_recharged` decimal(10,2) DEFAULT 0.00,
  `level` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
  `signup_bonus_multiplied` tinyint(1) DEFAULT 0,
  `bonus_deadline` datetime DEFAULT NULL,
  `is_banned` tinyint(1) DEFAULT 0,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `mobile`, `email`, `password_hash`, `referral_code`, `referred_by`, `credit_balance`, `total_earned`, `total_recharged`, `level`, `signup_bonus_multiplied`, `bonus_deadline`, `is_banned`, `role`, `created_at`, `updated_at`) VALUES
(1, 'System Admin', '9999999999', 'admin@viralrecharge.com', '$2b$10$41jDYEPB46T0P2V3L23WM.6jiBYpNWRVfDsqInAI7ZU6/vRPEAZ0K', 'ADMIN001', NULL, 10000, 10000, 0.00, 'platinum', 0, NULL, 0, 'admin', '2026-09-26 21:33:02', '2026-09-26 21:33:02'),
(2, 'YouTube Test User', '9876543210', 'youtubetest@viralrecharge.com', '$2b$10$41jDYEPB46T0P2V3L23WM.6jiBYpNWRVfDsqInAI7ZU6/vRPEAZ0K', 'YTTEST01', NULL, 60, 60, 0.00, 'bronze', 0, NULL, 0, 'user', '2026-09-26 21:35:40', '2026-09-26 21:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `user_youtube_accounts`
--

CREATE TABLE `user_youtube_accounts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `google_id` varchar(100) NOT NULL,
  `youtube_email` varchar(150) DEFAULT NULL,
  `youtube_channel_id` varchar(100) DEFAULT NULL,
  `youtube_channel_title` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `access_token` text NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `token_expiry` bigint(20) NOT NULL,
  `scope` text DEFAULT NULL,
  `is_connected` tinyint(1) DEFAULT 1,
  `last_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_youtube_accounts`
--

INSERT INTO `user_youtube_accounts` (`id`, `user_id`, `google_id`, `youtube_email`, `youtube_channel_id`, `youtube_channel_title`, `avatar_url`, `access_token`, `refresh_token`, `token_expiry`, `scope`, `is_connected`, `last_verified_at`, `created_at`, `updated_at`) VALUES
(1, 2, 'google_mock_2', 'youtubetest@viralrecharge.com', 'UC_mock_user_2', 'YouTube Test User (YouTube)', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', '', NULL, 1791067935888, 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email', 0, '2026-09-26 22:52:16', '2026-09-26 21:35:40', '2026-09-26 22:52:16');

-- --------------------------------------------------------

--
-- Table structure for table `user_youtube_subscriptions`
--

CREATE TABLE `user_youtube_subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `channel_id` varchar(100) NOT NULL,
  `partner_channel_id` int(11) DEFAULT NULL,
  `is_subscribed` tinyint(1) DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL,
  `credits_claimed` tinyint(1) DEFAULT 0,
  `credits_awarded` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_youtube_subscriptions`
--

INSERT INTO `user_youtube_subscriptions` (`id`, `user_id`, `channel_id`, `partner_channel_id`, `is_subscribed`, `verified_at`, `credits_claimed`, `credits_awarded`, `created_at`, `updated_at`) VALUES
(1, 2, 'UCVHFbqXqoYvEWM1Ddxl0QDg', 3, 1, '2026-09-26 22:52:16', 1, 60, '2026-09-26 21:35:40', '2026-09-26 22:52:16'),
(2, 2, 'UC_x5XG1OV2P6uZZ5FSM9Ttw', 1, 1, '2026-09-26 22:52:16', 0, 0, '2026-09-26 21:35:40', '2026-09-26 22:52:16'),
(3, 2, 'UCGg-Uq66yoqxZWvNTH3VVmQ', 2, 1, '2026-09-26 22:52:16', 0, 0, '2026-09-26 21:35:40', '2026-09-26 22:52:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_logs_admin` (`admin_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_announcements_created_by` (`created_by`);

--
-- Indexes for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_otp_mobile_code` (`mobile`,`code`),
  ADD KEY `idx_otp_expires` (`expires_at`);

--
-- Indexes for table `partner_channels`
--
ALTER TABLE `partner_channels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `channel_id` (`channel_id`),
  ADD KEY `idx_partner_channels_channel_id` (`channel_id`),
  ADD KEY `idx_partner_channels_partner` (`partner_id`),
  ADD KEY `idx_partner_channels_active` (`is_active`),
  ADD KEY `fk_partner_channels_task` (`task_id`);

--
-- Indexes for table `recharges`
--
ALTER TABLE `recharges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recharges_user` (`user_id`),
  ADD KEY `idx_recharges_status` (`status`);

--
-- Indexes for table `referrals`
--
ALTER TABLE `referrals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_referrals_referrer` (`referrer_id`),
  ADD KEY `idx_referrals_referred_user` (`referred_user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_user` (`user_id`),
  ADD KEY `idx_sessions_token` (`token`(255));

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tasks_type` (`type`),
  ADD KEY `idx_tasks_active` (`is_active`),
  ADD KEY `fk_tasks_created_by` (`created_by`);

--
-- Indexes for table `task_completions`
--
ALTER TABLE `task_completions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_completions_user` (`user_id`),
  ADD KEY `idx_completions_task` (`task_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tx_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mobile` (`mobile`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `referral_code` (`referral_code`),
  ADD KEY `idx_users_referral_code` (`referral_code`),
  ADD KEY `idx_users_mobile` (`mobile`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `fk_users_referred_by` (`referred_by`);

--
-- Indexes for table `user_youtube_accounts`
--
ALTER TABLE `user_youtube_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_youtube_accounts_user` (`user_id`),
  ADD KEY `idx_youtube_accounts_google` (`google_id`);

--
-- Indexes for table `user_youtube_subscriptions`
--
ALTER TABLE `user_youtube_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_youtube_sub` (`user_id`,`channel_id`),
  ADD KEY `idx_user_youtube_sub_user` (`user_id`),
  ADD KEY `idx_user_youtube_sub_channel` (`channel_id`),
  ADD KEY `fk_user_sub_channel` (`partner_channel_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `otp_codes`
--
ALTER TABLE `otp_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partner_channels`
--
ALTER TABLE `partner_channels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `recharges`
--
ALTER TABLE `recharges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `referrals`
--
ALTER TABLE `referrals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `task_completions`
--
ALTER TABLE `task_completions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_youtube_accounts`
--
ALTER TABLE `user_youtube_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_youtube_subscriptions`
--
ALTER TABLE `user_youtube_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `fk_admin_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `fk_announcements_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `partner_channels`
--
ALTER TABLE `partner_channels`
  ADD CONSTRAINT `fk_partner_channels_partner` FOREIGN KEY (`partner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_partner_channels_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `recharges`
--
ALTER TABLE `recharges`
  ADD CONSTRAINT `fk_recharges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `referrals`
--
ALTER TABLE `referrals`
  ADD CONSTRAINT `fk_referrals_referred` FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_referrals_referrer` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_tasks_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `task_completions`
--
ALTER TABLE `task_completions`
  ADD CONSTRAINT `fk_task_completions_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_task_completions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_referred_by` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_youtube_accounts`
--
ALTER TABLE `user_youtube_accounts`
  ADD CONSTRAINT `fk_youtube_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_youtube_subscriptions`
--
ALTER TABLE `user_youtube_subscriptions`
  ADD CONSTRAINT `fk_user_sub_channel` FOREIGN KEY (`partner_channel_id`) REFERENCES `partner_channels` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_sub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
