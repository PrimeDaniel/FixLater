const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const sharp = require('sharp');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure AWS S3 (or compatible service like Cloudflare R2)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.R2_ENDPOINT, // For Cloudflare R2
  s3ForcePathStyle: true, // Required for R2
});

// Configure multer for memory storage (to process with sharp)
const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload single image
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Compress and resize image
    const processedImage = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    // Upload to S3/R2
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${filename}`,
      Body: processedImage,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();

    res.json({ image_url: result.Location });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload multiple images
router.post('/images', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      // Compress and resize
      const processedImage = await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${filename}`,
        Body: processedImage,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };

      const result = await s3.upload(params).promise();
      return result.Location;
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.json({ image_urls: imageUrls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;

