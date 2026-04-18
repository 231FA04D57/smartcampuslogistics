require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection using URI from .env
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcampus';

    await mongoose.connect(uri);
    console.log('====================================================');

    // Seed admin user
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ email: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@2026', salt);
      await User.create({
        name: 'Super Admin',
        email: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('👑 Admin user seeded successfully!');
    }
    console.log('✅ MongoDB Connected Successfully!');
    console.log('🚀 TO VIEW DATA IN MONGODB COMPASS, COPY THIS URI:');
    console.log(`👉 ${uri}`);
    console.log('====================================================');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reset', require('./routes/passwordReset'));

app.get('/', (req, res) => {
  res.send('Smart Campus API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
