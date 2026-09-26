-- =========================================================
-- ViralRecharge Seed Data
-- Database: viral
-- Migration: 001_seed_data
-- Created: 2026-09-27
-- =========================================================

-- Admin User (Password: Admin@123)
-- bcrypt hash for 'Admin@123'
INSERT INTO `users` (
  `id`, `full_name`, `mobile`, `email`, `password_hash`, `referral_code`, `credit_balance`, `total_earned`, `level`, `role`
) VALUES (
  1,
  'System Admin',
  '9999999999',
  'admin@viralrecharge.com',
  '$2b$10$41jDYEPB46T0P2V3L23WM.6jiBYpNWRVfDsqInAI7ZU6/vRPEAZ0K',
  'ADMIN001',
  10000,
  10000,
  'platinum',
  'admin'
) ON DUPLICATE KEY UPDATE `id`=`id`;

-- Initial Sample Tasks
INSERT INTO `tasks` (
  `id`, `title`, `description`, `type`, `url`, `instructions`, `credits_reward`, `duration_seconds`, `daily_limit`, `is_active`, `created_by`
) VALUES
(
  1,
  'Visit TechPartner Deal Store',
  'Visit our sponsor website and stay for at least 30 seconds to earn credits.',
  'visit_site',
  'https://example.com/deals',
  'Click the link, browse the page for 30 seconds, and return to claim credits.',
  10,
  30,
  5,
  TRUE,
  1
),
(
  2,
  'Watch 30s Video Ad',
  'Watch a brief promotional advertisement to earn instant recharge credits.',
  'watch_ad',
  'https://example.com/ad-view',
  'Watch the video ad completely without closing the window.',
  5,
  30,
  10,
  TRUE,
  1
),
(
  3,
  'Subscribe to ViralRecharge Official YouTube Channel',
  'Subscribe to our official YouTube channel for updates, giveaways, and bonus codes.',
  'youtube_subscribe',
  'https://youtube.com/@viralrecharge',
  'Click subscribe and hit the notification bell.',
  20,
  0,
  1,
  TRUE,
  1
),
(
  4,
  'Watch Product Demo Video',
  'Watch 60 seconds of this exciting new gadgets showcase.',
  'watch_video',
  'https://example.com/video-demo',
  'Watch at least 60 seconds of the video to receive rewards.',
  15,
  60,
  3,
  TRUE,
  1
),
(
  5,
  'Follow @ViralRecharge on Instagram',
  'Follow our official Instagram page for daily bonus codes and contest alerts.',
  'social_follow',
  'https://instagram.com/viralrecharge',
  'Follow our Instagram handle and verify your username.',
  15,
  0,
  1,
  TRUE,
  1
)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Initial Welcome Announcement
INSERT INTO `announcements` (
  `id`, `title`, `message`, `type`, `is_active`, `created_by`
) VALUES (
  1,
  'Welcome to ViralRecharge! 🚀',
  'Sign up today and refer 2 friends within 2 hours to get a 4x bonus of 100 credits! Start earning free recharges now.',
  'promo',
  TRUE,
  1
) ON DUPLICATE KEY UPDATE `id`=`id`;
