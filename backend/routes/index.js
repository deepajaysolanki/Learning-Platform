var express = require('express');
var router = express.Router();
const workspaceModel = require('../models/workspace');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/Users');
const bcrypt = require('bcrypt');
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Notebook = require('../models/Notebook');
const requireAuth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const mammoth = require('mammoth');
const officeParser = require('officeparser');
// const { google } = require('googleapis');

// cloudinary setup 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
      model: 'gemini-3.5-flash',
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

// route to ..
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    }).end(fileBuffer);
  });
};

// route for create notebook
router.post('/createnotebook', requireAuth, upload.array('documents', 10), async (req, res) => {
  try {
    // Extract the text fields from the request
    const { title, isPublic } = req.body;
    const authorId = req.user.id;

    // Helper function to extract text based on file type
    const extractTextFromBuffer = async (file) => {
      const mime = file.mimetype;

      try {
        if (mime.includes('text') || mime.includes('json')) {
          return file.buffer.toString('utf-8');
        }

        // Extract HTML instead of Raw Text for Word Docs
        if (mime.includes('wordprocessingml.document') || file.originalname.endsWith('.docx')) {
          const result = await mammoth.convertToHtml({ buffer: file.buffer });
          return result.value; // This returns structured HTML strings like <h2>, <p>, <strong>
        }

        // Handle PowerPoint Presentations (.pptx)
        if (mime.includes('presentationml.presentation') || file.originalname.endsWith('.pptx')) {
          let extractedText = await officeParser.parseOffice(file.buffer);

          // Force the object into a string before it hits MongoDB or AI
          if (typeof extractedText !== 'string') {
            if (extractedText && typeof extractedText.toText === 'function') {
              extractedText = extractedText.toText(); // Uses the object's native text converter!
            } else {
              extractedText = JSON.stringify(extractedText); // Ultimate fallback
            }
          }

          return extractedText;
        }

        return "Binary file content stored in cloud.";
      } catch (parseError) {
        console.error(`Failed to parse text from ${file.originalname}:`, parseError);
        return `[Error extracting text from ${file.originalname}]`;
      }
    };

    // Use Promise.all to upload all files to Cloudinary in parallel
    const processedDocuments = await Promise.all(req.files.map(async (file) => {
      const fileUrl = await uploadToCloudinary(file.buffer);

      // Dynamically extract text based on the file type!
      const extractedText = await extractTextFromBuffer(file);

      return {
        fileName: file.originalname,
        fileUrl: fileUrl,
        fileType: file.mimetype.split('/')[1],
        rawText: extractedText // No longer a hardcoded placeholder string!
      };
    }));

    if (processedDocuments.length === 0) {
      return res.status(400).json({ message: "You must upload at least one document." });
    }

    // Generate the 2-Line AI Summary
    // We grab the text from the FIRST document to generate the overview
    let firstDocText = processedDocuments[0].rawText || "No readable text found in the first document.";

    // Force firstDocText to be a string so .substring() never crashes on PPTX objects
    if (typeof firstDocText !== 'string') {
      firstDocText = JSON.stringify(firstDocText);
    }

    const summaryPrompt = `
      You are an expert educational assistant. 
      Read the following excerpt from a document and write a maximum 2-line, highly concise summary of its core topic. 
      Do not use filler words like "This document is about". Just state the summary.
      
      Document Excerpt:
      ${firstDocText.substring(0, 6000)}
    `;

    // 🟢 HUGGING FACE ROUTE OVERHAUL
    const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are an advanced academic assistant. Your task is to generate highly accurate, clear, and structured study summaries."
          },
          {
            role: "user",
            content: summaryPrompt
          }
        ],
        max_tokens: 150, // Reduced since your prompt specifically asks for a maximum 2-line summary
        temperature: 0.3  // Lower temperature makes it focus heavily on strict facts
      })
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("🔴 HF Summary Generation Error:", errorText);
      throw new Error("Hugging Face summary generation failed");
    }

    const data = await hfResponse.json();

    // 🟢 FIXED: Extract response text into our summary variable
    const aiSummary = data.choices[0].message.content;
    console.log("🟢 Hugging Face Summary Generated Successfully!");

    // Save everything to MongoDB
    const newNotebook = await Notebook.create({
      title,
      author: authorId,
      isPublic: isPublic === 'true', // Convert string to boolean
      aiSummary: aiSummary,          // 🟢 FIXED: Changed from finalSummary to aiSummary
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
    res.status(200).json({ likes: notebook.likes });

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
router.post('/notebook/:id/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) return res.status(404).json({ error: "Notebook not found" });

    // Build the context for the AI
    const context = notebook.documents && notebook.documents.length > 0
      ? notebook.documents.map(d => d.rawText).join('\n')
      : (notebook.summary || notebook.aiSummary || "No context available.");

    const systemPrompt = `You are an expert AI Tutor helping a student study their notebook titled "${notebook.title}". 
    Use the following study material context to answer their question accurately:
    
    CONTEXT:
    ${context.substring(0, 5000)} /* Truncate if necessary to save tokens */`;

    // Hit the Hugging Face Router
    const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 800,
        temperature: 0.5 // Lower temperature for more accurate, factual tutor answers
      })
    });

    if (!hfResponse.ok) {
      throw new Error("Hugging Face API failed");
    }

    const data = await hfResponse.json();
    const reply = data.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// route for audio feature

