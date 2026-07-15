const express = require('express');
const mongooose = require('mongoose');

require('dotenv').config({ path: '../.env' });
const uri = process.env.MONGO_URI;
mongooose.connect(uri);

const userSchema = new mongooose.Schema({
    fullName: { type: String, default: ""},
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
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const User = mongooose.model('User', userSchema);
module.exports = User;
