// Document Controller
// Person 2 - Backend Developer
// Handles file uploads and document management

const Document = require('../models/Document');
const Project = require('../models/Project');
const path = require('path');
const fs = require('fs');

// Helper function to resolve file path (handles both local and Vercel)
const resolveFilePath = (filepath) => {
  if (path.isAbsolute(filepath)) {
    return filepath;
  }
  // For Vercel, files are in /tmp/uploads
  if (process.env.VERCEL) {
    return path.join('/tmp', filepath.replace(/^uploads[\/\\]/, 'uploads/'));
  }
  // For local, files are in ./uploads
  return path.join(__dirname, '..', filepath);
};

exports.getDocuments = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by role - managers only see documents from their projects
    if (req.user.role === 'project_manager') {
      const projects = await Project.find({ manager: req.user._id }).distinct('_id');
      if (projects.length > 0) {
        // If specific project is requested, verify it belongs to this manager
        if (req.query.project) {
          if (!projects.some(p => p.toString() === req.query.project)) {
            // Project doesn't belong to this manager, return empty
            query.project = { $in: [] };
          } else {
            query.project = req.query.project;
          }
        } else {
          query.project = { $in: projects };
        }
      } else {
        // If no projects, return empty array
        query.project = { $in: [] };
      }
    } else if (req.user.role === 'client') {
      const projects = await Project.find({ client: req.user._id }).distinct('_id');
      if (projects.length > 0) {
        if (req.query.project) {
          if (!projects.some(p => p.toString() === req.query.project)) {
            query.project = { $in: [] };
          } else {
            query.project = req.query.project;
          }
        } else {
          query.project = { $in: projects };
        }
      } else {
        query.project = { $in: [] };
      }
    } else if (req.user.role === 'site_worker') {
      // Site workers see documents from projects where they have tasks
      const Task = require('../models/Task');
      const userTasks = await Task.find({ assignedTo: req.user._id }).distinct('project');
      if (userTasks.length > 0) {
        if (req.query.project) {
          if (!userTasks.some(p => p.toString() === req.query.project)) {
            query.project = { $in: [] };
          } else {
            query.project = req.query.project;
          }
        } else {
          query.project = { $in: userTasks };
        }
      } else {
        query.project = { $in: [] };
      }
    } else if (req.query.project) {
      // Admins can filter by project if provided
      query.project = req.query.project;
    }
    // Admins see all documents

    const documents = await Document.find(query)
      .populate('project', 'name manager')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('project', 'name manager client')
      .populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization
    if (req.user.role === 'project_manager') {
      // Project managers can only see documents from their projects
      if (document.project.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this document' });
      }
    } else if (req.user.role === 'client') {
      // Clients can only see documents from their projects
      if (!document.project.client || document.project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this document' });
      }
    } else if (req.user.role === 'site_worker') {
      // Site workers can only see documents from projects where they have tasks
      const Task = require('../models/Task');
      const userTask = await Task.findOne({ assignedTo: req.user._id, project: document.project._id });
      if (!userTask) {
        return res.status(403).json({ message: 'You do not have permission to view this document' });
      }
    }
    // Admins can see all documents

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.body.project) {
      return res.status(400).json({ message: 'Project is required' });
    }

    const document = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filepath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      project: req.body.project,
      uploadedBy: req.user._id,
      category: req.body.category || 'other',
      description: req.body.description || ''
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('project', 'name')
      .populate('uploadedBy', 'name email');

    res.status(201).json(populatedDocument);
  } catch (error) {
    console.error('Document upload error:', error);
    // If file was uploaded but document creation failed, try to delete the file
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    res.status(500).json({ 
      message: error.message || 'Failed to upload document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('project', 'manager');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization - only manager of the project can delete
    if (req.user.role === 'project_manager') {
      if (document.project.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to delete this document' });
      }
    } else if (req.user.role !== 'admin') {
      // Only admins and project managers can delete documents
      return res.status(403).json({ message: 'You do not have permission to delete documents' });
    }

    // Delete file from filesystem
    const absolutePath = resolveFilePath(document.filepath);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.filepath) {
      return res.status(404).json({ message: 'File path not found' });
    }

    // Resolve absolute path - filepath is stored as 'uploads/filename'
    const absolutePath = resolveFilePath(document.filepath);

    if (!fs.existsSync(absolutePath)) {
      console.error('File not found at path:', absolutePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Use res.download which handles headers and file streaming properly
    res.download(absolutePath, document.originalName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

