const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const {
  User,
  PartnerChannel,
  UserYouTubeAccount,
  UserYouTubeSubscription,
  Task,
  TaskCompletion,
  sequelize,
} = require('../models');
const { encryptToken, decryptToken } = require('../utils/crypto');
const { awardCredits } = require('./creditService');
const { checkAndApplyBonusMultiplier } = require('./bonusService');
const AppError = require('../utils/AppError');
require('dotenv').config();

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || `${SERVER_URL}/api/youtube/callback`;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Checks whether Google OAuth credentials are fully configured
 */
const isOAuthConfigured = () => {
  return (
    GOOGLE_CLIENT_ID &&
    GOOGLE_CLIENT_SECRET &&
    !GOOGLE_CLIENT_ID.includes('your_google_client_id') &&
    !GOOGLE_CLIENT_SECRET.includes('your_google_client_secret')
  );
};

/**
 * Creates a new OAuth2 client instance
 */
const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
  );
};

/**
 * Generate Google OAuth 2.0 Consent URL with state parameter
 * @param {number} userId - The authenticated application user's ID
 * @returns {string} - The Google OAuth authorization URL
 */
const generateAuthUrl = (userId) => {
  // If not configured, provide a dev mock auth redirect URL
  if (!isOAuthConfigured()) {
    console.warn(
      '⚠️ [YouTubeService] GOOGLE_CLIENT_ID/SECRET not configured in .env. Using development auth redirect.'
    );
    const mockState = jwt.sign({ userId, mock: true }, JWT_SECRET, { expiresIn: '15m' });
    return `${SERVER_URL}/api/youtube/callback?code=mock_oauth_code_${Date.now()}&state=${mockState}`;
  }

  const oauth2Client = createOAuth2Client();

  // Create state token containing userId to associate callback and prevent CSRF
  const stateToken = jwt.sign({ userId, nonce: Math.random().toString(36).substring(7) }, JWT_SECRET, {
    expiresIn: '15m',
  });

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Essential: request refresh token
    prompt: 'consent', // Forces consent screen to ensure refresh_token is returned
    scope: YOUTUBE_SCOPES,
    state: stateToken,
    include_granted_scopes: true,
  });
};

/**
 * Handle Google OAuth callback: exchange code for tokens & store user YouTube account
 * @param {string} code - The OAuth authorization code from Google
 * @param {string} state - The signed state token
 * @returns {object} - User YouTube profile information
 */
