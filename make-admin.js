// Make user admin script
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smokebros');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const UserSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const makeAdmin = async () => {
  try {
    await connectDB();
    
    const phone = '+233500000000';
    
    // Find user
    const user = await User.findOne({ phone });
    
    if (!user) {
      console.log('❌ User not found with phone:', phone);
      process.exit(1);
    }
    
    console.log('\n📋 Current User:');
    console.log('  Name:', user.name);
    console.log('  Phone:', user.phone);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    
    // Update to admin
    user.role = 'admin';
    await user.save();
    
    console.log('\n✅ User updated to ADMIN successfully!');
    console.log('\n📋 Updated User:');
    console.log('  Name:', user.name);
    console.log('  Phone:', user.phone);
    console.log('  Role:', user.role);
    console.log('\n🎉 You can now login and access the admin panel!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
