const mongoose = require('mongoose');

// require('dotenv').config({ path: '../.env' });
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  ssl: true,
  tls: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("🚀 Successfully connected to MongoDB Atlas!"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);