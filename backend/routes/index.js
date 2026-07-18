var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); 
const User = require('../models/users');
const bcrypt = require('bcrypt');
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Notebook = require('../models/notebook');
const requireAuth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const mammoth = require('mammoth');
const officeParser = require('officeparser');
const Message = require('../models/message');

// cloudinary setup 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function fixOldNotebookLikes() {
  try {
    
    // Find notebooks where likes is not an array (e.g. a number or undefined)
    const notebooks = await Notebook.find({});
    for (let nb of notebooks) {
      if (!Array.isArray(nb.likes)) {
        nb.likes = []; // Reset to clean array
        await nb.save();
      }
    }
    console.log("🟢 All old notebook likes converted to arrays!");
  } catch (err) {
    console.error("Migration error:", err);
  }
}
fixOldNotebookLikes();

// -------------------------------------
router.get('/', function (req, res, next) {
  res.send('Welcome to the VibeStudy backend!');
});

// route for registration
router.post('/register', async function (req, res) {
  try {
    const { fullName, username, email, password } = req.body;

    const existingUserEmail = await User.findOne({ "email": email });
    if (existingUserEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingUserName = await User.findOne({ "username": username });
    if (existingUserName) {
      return res.status(400).json({ message: 'User with this username already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({ fullName: fullName || "", username, email, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    return res.status(500).json({ message: `Error creating user error: ${err.message}` });
  }
});

// route for login
router.post('/login', async function (req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

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

router.post('/google', async function (req, res) {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email } = payload;

    let user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.GOOGLE_CLIENT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Login successful', token });
    } else {
      return res.status(200).json({
        requireUsername: true,
        email: email
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Google Auth Failed', error: err.message });
  }
});

router.post('/google/complete', async (req, res) => {
  try {
    const { email, username } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const newUser = await User.create({
      email,
      username,
      authProvider: 'google'
    });

    const token = jwt.sign({ id: newUser._id }, process.env.GOOGLE_CLIENT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Account created successfully', token });

  } catch (err) {
    res.status(500).json({ message: 'Error creating account', error: err.message });
  }
});


// helper to upload binary to Cloudinary directly
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
    const { title, isPublic } = req.body;
    const authorId = req.user.id;

    const extractTextFromBuffer = async (file) => {
      const mime = file.mimetype;

      try {
        if (mime.includes('text') || mime.includes('json')) {
          return file.buffer.toString('utf-8');
        }

        if (mime.includes('wordprocessingml.document') || file.originalname.endsWith('.docx')) {
          const result = await mammoth.convertToHtml({ buffer: file.buffer });
          return result.value;
        }

        if (mime.includes('presentationml.presentation') || file.originalname.endsWith('.pptx') || file.originalname.endsWith('.ppt')) {
          let extractedText = await officeParser.parseOffice(file.buffer);

          if (typeof extractedText !== 'string') {
            if (extractedText && typeof extractedText.toText === 'function') {
              extractedText = extractedText.toText();
            } else {
              extractedText = JSON.stringify(extractedText);
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

    const processedDocuments = await Promise.all(req.files.map(async (file) => {
      const fileUrl = await uploadToCloudinary(file.buffer);
      const extractedText = await extractTextFromBuffer(file);

      return {
        fileName: file.originalname,
        fileUrl: fileUrl,
        fileType: file.mimetype.split('/')[1] || 'raw',
        rawText: extractedText
      };
    }));

    if (processedDocuments.length === 0) {
      return res.status(400).json({ message: "You must upload at least one document." });
    }

    let firstDocText = processedDocuments[0].rawText || "No readable text found in the first document.";

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
        max_tokens: 150,
        temperature: 0.3
      })
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("🔴 HF Summary Generation Error:", errorText);
      throw new Error("Hugging Face summary generation failed");
    }

    const data = await hfResponse.json();
    const aiSummary = data.choices[0].message.content;

    const newNotebook = await Notebook.create({
      title,
      author: authorId,
      isPublic: isPublic === 'true',
      aiSummary: aiSummary,
      documents: processedDocuments
    });

    const populatedNotebook = await Notebook.findById(newNotebook._id).populate('author', 'username');

    const formattedNotebook = {
      id: populatedNotebook._id,
      title: populatedNotebook.title,
      category: "General",
      sources: populatedNotebook.documents.length,
      summary: populatedNotebook.aiSummary,
      author: `@${populatedNotebook.author.username}`,
      likes: 0,
      createdAt: populatedNotebook.createdAt
    };

    res.status(201).json({
      message: 'Notebook created successfully!',
      notebook: formattedNotebook
    });

  } catch (error) {
    console.error("Notebook Creation Error:", error);
    res.status(500).json({ message: 'Failed to create notebook', error: error.message });
  }
});

router.get('/createnotebook', async (req, res) => {
  try {
    let currentUserId = null;
    let userSavedIds = [];

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.GOOGLE_CLIENT_SECRET);
        currentUserId = decoded.id;

        const currentUser = await User.findById(currentUserId).select('savedNotebooks');
        if (currentUser && currentUser.savedNotebooks) {
          userSavedIds = currentUser.savedNotebooks.map(id => id.toString());
        }
      } catch (e) {
        // Token expired or guest
      }
    }

    // 🟢 Fetch notebooks (or remove { isPublic: true } temporarily to test!)
    const notebooks = await Notebook.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('author', 'username _id');

    const formattedNotebooks = notebooks.map(nb => {
      const likesArray = Array.isArray(nb.likes) ? nb.likes : [];
      const isLikedByMe = currentUserId 
        ? likesArray.some(userId => userId.toString() === currentUserId.toString())
        : false;
      const isSavedByMe = currentUserId ? userSavedIds.includes(nb._id.toString()) : false;

      return {
        id: nb._id,
        title: nb.title,
        category: "General",
        sources: nb.documents ? nb.documents.length : 0,
        summary: nb.aiSummary,
        author: nb.author ? `@${nb.author.username}` : "@unknown",
        likes: likesArray.length,
        isLiked: isLikedByMe,
        isSaved: isSavedByMe,
        createdAt: nb.createdAt
      };
    });

    res.status(200).json({ notebooks: formattedNotebooks });

  } catch (error) {
    console.error("Error fetching notebooks:", error);
    res.status(500).json({ message: 'Error loading the notebook feed.' });
  }
});

// Smart Like Route (Max 1 like per user)
router.post('/like/:id', requireAuth, async (req, res) => {
  try {
    const notebookId = req.params.id;
    const userId = req.user.id; // Extracted from requireAuth middleware

    const notebook = await Notebook.findById(notebookId);
    if (!notebook) {
      return res.status(404).json({ message: 'Notebook not found' });
    }

    // Check if user has already liked this notebook
    const likesArray = Array.isArray(notebook.likes) ? notebook.likes : [];
    const hasLiked = likesArray.some(id => id.toString() === userId.toString());

    let updatedNotebook;
    if (hasLiked) {
      // User already liked it -> UNLIKE (Remove User ID from array)
      updatedNotebook = await Notebook.findByIdAndUpdate(
        notebookId,
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      // User hasn't liked it -> LIKE (Add User ID safely using $addToSet)
      updatedNotebook = await Notebook.findByIdAndUpdate(
        notebookId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    }

    const newLikesCount = updatedNotebook.likes ? updatedNotebook.likes.length : 0;

    // Send back both total count and the updated like state for the current user
    res.status(200).json({
      likes: newLikesCount,
      isLiked: !hasLiked
    });

  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: 'Error updating like status' });
  }
});

router.get('/my-notebooks', requireAuth, async (req, res) => {
  try {
    const notebooks = await Notebook.find({ author: req.user.id })
      .sort({ createdAt: -1 });

    const formattedNotebooks = notebooks.map(nb => {
      const likesArray = Array.isArray(nb.likes) ? nb.likes : [];
      return {
        id: nb._id,
        _id: nb._id,
        title: nb.title,
        summary: nb.aiSummary,
        isPublic: nb.isPublic,
        likes: likesArray.length,
        isLiked: likesArray.some(uId => uId.toString() === req.user.id.toString()), // 🟢 Sends user's like state
        createdAt: nb.createdAt
      };
    });

    res.status(200).json({ notebooks: formattedNotebooks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your notebooks' });
  }
});

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

router.post('/notebook/:id/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) return res.status(404).json({ error: "Notebook not found" });

    const context = notebook.documents && notebook.documents.length > 0
      ? notebook.documents.map(d => d.rawText).join('\n')
      : (notebook.summary || notebook.aiSummary || "No context available.");

    const systemPrompt = `You are an expert AI Tutor helping a student study their notebook titled "${notebook.title}". 
    Use the following study material context to answer their question accurately:
    
    CONTEXT:
    ${context.substring(0, 5000)}`;

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
        temperature: 0.5
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

    const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
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

router.post('/get-videos', async (req, res) => {
  try {
    const { query } = req.body;
    const apiKey = process.env.YOUTUBE_API_KEY;

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

router.post('/notebook/:id/quiz', async (req, res) => {
  try {
    const notebookId = req.body.notebookId || req.params.id;

    if (!notebookId) return res.status(400).json({ error: "Missing notebookId" });

    const notebook = await Notebook.findById(notebookId);
    if (!notebook || !notebook.documents || notebook.documents.length === 0) {
      return res.status(404).json({ error: "Notebook or documents not found" });
    }

    const rawText = notebook.documents[0]?.rawText;
    const documentText = typeof rawText === "string"
      ? rawText.substring(0, 6000)
      : JSON.stringify(rawText || "No readable text found in the notebook.");

    const prompt = `
      You are a strict educational assessor. Generate a 10-question multiple-choice quiz based EXCLUSIVELY on the provided document text.
      DO NOT use any outside knowledge. If a fact is not in the text, do not ask about it.

      CRITICAL INSTRUCTIONS:
      - Return ONLY a valid JSON array.
      - Do not include markdown blocks like \`\`\`json.
      - Do not include any conversational text like "Here is your quiz".
      - Use this EXACT structure:
      [
        {
          "question": "What is...?",
          "options": ["A", "B", "C", "D"],
          "answerOption": "B",
          "answer":"This is a..."
        }
      ]

      DOCUMENT TEXT:
      ${documentText}
    `;

    const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", content: "You output only raw, valid JSON arrays. No extra text." },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.1
      })
    });

    if (!hfResponse.ok) throw new Error("Failed to fetch from Hugging Face");

    const data = await hfResponse.json();
    let aiText = data?.choices?.[0]?.message?.content?.trim() || "";

    aiText = aiText.replace(/```json/gi, "").replace(/```/gi, "").trim();

    const match = aiText.match(/\[[\s\S]*\]/);
    const cleanText = match ? match[0] : aiText;
    const quizData = JSON.parse(cleanText);

    res.json({ quiz: Array.isArray(quizData) ? quizData : [] });

  } catch (error) {
    console.error("🔴 Quiz Generation Error:", error.message);
    res.status(500).json({ error: "Could not generate quiz. Ensure text is readable." });
  }
});

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user); // Now includes role: "admin" or "user"
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { username, fullName, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, fullName, bio },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);

  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        message: `That ${field} is already taken. Please choose another one.`
      });
    }

    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

