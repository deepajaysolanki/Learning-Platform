const express = require('express');
const mongooose = require('mongoose');

require('dotenv').config();
const uri = process.env.MONGO_URI;
mongooose.connect(uri);

const userSchema = new mongooose.Schema({
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
        required: true
    },
    googleID: {
        type: String,
        optional: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const User = mongooose.model('User', userSchema);
module.exports = User;
