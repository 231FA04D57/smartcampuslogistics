const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is admin
// Since the frontend just sends JWT token, we need a middleware to verify it first.
// Wait, there is no auth middleware in this project? Let's check `routes/auth.js` or create a simple one here.
// Actually, let's just create a basic admin middleware.
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE a user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting the main admin
    if (user.email === 'admin') {
      return res.status(400).json({ message: 'Cannot delete the main admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// UPDATE a user (e.g., change role)
router.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { name, role } = req.body;
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent demoting the main admin
    if (user.email === 'admin' && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot demote the main admin account' });
    }

    user.name = name || user.name;
    user.role = role || user.role;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
