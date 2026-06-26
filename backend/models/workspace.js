const express = require('express');
const mongooose = require('mongoose');

require('dotenv').config();
const uri = process.env.MONGO_URI;
mongooose.connect(uri);

const workspaceSchema = new mongooose.Schema({
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    sources: [
        {
            title: { type: String, required: true },
            rawText: { type: String, required: true }
        }
    ]
});

const Workspace = mongooose.model('Workspace', workspaceSchema);
module.exports = Workspace;