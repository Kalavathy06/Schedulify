//C:\schedulify-app\server\models\User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  // server/models/User.js (Add these lines inside your schema)
  googleRefreshToken: String,
  microsoftRefreshToken: String, 
  calendarProvider: { type: String, default: 'google' }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleRefreshToken: String,
  timezone: { type: String, default: 'UTC' },
  availability: {
    startHour: { type: String, default: '09:00' },
    endHour: { type: String, default: '17:00' },
    days: { type: [Number], default: [1,2,3,4,5] }
  }
});


// Hash password before save
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);