router.post('/generate-script', async (req, res) => {
  console.log("🟢 1. API HIT: /generate-script started!");

  try {
    const { notebookId, customPrompt } = req.body;

    if (!notebookId) {
      return res.status(400).json({ error: "Missing notebookId" });
    }

    const notebook = await Notebook.findById(notebookId);
    if (!notebook) {
      return res.status(404).json({ error: "Notebook not found" });
    }

    console.log("🟢 4. Notebook found! Sending prompt to Hugging Face...");

    const prompt = customPrompt
      ? `Write a short, engaging audio script that directly answers this specific question: "${customPrompt}". Base your explanation entirely on the following study material. 
      
      CRITICAL INSTRUCTIONS FOR TEXT-TO-SPEECH:
      - Write ONLY the exact words that will be spoken out loud.
      - DO NOT include speaker labels (like "Host:").
      - DO NOT include sound effects, music cues, or stage directions in brackets (like [Intro music]).
      - DO NOT use markdown formatting like asterisks or bold text.
      - Keep it conversational and continuous.
      
      STUDY MATERIAL:\n${notebook.documents[0].rawText}`

      : `Turn this study material into a friendly, 60-second conversational podcast script that explains the core concepts simply. 
      
      CRITICAL INSTRUCTIONS FOR TEXT-TO-SPEECH:
      - Write ONLY the exact words that will be spoken out loud.
      - DO NOT include speaker labels (like "Host:").
      - DO NOT include sound effects, music cues, or stage directions in brackets (like [Intro music]).
      - DO NOT use markdown formatting like asterisks or bold text.
      - Keep it conversational and continuous.
      
      STUDY MATERIAL:\n${notebook.documents[0].rawText}`;

    // Using Hugging Face's OpenAI-compatible router endpoint
    const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct", // A fast, excellent model for script writing
        messages: [
          { role: "system", content: "You are a friendly podcast host summarizing study materials." },
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("🔴 HF API Error:", errorText);
      throw new Error("Hugging Face API failed");
    }

    const data = await hfResponse.json();
    const script = data.choices[0].message.content;

    console.log("🟢 5. Hugging Face generated the script successfully!");
    res.status(200).json({ script });

  } catch (error) {
    console.error("🔴 6. CATCH BLOCK ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// route for 
router.post('/get-videos', async (req, res) => {
  try {
    const { query } = req.body;
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Using native fetch to bypass the bulky Google SDK
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=6&videoEmbeddable=true&key=${apiKey}`;

    const response = await fetch(youtubeUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error("🔴 YouTube API Error:", data.error.message);
      return res.status(401).json({ error: data.error.message });
    }

    console.log("🟢 YouTube videos found successfully!");
    res.json({ videos: data.items });
 
  } catch (error) {
    console.error("YouTube API Error:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

module.exports = router;
