var express = require('express');
var router = express.Router();
const workspaceModel = require('../models/workspace');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '../.env'});
const User = require('../models/Users');
const bcrypt = require('bcrypt');
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Notebook = require('../models/Notebook');
const requireAuth = require('../middleware/auth');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// -------------------------------------
router.get('/', function (req, res, next) {
  res.send('Welcome to the Workspace API');
});

// route for registration
router.post('/register', async function (req, res) {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUserEmail = await User.findOne({ "email": email });

    if (existingUserEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingUserName = await User.findOne({ "username": username });
    if (existingUserName) {
      return res.status(400).json({ message: 'User with this username already exists' });
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
router.post('/login', async function (req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    // Find the user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
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

    // generate the token after we know the password is correct
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.GOOGLE_CLIENT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: 'Login successful', token: token, user: user });
  } catch (err) {
    return res.status(500).json({ message: `Error logging in: ${err.message}` });
  }
});

// route for google authentication
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ROUTE 1: The Initial Google Login / Fork in the Road
router.post('/google', async function (req, res) {
  try {
    const { credential } = req.body;

    // 1. Verify the token with Google's servers
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email } = payload;

    // 2. Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // ➔ PATH A: User exists! Log them in and give them a token.
      const token = jwt.sign({ id: user._id }, process.env.GOOGLE_CLIENT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Login successful', token });
    } else {
      // ➔ PATH B: New user! Send them back to React to pick a username.
      return res.status(200).json({
        requireUsername: true,
        email: email
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Google Auth Failed', error: err.message });
  }
})

// ROUTE 2: Complete the Google Registration
router.post('/google/complete', async (req, res) => {
  try {
    const { email, username } = req.body;

    // Check if the username they picked is already taken by someone else
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Save the new Google user to the database
    const newUser = await User.create({
      email,
      username,
      authProvider: 'google'
    });

    //  Issue their VIP wristband
    const token = jwt.sign({ id: newUser._id }, process.env.GOOGLE_CLIENT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Account created successfully', token });

  } catch (err) {
    res.status(500).json({ message: 'Error creating account', error: err.message });
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
router.post('/workspaces', async function (req, res, next) {
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

router.post('/workspaces/:id/ask', async function (req, res,) {
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

// 
router.post('/createnotebook', requireAuth, upload.array('documents', 10), async (req, res) => {
  try {
    // Extract the text fields from the request
    const { title, isPublic } = req.body;
    const authorId = req.user.id;

    // Format the uploaded files
    const processedDocuments = req.files.map(file => {
      return {
        fileName: file.originalname,
        fileUrl: "pending_cloud_url", // Placeholder until you attach cloud storage
        fileType: file.mimetype.split('/')[1], // e.g., 'pdf' or 'plain'
        rawText: file.mimetype.includes('text') ? file.buffer.toString('utf-8') : "Binary file data hidden for MVP."
      };
    });

    if (processedDocuments.length === 0) {
      return res.status(400).json({ message: "You must upload at least one document." });
    }

    // Generate the 2-Line AI Summary
    // We grab the text from the FIRST document to generate the overview
    const firstDocText = processedDocuments[0].rawText || "No readable text found in the first document.";

    const summaryPrompt = `
      You are an expert educational assistant. 
      Read the following excerpt from a document and write a maximum 2-line, highly concise summary of its core topic. 
      Do not use filler words like "This document is about". Just state the summary.
      
      Document Excerpt:
      ${firstDocText.substring(0, 3000)} // Limiting characters to save Gemini tokens
    `;

    const summaryResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: summaryPrompt,
    });

    const finalSummary = summaryResponse.text;

    // Save everything to MongoDB
    const newNotebook = await Notebook.create({
      title,
      author: authorId,
      isPublic: isPublic === 'true', // Convert string to boolean
      aiSummary: finalSummary,
      documents: processedDocuments
    });

    // Pull the full author data and format it exactly like the GET route
    const populatedNotebook = await Notebook.findById(newNotebook._id).populate('author', 'username');

    const formattedNotebook = {
      id: populatedNotebook._id,
      title: populatedNotebook.title,
      category: "General",
      sources: populatedNotebook.documents.length, 
      summary: populatedNotebook.aiSummary, 
      author: `@${populatedNotebook.author.username}`, // Shows username, not ID!
      likes: 0,
      createdAt: populatedNotebook.createdAt
    };

    // Send success response back to React
    res.status(201).json({
      message: 'Notebook created successfully!',
      notebook: formattedNotebook
    });

  } catch (error) {
    console.error("Notebook Creation Error:", error);
    res.status(500).json({ message: 'Failed to create notebook', error: error.message });
  }
});

// route to 
router.get('/createnotebook', async (req, res) => {
  try {
    // Grab anything that is Public, OR belongs to the specific logged-in user.
    const notebooks = await Notebook.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('author', 'username _id');

    // Format for the React frontend
    const formattedNotebooks = notebooks.map(nb => ({
      id: nb._id,
      title: nb.title,
      category: "General",
      sources: nb.documents.length,
      summary: nb.aiSummary,
      author: nb.author ? `@${nb.author.username}` : "@unknown",
      likes: nb.likes || 0,
      createdAt: nb.createdAt
    }));

    res.status(200).json({ notebooks: formattedNotebooks });

  } catch (error) {
    console.error("Error fetching notebooks:", error);
    res.status(500).json({ message: 'Error loading the notebook feed.' });
  }
});

// route for like notebook
router.post('/like/:id', requireAuth, async (req, res) => {
  try {
    // React will tell us if it wants to 'like' (+1) or 'unlike' (-1)
    const { action } = req.body; 
    const mathValue = action === 'unlike' ? -1 : 1;

    // Instantly find the notebook and do the math in one step
    const notebook = await Notebook.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: mathValue } },
      { new: true } // This returns the newly updated document
    );

    if (!notebook) return res.status(404).json({ message: 'Notebook not found' });
    
    // Send back the new total so React can update the UI
    res.status(200).json({ likes: notebook.likes});

  } catch (error) {
    res.status(500).json({ message: 'Error updating like status' });
  }
});

router.get('/my-notebooks', requireAuth, async (req, res) => {
  try {
    // Fetch only notebooks where the author is the logged-in user
    const notebooks = await Notebook.find({ author: req.user.id })
      .sort({ createdAt: -1 });

    const formattedNotebooks = notebooks.map(nb => ({
      id: nb._id,
      title: nb.title,
      summary: nb.aiSummary,
      isPublic: nb.isPublic, // Crucial for filtering
      likes: nb.likes || 0,
      createdAt: nb.createdAt
    }));

    res.status(200).json({ notebooks: formattedNotebooks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your notebooks' });
  }
});

// GET full details of a single notebook
router.get('/notebook/:id', async (req, res) => {
  try {
    const notebook = await Notebook.findById(req.params.id);
    if (!notebook) {
      return res.status(404).json({ message: 'Notebook not found' });
    }
    res.status(200).json({ notebook });
  } catch (error) {
    console.error("Error fetching single notebook:", error);
    res.status(500).json({ message: 'Error fetching notebook' });
  }
});

// Chat with a specific notebook
router.post('/notebook/:id/chat', requireAuth, async (req, res) => {
  try {
    console.log("BOOM! The backend received the chat request!");

    const { message } = req.body;
    
    // 1. Fetch the notebook to get the context
    const notebook = await Notebook.findById(req.params.id);
    if (!notebook) {
      return res.status(404).json({ message: 'Notebook not found' });
    }

    // 2. Build the strict prompt context
    const systemInstruction = `
      You are an expert, highly encouraging study tutor. 
      The user is currently studying a notebook with the content provided below. 
      
      Your Goal:
      1. Use the notebook content as the foundation and context for the conversation.
      2. If the user asks a question about these concepts, explain them deeply. Use your vast outside knowledge to provide helpful examples, analogies, and step-by-step breakdowns that aren't in the raw notes.
      3. If the user asks something completely unrelated to the general subject of these notes, politely bring the conversation back to the current study topic.
      
      NOTEBOOK CONTENT:
      ${notebook.aiSummary || "No summary available."}
    `;

    // 3. Combine the instructions and the user's question
    const prompt = `${systemInstruction}\n\nUser Question: ${message}`;

    // 4. Generate the response using the new SDK syntax
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    // 5. Send the text back to React
    res.status(200).json({ reply: response.text });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: 'Error processing chat request', error: error.message });
  }
});



module.exports = router;