router.put('/profile/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user.password) {
      return res.status(400).json({ message: "Your account is managed by Google. No password to change." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating password" });
  }
});

router.delete('/notebook/:id', requireAuth, async (req, res) => {
  try {
    const notebookId = req.params.id;

    const deletedNotebook = await Notebook.findOneAndDelete({
      _id: notebookId,
      userId: req.user.id
    });

    if (!deletedNotebook) {
      return res.status(404).json({
        message: "Notebook not found or you do not have permission to delete it."
      });
    }

    res.json({ message: "Notebook deleted successfully!" });

  } catch (err) {
    console.error("Error deleting notebook:", err);
    res.status(500).json({ message: "Server error while deleting notebook" });
  }
});

router.get("/public-notebooks", async (req, res) => {
  try {
    const publicNotebooks = await Notebook.find({ isPublic: true })
      .populate("author", "username")
      .limit(10)
      .sort({ createdAt: -1 });

    res.status(200).json(publicNotebooks);
  } catch (error) {
    console.error("Error fetching homepage public notebooks:", error);
    res.status(500).json({ message: "Server error gathering public collections." });
  }
});

// 🟢 ROUTE 1: Toggle Save / Unsave Notebook
router.post('/save-notebook/:id', requireAuth, async (req, res) => {
  try {
    const notebookId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Safely check if notebook is already saved
    const savedArray = Array.isArray(user.savedNotebooks) ? user.savedNotebooks : [];
    const isSaved = savedArray.some(id => id.toString() === notebookId.toString());

    let updatedUser;
    if (isSaved) {
      // UNSAVE: Remove notebook ID from user's saved array
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { savedNotebooks: notebookId } },
        { new: true }
      );
    } else {
      // SAVE: Add notebook ID to user's saved array
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedNotebooks: notebookId } },
        { new: true }
      );
    }

    res.status(200).json({
      message: isSaved ? "Notebook removed from saved list" : "Notebook saved successfully!",
      isSaved: !isSaved
    });

  } catch (error) {
    console.error("Error toggling saved notebook:", error);
    res.status(500).json({ message: "Error updating saved status" });
  }
});

