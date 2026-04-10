const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'manager', 'admin'],
    default: 'student'
  },
  balance: {
    type: Number,
    default: 2000
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
