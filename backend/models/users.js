const express = require('express');
const mongoose = require('mongoose');

// require('dotenv').config({ path: '../.env' });
const uri = process.env.MONGO_URI;
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("🚀 MongoDB Connected successfully!");
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
})
.catch(err => {
  console.error("❌ Critical MongoDB connection failure:", err);
});
const userSchema = new mongoose.Schema({
    fullName: { type: String, default: "" },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    authProvider: {
        type: String,
        default: 'local'
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    savedNotebooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notebook' }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
