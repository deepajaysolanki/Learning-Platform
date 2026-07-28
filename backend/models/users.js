const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);
