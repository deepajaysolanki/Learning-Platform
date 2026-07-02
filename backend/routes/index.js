var express = require('express');
var router = express.Router();
const workspaceModel = require('../models/workspace');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const User = require('../models/Users');
const bcrypt = require('bcrypt');
const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// -------------------------------------
router.get('/', function (req, res, next) {
  res.send('Welcome to the Workspace API');
});

// route for registration
router.post('/api/auth/register', async function (req, res) {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Secure the password before saving!
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    return res.status(500).json({ message: `Error creating user error: ${err.message}` });
  }
});

// route for login
router.post('/api/auth/login', async function (req, res) {
  try {
    const { name, password } = req.body;

    // Find the user by email or username
    const user = await User.findOne({
      $or: [
        { email: name },
        { username: name }
      ]
    });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    return res.status(500).json({ message: `Error logging in: ${err.message}` });
  }
});

// route to upload a file to a specific workspace
router.post('/:id/upload', async function (req, res, next) {
  try {
    const extractedText = req.body.text;
    const filename = req.body.filename || "Uploaded File";

    if (!extractedText) {
      return res.status(400).json({ message: 'No text content received.' });
    }

    const updatedWorkspace = await workspaceModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          sources: {
            title: filename,
            rawText: extractedText
          }
        }
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'File parsed and saved successfully!',
      workspace: updatedWorkspace
    });

  } catch (err) {
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// route to create a new workspace
router.post('/api/workspaces', async function (req, res, next) {
  try {
    const workspace = await workspaceModel.create({
      name: req.body.name,
      sources: [
        {
          title: req.body.title,
          rawText: req.body.rawText,
        }
      ],
    });
    res.status(200).json({ message: 'Workspace created successfully', workspace });
  } catch (err) {
    return next(err);
    res.status(500).json({ message: 'Error creating workspace', error: err.message })
  }
  ;
});

// 
router.post('/api/workspaces/:id/ask', async function (req, res,) {
  try {
    const workspaceId = req.params.id;
    const userQuestion = req.body.question;

    // find the workspace in database
    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace || workspace.sources.length === 0) {
      return res.status(404).json({ message: 'Workspace not found or has no sources' });
    }

    // grab the raw text from the sources in the workspace
    const documentText = workspace.sources[0].rawText;

    // craft the prompt for the AI model
    const prompt = `
      You are a helpful study assistant. 
      Base your answer ONLY on the following source text provided by the user. 
      If the answer cannot be found in the text, say "I cannot find that in the provided document."
      
      Source Text:
      ${documentText}
      
      User Question: ${userQuestion}
    `;

    // send the prompt to the AI model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // return the AI's answer to the user
    res.status(200).json({
      answer: response.text
    });

  } catch (err) {
    res.status(500).json({ message: 'Error processing request', error: err.message })
  }
})
module.exports = router;
