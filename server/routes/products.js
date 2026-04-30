const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      req.userId = decoded.user.id;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Authentication error' });
  }
};

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus-logistics',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => `product_${Date.now()}_${file.originalname}`
  }
});

const upload = multer({ storage });

// GET /api/products - Get all available products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: { $in: ['available', 'rented'] } })
      .populate('sellerId', 'name email')
      .sort({ uploadDate: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/user - Get current user's products
router.get('/user', verifyToken, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.userId })
      .sort({ uploadDate: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products - Create a new product
router.post('/', verifyToken, (req, res, next) => {
  try {
    upload.single('image')(req, res, function (err) {
      if (err) {
        console.error('Multer upload error:', err);
        return res.status(400).json({ message: 'Image upload failed. Please check your Cloudinary credentials.' });
      }
      next();
    });
  } catch (err) {
    console.error('Synchronous multer error:', err);
    return res.status(400).json({ message: 'Image upload failed. Please check your Cloudinary credentials.' });
  }
}, async (req, res) => {
  try {
    const { name, description, salePrice, rentPrice, category, location } = req.body;

    if (!name || !description || !category || !location) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!salePrice && !rentPrice) {
      return res.status(400).json({ message: 'At least sale price or rent price must be provided' });
    }

    // Get user info for seller name
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const product = new Product({
      name,
      description,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      rentPrice: rentPrice ? parseFloat(rentPrice) : null,
      category,
      location,
      image: req.file ? req.file.path : '/images/drafter.png',
      seller: user.name,
      sellerId: req.userId
    });

    await product.save();

    res.status(201).json({
      message: 'Product listed successfully',
      product,
      pointsEarned: 50
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, description, salePrice, rentPrice, category, location } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (salePrice !== undefined) product.salePrice = salePrice ? parseFloat(salePrice) : null;
    if (rentPrice !== undefined) product.rentPrice = rentPrice ? parseFloat(rentPrice) : null;
    if (category) product.category = category;
    if (location) product.location = location;

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products/:id/rent - Rent a product
router.post('/:id/rent', verifyToken, async (req, res) => {
  try {
    const { rentalDays } = req.body;

    if (!rentalDays || rentalDays < 1) {
      return res.status(400).json({ message: 'Valid rental days required' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available for rent' });
    }

    if (!product.rentPrice) {
      return res.status(400).json({ message: 'Product is not available for rent' });
    }

    if (product.sellerId.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot rent your own product' });
    }

    // Update product status
    product.status = 'rented';
    product.rentalEndDate = new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000);
    product.buyerId = req.userId;

    await product.save();

    res.json({
      message: 'Product rented successfully',
      product
    });
  } catch (error) {
    console.error('Error renting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products/:id/buy - Buy a product
router.post('/:id/buy', verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available for sale' });
    }

    if (!product.salePrice) {
      return res.status(400).json({ message: 'Product is not available for sale' });
    }

    if (product.sellerId.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot buy your own product' });
    }

    // Update product status
    product.status = 'sold';
    product.buyerId = req.userId;

    await product.save();

    res.json({
      message: 'Product purchased successfully',
      product
    });
  } catch (error) {
    console.error('Error buying product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
