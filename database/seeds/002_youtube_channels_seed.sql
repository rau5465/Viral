-- =========================================================
-- ViralRecharge YouTube Partner Channels Seed
-- Migration: 002_youtube_channels_seed
-- Description: Initial Partner YouTube Channels for Verification System
-- Created: 2026-09-27
-- =========================================================

INSERT INTO `partner_channels` (
  `id`, `partner_id`, `channel_id`, `channel_title`, `channel_handle`, `channel_url`, `thumbnail_url`, `description`, `credits_reward`, `task_id`, `subscriber_count`, `is_active`
) VALUES
(
  1,
  1,
  'UC_x5XG1OV2P6uZZ5FSM9Ttw',
  'Google for Developers',
  '@googledevs',
  'https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw',
  'https://yt3.googleusercontent.com/ytc/AIdro_n8-H0uCcm64b0k9Z2P17P7Z32P-6_N5t_Hw=s176-c-k-c0x00ffffff-no-rj',
  'Official Google Developers channel. Subscribe to earn credits and stay updated on the latest tech announcements.',
  50,
  3,
  2340000,
  TRUE
),
(
  2,
  1,
  'UCGg-Uq66yoqxZWvNTH3VVmQ',
  'YouTube Creators',
  '@YouTubeCreators',
  'https://www.youtube.com/channel/UCGg-Uq66yoqxZWvNTH3VVmQ',
  'https://yt3.googleusercontent.com/1B9q2_7g8b9p8v=s176-c-k-c0x00ffffff-no-rj',
  'Official YouTube Creators channel sharing best practices, product updates, and creator stories.',
  40,
  NULL,
  4500000,
  TRUE
),
(
  3,
  1,
  'UCVHFbqXqoYvEWM1Ddxl0QDg',
  'Android Developers',
  '@AndroidDevelopers',
  'https://www.youtube.com/channel/UCVHFbqXqoYvEWM1Ddxl0QDg',
  'https://yt3.googleusercontent.com/ytc/AIdro_k6_K=s176-c-k-c0x00ffffff-no-rj',
  'Official Android Developers channel featuring the latest Android tools, tutorials, and developer talks.',
  60,
  NULL,
  1200000,
  TRUE
)
ON DUPLICATE KEY UPDATE
  `channel_title`=VALUES(`channel_title`),
  `channel_handle`=VALUES(`channel_handle`),
  `credits_reward`=VALUES(`credits_reward`);
