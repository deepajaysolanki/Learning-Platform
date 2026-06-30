var express = require('express');
var router = express.Router();
const workspaceModel = require('../models/workspace');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// -------------------------------------
router.get('/', function (req, res, next) {
  res.send('Welcome to the Workspace API');
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
router.post('/api/workspaces/:id/ask', async function (req, res, ) {
  try{
    const workspaceId = req.params.id;
    const userQuestion = req.body.question;

    // find the workspace in database
    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace|| workspace.sources.length === 0) {
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

  }catch(err){
    res.status(500).json({ message: 'Error processing request', error: err.message })
  }
})
module.exports = router;
