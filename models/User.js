const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  balance: { type: Number, default: 1000 },
  gamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  bannedBy: { type: String },
  bannedAt: { type: Date },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);