const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');

const router = express.Router();

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const collegeRegex = /^2[a-zA-Z0-9]{8,9}@/;
    if (!collegeRegex.test(email)) {
      return res.status(400).json({ message: 'Email must start with 2 and have 9 or 10 characters before the @ symbol.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save or update OTP in DB
    await OTP.findOneAndDelete({ email });
    await OTP.create({ email, otp });

    // --- DEV MODE / FALLBACK ---
    console.log(`\n======================================================`);
    console.log(`🔑 ATTENTION: The OTP for ${email} is: ${otp}`);
    console.log(`======================================================\n`);

    try {
      // Send email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"CampusLogistics" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your CampusLogistics Account',
        html: `<h2>Welcome to CampusLogistics!</h2>
               <p>Your OTP for registration is: <strong>${otp}</strong></p>
               <p>This code will expire in 5 minutes.</p>`
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (emailErr) {
      console.warn("⚠️ Email could not be sent (likely due to Gmail App Password restrictions).");
      console.warn("⚠️ Proceeding anyway since the OTP was logged to the console.");
      res.status(200).json({ message: 'Email failed, but OTP logged to server console.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating OTP.' });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, alternateEmail, password, role, otp } = req.body;

    const collegeRegex = /^2[a-zA-Z0-9]{8,9}@/;
    if (!collegeRegex.test(email)) {
      return res.status(400).json({ message: 'Email must start with 2 and have 9 or 10 characters before the @ symbol.' });
    }

    if (!phone || !name || !password) {
      return res.status(400).json({ message: 'Name, phone number, and password are required' });
    }

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Check OTP
    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      phone,
      alternateEmail: alternateEmail || null,
      password: hashedPassword,
      role
    });

    await user.save();

    // Delete OTP after successful registration
    await OTP.findOneAndDelete({ email });

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, alternateEmail: user.alternateEmail, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const collegeRegex = /^2[a-zA-Z0-9]{8,9}@/;
    const normalizedInput = emailOrPhone.toLowerCase().trim();
    const isPhoneNumber = /^[0-9]{10}$/.test(normalizedInput.replace(/[^\d]/g, ''));
    
    console.log('Login attempt:', { input: req.body.emailOrPhone, normalized: normalizedInput, isPhone: isPhoneNumber });

    if (!isPhoneNumber && !collegeRegex.test(normalizedInput) && normalizedInput !== 'admin') {
      console.log('Validation failed');
      return res.status(400).json({ message: 'Please enter a valid college email or phone number' });
    }

    // Check if user exists - search by email or phone
    let user;
    if (isPhoneNumber) {
      user = await User.findOne({ phone: normalizedInput.replace(/[^\d]/g, '') });
    } else {
      user = await User.findOne({ email: normalizedInput === 'admin' ? 'admin' : normalizedInput });
    }
    
    console.log('User found:', user ? (user.email || user.phone) : 'null');
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, alternateEmail: user.alternateEmail, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

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

// GET /api/auth/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find user by ID
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        alternateEmail: user.alternateEmail,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, alternateEmail } = req.body;
    const userId = req.userId;

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (alternateEmail !== undefined) user.alternateEmail = alternateEmail || null;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        alternateEmail: user.alternateEmail,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