// 🟢 ROUTE 2: Fetch Saved Notebooks for Dashboard
// GET Saved Notebooks for User Dashboard
router.get('/saved-notebooks', requireAuth, async (req, res) => {
  try {
    // Populate full notebook data and author username
    const user = await User.findById(req.user.id).populate({
      path: 'savedNotebooks',
      populate: { path: 'author', select: 'username' }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const formattedNotebooks = (user.savedNotebooks || [])
      .filter(nb => nb !== null) // Filter out any deleted notebooks
      .map(nb => {
        const likesArray = Array.isArray(nb.likes) ? nb.likes : [];
        return {
          id: nb._id,
          title: nb.title,
          summary: nb.aiSummary,
          author: nb.author ? `@${nb.author.username}` : "@unknown",
          likes: likesArray.length,
          isLiked: likesArray.some(uId => uId.toString() === req.user.id.toString()),
          isSaved: true,
          createdAt: nb.createdAt
        };
      });

    res.status(200).json({ savedNotebooks: formattedNotebooks });

  } catch (error) {
    console.error("Error fetching saved notebooks:", error);
    res.status(500).json({ message: "Error loading saved notebooks." });
  }
});

// POST /contact - Single field contact endpoint
router.post('/contact', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    let senderName = "Guest User";
    let senderEmail = "Not Logged In";

    // 🟢 Extract user details automatically if token is provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.GOOGLE_CLIENT_SECRET);
        const user = await User.findById(decoded.id).select('username email');
        if (user) {
          senderName = user.username;
          senderEmail = user.email;
        }
      } catch (err) {
        // Token invalid/expired - continue as Guest
      }
    }

    // Save message to DB
    await Message.create({
      name: senderName,
      email: senderEmail,
      subject: "Footer Quick Message",
      message: message.trim(),
    });

    res.status(200).json({ message: "Message sent to admin!" });
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
});

module.exports = router;