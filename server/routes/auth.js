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

    const collegeRegex = /^2[a-zA-Z0-9]{9}@/;
    if (!collegeRegex.test(email)) {
      return res.status(400).json({ message: 'Email must start with 2 and have exactly 10 characters before the @ symbol.' });
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
    const { name, email, password, role, otp } = req.body;

    const collegeRegex = /^2[a-zA-Z0-9]{9}@/;
    if (!collegeRegex.test(email)) {
      return res.status(400).json({ message: 'Email must start with 2 and have exactly 10 characters before the @ symbol.' });
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
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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
    const { email, password } = req.body;

    const collegeRegex = /^2[a-zA-Z0-9]{9}@/;
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Login attempt:', { email: req.body.email, password: req.body.password, normalizedEmail });

    if (!collegeRegex.test(normalizedEmail) && normalizedEmail !== 'admin') {
      console.log('Regex failed');
      return res.status(400).json({ message: 'Email must start with 2 and have exactly 10 characters before the @ symbol.' });
    }

    // Check if user exists
    let user = await User.findOne({ email: normalizedEmail === 'admin' ? 'admin' : email });
    console.log('User found:', user ? user.email : 'null');
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
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
