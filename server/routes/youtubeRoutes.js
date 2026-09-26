const express = require('express');
const {
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
} = require('../controllers/youtubeController');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');

const router = express.Router();

// 1. Partner Channels (Public / Optional Auth for personalized subscription state)
router.get('/channels', optionalAuth, getChannels);

// 2. Subscription Status & Verification
router.get('/subscription-status/:channelId', protect, getSubscriptionStatus);
router.post('/verify-and-claim/:channelId', protect, verifyAndClaim);
router.post('/verify-all', protect, verifyAll);

// 3. OAuth 2.0 Flow
router.get('/auth-url', protect, getAuthUrl);
router.get('/callback', handleCallback);
router.get('/status', protect, getStatus);
router.post('/disconnect', protect, disconnect);

// 4. Partner Channel Management (Admin or Partner)
router.post('/partner/channels', protect, restrictTo('admin'), addChannel);
router.put('/partner/channels/:id', protect, restrictTo('admin'), updateChannel);
router.delete('/partner/channels/:id', protect, restrictTo('admin'), deleteChannel);

module.exports = router;
