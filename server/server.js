require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;

const User = require('./models/User');

const app = express();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connect + Auto Admin Create
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully!");

    // Check admin user
    const adminExists = await User.findOne({ email: 'admin' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@2026', 10);

      await User.create({
        name: 'Super Admin',
        email: 'admin',
        phone: '9999999999',
        password: hashedPassword,
        role: 'admin'
      });

      console.log("👑 Admin user created successfully!");
      console.log("Login:");
      console.log("Username: admin");
      console.log("Password: Admin@2026");
    } else {
      console.log("✅ Admin already exists");
    }

  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reset', require('./routes/passwordReset'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/products', require('./routes/products'));

app.get('/', (req, res) => {
  res.send('Smart Campus API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});