const handleOAuthCallback = async (code, state) => {
  if (!state) {
    throw new AppError('State parameter is missing from OAuth callback.', 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(state, JWT_SECRET);
  } catch {
    throw new AppError('Invalid or expired OAuth state parameter. Please try again.', 400);
  }

  const { userId, mock } = decoded;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User associated with OAuth session not found.', 404);
  }

  // Handle Mock/Development Mode if Google credentials are not configured
  if (mock || !isOAuthConfigured()) {
    console.log(`ℹ️ [YouTubeService] Handling mock OAuth callback for User #${userId}`);
    const mockExpiry = Date.now() + 3600 * 1000 * 24 * 7; // 7 days
    const encryptedAccess = encryptToken(`mock_access_token_${Date.now()}`);
    const encryptedRefresh = encryptToken(`mock_refresh_token_${Date.now()}`);

    let account = await UserYouTubeAccount.findOne({ where: { user_id: userId } });
    if (account) {
      account.google_id = account.google_id || `google_mock_${userId}`;
      account.youtube_email = account.youtube_email || user.email;
      account.youtube_channel_id = account.youtube_channel_id || `UC_mock_user_${userId}`;
      account.youtube_channel_title = account.youtube_channel_title || `${user.full_name} (YouTube)`;
      account.avatar_url =
        account.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
      account.access_token = encryptedAccess;
      account.refresh_token = encryptedRefresh;
      account.token_expiry = mockExpiry;
      account.scope = YOUTUBE_SCOPES.join(' ');
      account.is_connected = true;
      account.last_verified_at = new Date();
      await account.save();
    } else {
      account = await UserYouTubeAccount.create({
        user_id: userId,
        google_id: `google_mock_${userId}`,
        youtube_email: user.email,
        youtube_channel_id: `UC_mock_user_${userId}`,
        youtube_channel_title: `${user.full_name} (YouTube)`,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        access_token: encryptedAccess,
        refresh_token: encryptedRefresh,
        token_expiry: mockExpiry,
        scope: YOUTUBE_SCOPES.join(' '),
        is_connected: true,
        last_verified_at: new Date(),
      });
    }

    return {
      userId,
      email: account.youtube_email,
      channelTitle: account.youtube_channel_title,
      channelId: account.youtube_channel_id,
      isConnected: true,
    };
  }

  // Real Google OAuth Flow
  const oauth2Client = createOAuth2Client();

  let tokens;
  try {
    const tokenResponse = await oauth2Client.getToken(code);
    tokens = tokenResponse.tokens;
  } catch (tokenErr) {
    console.error('Error exchanging OAuth code:', tokenErr.message);
    throw new AppError(
      `Failed to exchange authorization code with Google: ${tokenErr.message}`,
      400
    );
  }

  oauth2Client.setCredentials(tokens);

  // Fetch Google Profile information
  let googleProfile = { id: '', email: user.email, picture: null };
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const profileRes = await oauth2.userinfo.get();
    googleProfile = {
      id: profileRes.data.id,
      email: profileRes.data.email,
      picture: profileRes.data.picture,
    };
  } catch (profErr) {
    console.warn('Could not fetch Google userinfo:', profErr.message);
  }

  // Fetch YouTube Channel Information for this user
  let channelInfo = { id: null, title: user.full_name };
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelRes = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
    });

    if (channelRes.data.items && channelRes.data.items.length > 0) {
      const ch = channelRes.data.items[0];
      channelInfo = {
        id: ch.id,
        title: ch.snippet?.title || user.full_name,
        thumbnail: ch.snippet?.thumbnails?.default?.url || googleProfile.picture,
      };
    }
  } catch (ytErr) {
    console.warn('Could not fetch personal YouTube channel:', ytErr.message);
  }

  // Encrypt tokens before storing
  const encryptedAccess = encryptToken(tokens.access_token);
  const encryptedRefresh = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;
  const expiryDate = tokens.expiry_date || Date.now() + 3600 * 1000;

  let account = await UserYouTubeAccount.findOne({ where: { user_id: userId } });

  if (account) {
    account.google_id = googleProfile.id || account.google_id;
    account.youtube_email = googleProfile.email || account.youtube_email;
    account.youtube_channel_id = channelInfo.id || account.youtube_channel_id;
    account.youtube_channel_title = channelInfo.title || account.youtube_channel_title;
    account.avatar_url = channelInfo.thumbnail || googleProfile.picture || account.avatar_url;
    account.access_token = encryptedAccess;
    // Retain existing refresh token if Google didn't return a new one on this login
    if (encryptedRefresh) {
      account.refresh_token = encryptedRefresh;
    }
    account.token_expiry = expiryDate;
    account.scope = tokens.scope || account.scope;
    account.is_connected = true;
    account.last_verified_at = new Date();
    await account.save();
  } else {
    account = await UserYouTubeAccount.create({
      user_id: userId,
      google_id: googleProfile.id,
      youtube_email: googleProfile.email,
      youtube_channel_id: channelInfo.id,
      youtube_channel_title: channelInfo.title,
      avatar_url: channelInfo.thumbnail || googleProfile.picture,
      access_token: encryptedAccess,
      refresh_token: encryptedRefresh,
      token_expiry: expiryDate,
      scope: tokens.scope,
      is_connected: true,
      last_verified_at: new Date(),
    });
  }

  return {
    userId,
    email: account.youtube_email,
    channelTitle: account.youtube_channel_title,
    channelId: account.youtube_channel_id,
    isConnected: true,
  };
};

/**
 * Returns an authenticated Google OAuth2Client for the given user,
 * handling automatic token expiration check and refresh.
 * @param {number} userId
 * @returns {Promise<{ oauth2Client: object, account: object }>}
 */
