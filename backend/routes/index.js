var express = require('express');
var router = express.Router();
const workspaceModel = require('../models/workspace');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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

module.exports = router;
