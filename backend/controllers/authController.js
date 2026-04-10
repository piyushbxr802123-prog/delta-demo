const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  const { rollNumber, name, password, role } = req.body;

  try {
    const userExists = await User.findOne({ rollNumber });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      rollNumber,
      name,
      password: hashedPassword,
      role: role || 'student',
      // students get 2000 initial balance, managers 0 by default
      balance: role === 'manager' ? 0 : 2000 
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        rollNumber: user.rollNumber,
        name: user.name,
        role: user.role,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    const user = await User.findOne({ rollNumber });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        rollNumber: user.rollNumber,
        name: user.name,
        role: user.role,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
