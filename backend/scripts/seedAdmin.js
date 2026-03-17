require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/user');

const DEFAULT_ADMIN = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@mail.com',
  password: '123456Aa',
  role: 'admin',
  mobile: '9999999999',
  permanentAddress: {
    street: 'Admin Street',
    city: 'Admin City',
    state: 'Admin State',
    pincode: '000000',
    country: 'Adminland'
  },
  currentAddress: {
    street: 'Admin Street',
    city: 'Admin City',
    state: 'Admin State',
    pincode: '000000',
    country: 'Adminland'
  },
  dateOfBirth: new Date('2000-01-01'),
  gender: 'other'
};

const seedAdmin = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const existing = await User.findOne({ email: DEFAULT_ADMIN.email });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);

  const adminUser = new User({
    ...DEFAULT_ADMIN,
    password: hashedPassword
  });

  await adminUser.save();
  console.log('Admin created:', DEFAULT_ADMIN.email);
  console.log('Password:', DEFAULT_ADMIN.password);

  await mongoose.disconnect();
};

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
