const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const user = await User.findOne({ email: 'admin' });
    console.log('Admin user:', user);
    if (user) {
      const isMatch = await bcrypt.compare('Admin@2026', user.password);
      console.log('Password match for Admin@2026:', isMatch);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkAdmin();
