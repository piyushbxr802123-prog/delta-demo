const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { addToQueue, getQueue } = require('../services/queueService');

exports.payMess = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const user = await User.findById(req.user._id);

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      sender: user._id,
      amount,
      type: 'payment',
      status: 'success'
    });

    // Add to real-time queue
    addToQueue(transaction._id, user.name, user.rollNumber, amount);

    res.json({ message: 'Payment successful', transaction, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.transferMoney = async (req, res) => {
  const { receiverRollNumber, amount } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const sender = await User.findById(req.user._id);
    const receiver = await User.findOne({ rollNumber: receiverRollNumber });

    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });
    if (sender._id.toString() === receiver._id.toString()) return res.status(400).json({ message: 'Cannot transfer to yourself' });

    if (sender.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    sender.balance -= amount;
    receiver.balance += Number(amount);

    await sender.save();
    await receiver.save();

    const transaction = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      type: 'transfer',
      status: 'success'
    });

    res.json({ message: 'Transfer successful', transaction, newBalance: sender.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    // Both sender and receiver transactions
    const transactions = await Transaction.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name rollNumber')
      .populate('receiver', 'name rollNumber')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllHistoryManager = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('sender', 'name rollNumber')
      .populate('receiver', 'name rollNumber')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