const getAuthenticatedOAuthClient = async (userId) => {
  const account = await UserYouTubeAccount.findOne({ where: { user_id: userId } });

  if (!account || !account.is_connected) {
    throw new AppError(
      'YouTube account is not connected. Please connect your YouTube account first.',
      401,
      'YOUTUBE_NOT_CONNECTED'
    );
  }

  // Handle Mock Mode
  if (!isOAuthConfigured() || (account.access_token && account.access_token.includes('mock'))) {
    return {
      oauth2Client: null,
      account,
      isMock: true,
    };
  }

  const oauth2Client = createOAuth2Client();
  const rawAccessToken = decryptToken(account.access_token);
  const rawRefreshToken = decryptToken(account.refresh_token);

  oauth2Client.setCredentials({
    access_token: rawAccessToken,
    refresh_token: rawRefreshToken,
    expiry_date: Number(account.token_expiry),
  });

  // Listen for automatic token updates from google-auth-library
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      if (newTokens.access_token) {
        account.access_token = encryptToken(newTokens.access_token);
      }
      if (newTokens.refresh_token) {
        account.refresh_token = encryptToken(newTokens.refresh_token);
      }
      if (newTokens.expiry_date) {
        account.token_expiry = newTokens.expiry_date;
      }
      await account.save();
    } catch (saveErr) {
      console.error('Failed to persist refreshed OAuth tokens:', saveErr.message);
    }
  });

  // Proactive Token Expiration Check (buffer: 2 minutes)
  const isExpiringSoon = Date.now() >= Number(account.token_expiry) - 120 * 1000;
  if (isExpiringSoon) {
    if (!rawRefreshToken) {
      account.is_connected = false;
      await account.save();
      throw new AppError(
        'Your YouTube authorization has expired and no refresh token is present. Please reconnect your account.',
        401,
        'OAUTH_TOKEN_EXPIRED'
      );
    }

    try {
      const refreshed = await oauth2Client.refreshAccessToken();
      const newCreds = refreshed.credentials;
      account.access_token = encryptToken(newCreds.access_token);
      if (newCreds.refresh_token) {
        account.refresh_token = encryptToken(newCreds.refresh_token);
      }
      account.token_expiry = newCreds.expiry_date || Date.now() + 3600 * 1000;
      await account.save();
      oauth2Client.setCredentials(newCreds);
    } catch (refreshErr) {
      console.error('Failed to refresh OAuth token:', refreshErr.message);
      // Check if access was revoked by the user on Google account settings
      if (
        refreshErr.message.includes('invalid_grant') ||
        refreshErr.message.includes('revoked') ||
        refreshErr.response?.status === 400 ||
        refreshErr.response?.status === 401
      ) {
        account.is_connected = false;
        await account.save();
        throw new AppError(
          'YouTube authorization has been revoked in your Google Account. Please reconnect your account.',
          401,
          'OAUTH_REVOKED'
        );
      }
      throw new AppError('Unable to refresh YouTube access token. Please reconnect.', 500);
    }
  }

  return { oauth2Client, account, isMock: false };
};

/**
 * Check whether the authenticated user is subscribed to a specific partner channel.
 * Uses YouTube Data API v3 `subscriptions.list` with `mine=true` and `forChannelId`.
 * This correctly verifies private subscriptions without relying on channel owner subscriber lists!
 *
 * @param {number} userId - The user's ID
 * @param {string} channelId - The partner's YouTube Channel ID (e.g. UC...)
 * @returns {Promise<{ subscribed: boolean, channelId: string, verifiedAt: Date, channelTitle?: string }>}
 */
