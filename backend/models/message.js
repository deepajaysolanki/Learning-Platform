const mongoose = require('mongoose');

require('dotenv').config({ path: '../.env' });
const uri = process.env.MONGO_URI;
mongoose.connect(uri);

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);