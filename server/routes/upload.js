const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smartcampus',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const upload = multer({ storage });

// Upload single image
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message: 'Image uploaded successfully',
      url: req.file.secure_url,
      public_id: req.file.public_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Delete image
router.delete('/delete/:public_id', async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.public_id);
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