const checkUserSubscription = async (userId, channelId) => {
  if (!channelId || typeof channelId !== 'string') {
    throw new AppError('Valid YouTube channelId is required.', 400);
  }

  // 1. Get authenticated OAuth client
  const { oauth2Client, account, isMock } = await getAuthenticatedOAuthClient(userId);

  // 2. Fetch Partner Channel details from DB
  const partnerChannel = await PartnerChannel.findOne({ where: { channel_id: channelId } });

  let isSubscribed = false;
  let subscriptionDetails = null;

  // Handle Mock Mode
  if (isMock) {
    // In mock mode, check if user has recorded a subscription record or simulate verified
    const existing = await UserYouTubeSubscription.findOne({
      where: { user_id: userId, channel_id: channelId },
    });
    // In mock development, default to true so developers can test the reward claim flow
    isSubscribed = existing ? existing.is_subscribed : true;
  } else {
    // Live YouTube Data API v3 Call
    try {
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // YouTube Data API v3: subscriptions.list with mine=true and forChannelId
      // Google Documentation:
      // "The forChannelId parameter specifies a YouTube channel ID. The API only returns that channel's subscriptions if the parameter value matches the ID of a channel that the authenticated user subscribes to."
      const response = await youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        forChannelId: channelId,
        maxResults: 1,
      });

      if (response.data.items && response.data.items.length > 0) {
        isSubscribed = true;
        subscriptionDetails = response.data.items[0];
      } else {
        isSubscribed = false;
      }
    } catch (apiErr) {
      console.error('YouTube Data API Error during subscription check:', apiErr.message);

      // Handle token revocation or expiration during call
      if (
        apiErr.code === 401 ||
        apiErr.message.includes('invalid_grant') ||
        apiErr.message.includes('Token has been expired or revoked')
      ) {
        account.is_connected = false;
        await account.save();
        throw new AppError(
          'Google authorization has been revoked or expired. Please reconnect your YouTube account.',
          401,
          'OAUTH_REVOKED'
        );
      }

      // Handle Quota Exceeded
      if (apiErr.code === 403 && apiErr.message.includes('quotaExceeded')) {
        throw new AppError(
          'YouTube Data API quota temporarily exceeded. Please try again later.',
          429,
          'QUOTA_EXCEEDED'
        );
      }

      throw new AppError(`YouTube verification failed: ${apiErr.message}`, 502);
    }
  }

  // 3. Upsert record in user_youtube_subscriptions
  const now = new Date();
  let subscriptionRecord = await UserYouTubeSubscription.findOne({
    where: { user_id: userId, channel_id: channelId },
  });

  if (subscriptionRecord) {
    subscriptionRecord.is_subscribed = isSubscribed;
    subscriptionRecord.verified_at = now;
    if (partnerChannel) {
      subscriptionRecord.partner_channel_id = partnerChannel.id;
    }
    await subscriptionRecord.save();
  } else {
    subscriptionRecord = await UserYouTubeSubscription.create({
      user_id: userId,
      channel_id: channelId,
      partner_channel_id: partnerChannel ? partnerChannel.id : null,
      is_subscribed: isSubscribed,
      verified_at: now,
      credits_claimed: false,
      credits_awarded: 0,
    });
  }

  return {
    subscribed: isSubscribed,
    channelId,
    channelTitle: partnerChannel ? partnerChannel.channel_title : null,
    verifiedAt: now,
    alreadyClaimed: subscriptionRecord.credits_claimed,
    creditsReward: partnerChannel ? partnerChannel.credits_reward : 0,
    details: subscriptionDetails ? { id: subscriptionDetails.id } : null,
  };
};

/**
 * Verify subscription and claim reward credits for a specific partner channel
 * @param {number} userId
 * @param {string} channelId
 * @returns {Promise<object>}
 */
