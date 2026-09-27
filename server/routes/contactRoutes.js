const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getAdminContacts,
  updateContactStatus,
  deleteContact,
} = require('../controllers/contactController');
const { upload, compressContactImage } = require('../middleware/uploadMiddleware');
const { protect, restrictTo } = require('../middleware/auth');

// Public route to submit contact inquiry (with image upload and sharp compression)
router.post(
  '/',
  upload.single('image'),
  compressContactImage,
  submitContactMessage
);

// Admin routes for contact search and management
router.use(protect, restrictTo('admin'));

router.get('/admin', getAdminContacts);
router.patch('/admin/:id/status', updateContactStatus);
router.delete('/admin/:id', deleteContact);

module.exports = router;
