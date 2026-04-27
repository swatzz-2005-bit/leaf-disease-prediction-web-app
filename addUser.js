const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function addUser() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const existing = await User.findOne({ email: 'swathi.bt23@bitsaty.ac.in' });
  if (existing) {
    existing.password = 'swatzz_2005';
    await existing.save();
    console.log('✅ User password updated: swathi.bt23@bitsaty.ac.in');
  } else {
    await User.create({
      name: 'Swathi',
      email: 'swathi.bt23@bitsaty.ac.in',
      password: 'swatzz_2005',
      role: 'user'
    });
    console.log('✅ User created: swathi.bt23@bitsaty.ac.in / swatzz_2005');
  }

  mongoose.disconnect();
}

addUser().catch(console.error);