const verifyAndClaimReward = async (userId, channelId) => {
  const partnerChannel = await PartnerChannel.findOne({
    where: { channel_id: channelId, is_active: true },
  });

  if (!partnerChannel) {
    throw new AppError('Partner channel not found or currently inactive.', 404);
  }

  // 1. Verify live subscription with YouTube API
  const checkResult = await checkUserSubscription(userId, channelId);

  if (!checkResult.subscribed) {
    return {
      status: 'fail',
      subscribed: false,
      alreadyClaimed: false,
      creditsAwarded: 0,
      message: `You are not subscribed to "${partnerChannel.channel_title}" on YouTube. Please subscribe and try again.`,
    };
  }

  // 2. Check if credits were already claimed
  const existingSub = await UserYouTubeSubscription.findOne({
    where: { user_id: userId, channel_id: channelId },
  });

  if (existingSub && existingSub.credits_claimed) {
    return {
      status: 'fail',
      subscribed: true,
      alreadyClaimed: true,
      creditsAwarded: 0,
      message: `Credits for "${partnerChannel.channel_title}" have already been claimed!`,
    };
  }

  // 3. Award credits and update records atomically
  const rewardAmount = partnerChannel.credits_reward || 50;

  await sequelize.transaction(async (t) => {
    // Update or create subscription record
    if (existingSub) {
      existingSub.is_subscribed = true;
      existingSub.verified_at = new Date();
      existingSub.credits_claimed = true;
      existingSub.credits_awarded = rewardAmount;
      existingSub.partner_channel_id = partnerChannel.id;
      await existingSub.save({ transaction: t });
    } else {
      await UserYouTubeSubscription.create(
        {
          user_id: userId,
          channel_id: channelId,
          partner_channel_id: partnerChannel.id,
          is_subscribed: true,
          verified_at: new Date(),
          credits_claimed: true,
          credits_awarded: rewardAmount,
        },
        { transaction: t }
      );
    }

    // Award user credits
    await awardCredits({
      userId,
      amount: rewardAmount,
      category: 'task',
      description: `YouTube Subscription: ${partnerChannel.channel_title}`,
      referenceId: partnerChannel.id,
      transaction: t,
    });

    // If channel is linked to a Task, mark task completion
    if (partnerChannel.task_id) {
      const task = await Task.findByPk(partnerChannel.task_id, { transaction: t });
      if (task) {
        task.total_completions += 1;
        await task.save({ transaction: t });

        await TaskCompletion.create(
          {
            user_id: userId,
            task_id: task.id,
            status: 'completed',
            started_at: new Date(),
            completed_at: new Date(),
            credits_awarded: rewardAmount,
            verification_data: {
              channelId,
              channelTitle: partnerChannel.channel_title,
              verifiedVia: 'YouTube_Data_API_v3',
            },
          },
          { transaction: t }
        );
      }
    }
  });

  // 4. Trigger 4x bonus multiplier check
  await checkAndApplyBonusMultiplier(userId);

  const updatedUser = await User.findByPk(userId);

  return {
    status: 'success',
    subscribed: true,
    alreadyClaimed: false,
    creditsAwarded: rewardAmount,
    newBalance: updatedUser.credit_balance,
    channelTitle: partnerChannel.channel_title,
    message: `🎉 Verified! You have earned +${rewardAmount} credits for subscribing to "${partnerChannel.channel_title}".`,
  };
};

/**
 * Get all partner channels, optionally annotated with the requesting user's subscription & claim status
 * @param {number|null} userId
 * @returns {Promise<Array>}
 */
const getPartnerChannels = async (userId = null) => {
  const channels = await PartnerChannel.findAll({
    where: { is_active: true },
    order: [['credits_reward', 'DESC']],
  });

  let userAccount = null;
  let userSubscriptions = [];

  if (userId) {
    userAccount = await UserYouTubeAccount.findOne({ where: { user_id: userId } });
    userSubscriptions = await UserYouTubeSubscription.findAll({
      where: { user_id: userId },
    });
  }

  const subMap = {};
  userSubscriptions.forEach((sub) => {
    subMap[sub.channel_id] = sub;
  });

  const isUserConnected = !!(userAccount && userAccount.is_connected);

  return {
    isUserConnected,
    connectedAccount: isUserConnected
      ? {
          email: userAccount.youtube_email,
          channelTitle: userAccount.youtube_channel_title,
          avatarUrl: userAccount.avatar_url,
          lastVerifiedAt: userAccount.last_verified_at,
        }
      : null,
    channels: channels.map((ch) => {
      const userSub = subMap[ch.channel_id];
      return {
        id: ch.id,
        partnerId: ch.partner_id,
        channelId: ch.channel_id,
        channelTitle: ch.channel_title,
        channelHandle: ch.channel_handle,
        channelUrl: ch.channel_url,
        thumbnailUrl: ch.thumbnail_url,
        description: ch.description,
        creditsReward: ch.credits_reward,
        subscriberCount: ch.subscriber_count,
        isSubscribed: userSub ? userSub.is_subscribed : false,
        creditsClaimed: userSub ? userSub.credits_claimed : false,
        verifiedAt: userSub ? userSub.verified_at : null,
      };
    }),
  };
};

/**
 * Check subscription status for all active partner channels in batch
 * @param {number} userId
 * @returns {Promise<object>}
 */
