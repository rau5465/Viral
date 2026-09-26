const asyncHandler = require('../utils/asyncHandler');
const youtubeService = require('../services/youtubeService');
const { UserYouTubeAccount } = require('../models');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * @desc Get list of all Partner YouTube Channels
 * @route GET /api/youtube/channels
 * @access Public / Authenticated (annotates user subscription data if logged in)
 */
const getChannels = asyncHandler(async (req, res, _next) => {
  const userId = req.user ? req.user.id : null;
  const data = await youtubeService.getPartnerChannels(userId);

  res.status(200).json({
    status: 'success',
    data,
  });
});

/**
 * @desc Get subscription status for a specific Partner YouTube channel
 * @route GET /api/youtube/subscription-status/:channelId
 * @access Private
 */
const getSubscriptionStatus = asyncHandler(async (req, res, _next) => {
  const { channelId } = req.params;
  const result = await youtubeService.checkUserSubscription(req.user.id, channelId);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc Verify subscription and claim reward credits for a partner channel
 * @route POST /api/youtube/verify-and-claim/:channelId
 * @access Private
 */
const verifyAndClaim = asyncHandler(async (req, res, _next) => {
  const { channelId } = req.params;
  const result = await youtubeService.verifyAndClaimReward(req.user.id, channelId);

  const statusCode = result.status === 'success' ? 200 : 400;
  res.status(statusCode).json(result);
});

/**
 * @desc Get Google OAuth consent URL for user to authenticate their YouTube account
 * @route GET /api/youtube/auth-url
 * @access Private
 */
const getAuthUrl = asyncHandler(async (req, res, _next) => {
  const authUrl = youtubeService.generateAuthUrl(req.user.id);

  res.status(200).json({
    status: 'success',
    authUrl,
    isConfigured: youtubeService.isOAuthConfigured(),
  });
});

/**
 * @desc Handle Google OAuth 2.0 redirect callback
 * @route GET /api/youtube/callback
 * @access Public (Google Redirect)
 */
const handleCallback = async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('Google OAuth error from query:', error);
    return res.redirect(`${CLIENT_URL}/tasks?youtube=error&message=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return res.redirect(
      `${CLIENT_URL}/tasks?youtube=error&message=${encodeURIComponent('Missing code or state parameter.')}`
    );
  }

  try {
    const result = await youtubeService.handleOAuthCallback(code, state);
    console.log(`✅ YouTube account connected for User #${result.userId}: ${result.email}`);
    return res.redirect(`${CLIENT_URL}/tasks?youtube=connected&channel=${encodeURIComponent(result.channelTitle || '')}`);
  } catch (err) {
    console.error('OAuth callback processing failed:', err.message);
    return res.redirect(
      `${CLIENT_URL}/tasks?youtube=error&message=${encodeURIComponent(err.message || 'Authentication failed')}`
    );
  }
};

/**
 * @desc Get currently connected YouTube account details for the authenticated user
 * @route GET /api/youtube/status
 * @access Private
 */
const getStatus = asyncHandler(async (req, res, _next) => {
  const account = await UserYouTubeAccount.findOne({ where: { user_id: req.user.id } });

  if (!account || !account.is_connected) {
    return res.status(200).json({
      status: 'success',
      isConnected: false,
      account: null,
    });
  }

  res.status(200).json({
    status: 'success',
    isConnected: true,
    account: {
      email: account.youtube_email,
      channelId: account.youtube_channel_id,
      channelTitle: account.youtube_channel_title,
      avatarUrl: account.avatar_url,
      lastVerifiedAt: account.last_verified_at,
    },
  });
});

/**
 * @desc Disconnect YouTube account from the user's application account
 * @route POST /api/youtube/disconnect
 * @access Private
 */
const disconnect = asyncHandler(async (req, res, _next) => {
  const result = await youtubeService.disconnectUserYouTube(req.user.id);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc Verify subscription status against ALL partner channels in batch
 * @route POST /api/youtube/verify-all
 * @access Private
 */
const verifyAll = asyncHandler(async (req, res, _next) => {
  const result = await youtubeService.checkAllPartnerSubscriptions(req.user.id);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * @desc Add a new Partner YouTube Channel
 * @route POST /api/youtube/partner/channels
 * @access Private (Admin or Partner)
 */
const addChannel = asyncHandler(async (req, res, _next) => {
  const channel = await youtubeService.addPartnerChannel(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    channel,
  });
});

/**
 * @desc Update an existing Partner YouTube Channel
 * @route PUT /api/youtube/partner/channels/:id
 * @access Private (Admin or Partner)
 */
const updateChannel = asyncHandler(async (req, res, _next) => {
  const channel = await youtubeService.updatePartnerChannel(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    channel,
  });
});

/**
 * @desc Delete / remove a Partner YouTube Channel
 * @route DELETE /api/youtube/partner/channels/:id
 * @access Private (Admin or Partner)
 */
const deleteChannel = asyncHandler(async (req, res, _next) => {
  const result = await youtubeService.deletePartnerChannel(req.params.id);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

module.exports = {
  getChannels,
  getSubscriptionStatus,
  verifyAndClaim,
  getAuthUrl,
  handleCallback,
  getStatus,
  disconnect,
  verifyAll,
  addChannel,
  updateChannel,
  deleteChannel,
};
