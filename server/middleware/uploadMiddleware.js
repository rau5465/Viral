const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// Memory storage to process and compress with sharp before writing to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (PNG, JPG, JPEG, WEBP) are allowed!', 400), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter,
});

// Middleware to compress image with sharp and save to /uploads/contacts
const compressContactImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const uploadDir = path.join(__dirname, '../uploads/contacts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
    const outputPath = path.join(uploadDir, filename);

    // Compress image: resize to max 1280px wide/tall, convert to WebP with 80% quality
    await sharp(req.file.buffer)
      .resize({
        width: 1280,
        height: 1280,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Attach relative public URL
    req.compressedImageUrl = `/uploads/contacts/${filename}`;
    next();
  } catch (err) {
    console.error('Image compression failed:', err);
    // Continue without blocking submission if compression fails, or pass error
    return next(new AppError('Failed to process and compress attached image. Please try another image.', 400));
  }
};

module.exports = {
  upload,
  compressContactImage,
};