const checkAllPartnerSubscriptions = async (userId) => {
  const { isUserConnected, channels } = await getPartnerChannels(userId);

  if (!isUserConnected) {
    return {
      isUserConnected: false,
      message: 'YouTube account not connected. Please connect your YouTube account first.',
      results: channels.map((c) => ({
        channelId: c.channelId,
        channelTitle: c.channelTitle,
        subscribed: false,
        creditsClaimed: c.creditsClaimed,
      })),
    };
  }

  const results = [];
  for (const ch of channels) {
    try {
      const res = await checkUserSubscription(userId, ch.channelId);
      results.push({
        channelId: ch.channelId,
        channelTitle: ch.channelTitle,
        subscribed: res.subscribed,
        creditsClaimed: res.alreadyClaimed,
        creditsReward: ch.creditsReward,
        verifiedAt: res.verifiedAt,
      });
    } catch (err) {
      results.push({
        channelId: ch.channelId,
        channelTitle: ch.channelTitle,
        subscribed: ch.isSubscribed,
        creditsClaimed: ch.creditsClaimed,
        error: err.message,
      });
    }
  }

  return {
    isUserConnected: true,
    results,
  };
};

/**
 * Disconnect user's YouTube account
 * @param {number} userId
 */
const disconnectUserYouTube = async (userId) => {
  const account = await UserYouTubeAccount.findOne({ where: { user_id: userId } });
  if (!account) {
    return { success: true, message: 'No YouTube account was connected.' };
  }

  // Attempt to revoke access token with Google if present
  try {
    if (account.access_token && isOAuthConfigured()) {
      const rawToken = decryptToken(account.access_token);
      if (rawToken) {
        const oauth2Client = createOAuth2Client();
        await oauth2Client.revokeToken(rawToken);
      }
    }
  } catch (err) {
    console.warn('Could not revoke token with Google during disconnect:', err.message);
  }

  account.is_connected = false;
  account.access_token = '';
  account.refresh_token = null;
  account.last_verified_at = new Date();
  await account.save();

  return {
    success: true,
    message: 'YouTube account has been disconnected successfully.',
  };
};

/**
 * Partner / Admin channel management functions
 */
const addPartnerChannel = async (partnerId, data) => {
  const { channelId, channelTitle, channelUrl, channelHandle, thumbnailUrl, description, creditsReward } =
    data;

  if (!channelId || !channelTitle || !channelUrl) {
    throw new AppError('Channel ID, Title, and URL are required.', 400);
  }

  const existing = await PartnerChannel.findOne({ where: { channel_id: channelId } });
  if (existing) {
    throw new AppError('A partner channel with this YouTube Channel ID already exists.', 400);
  }

  const newChannel = await PartnerChannel.create({
    partner_id: partnerId,
    channel_id: channelId,
    channel_title: channelTitle,
    channel_handle: channelHandle || null,
    channel_url: channelUrl,
    thumbnail_url: thumbnailUrl || null,
    description: description || null,
    credits_reward: creditsReward || 50,
    is_active: true,
  });

  return newChannel;
};

const updatePartnerChannel = async (id, data) => {
  const channel = await PartnerChannel.findByPk(id);
  if (!channel) {
    throw new AppError('Partner channel not found.', 404);
  }

  const allowedFields = [
    'channel_title',
    'channel_handle',
    'channel_url',
    'thumbnail_url',
    'description',
    'credits_reward',
    'is_active',
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      channel[field] = data[field];
    }
  });

  await channel.save();
  return channel;
};

const deletePartnerChannel = async (id) => {
  const channel = await PartnerChannel.findByPk(id);
  if (!channel) {
    throw new AppError('Partner channel not found.', 404);
  }

  await channel.destroy();
  return { success: true, message: 'Partner channel removed successfully.' };
};

module.exports = {
  isOAuthConfigured,
  generateAuthUrl,
  handleOAuthCallback,
  getAuthenticatedOAuthClient,
  checkUserSubscription,
  verifyAndClaimReward,
  getPartnerChannels,
  checkAllPartnerSubscriptions,
  disconnectUserYouTube,
  addPartnerChannel,
  updatePartnerChannel,
  deletePartnerChannel,
};
