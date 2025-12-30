// Document Routes
// Backend Developer - Person 2

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getDocuments,
  getDocument,
  uploadDocument,
  deleteDocument,
  downloadDocument
} = require('../controllers/documentController');
const { auth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use absolute path for uploads directory
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.route('/')
  .get(auth, getDocuments)
  .post(auth, upload.single('file'), uploadDocument);

router.route('/:id')
  .get(auth, getDocument)
  .delete(auth, deleteDocument);

router.route('/:id/download')
  .get(auth, downloadDocument);

module.exports = router;

