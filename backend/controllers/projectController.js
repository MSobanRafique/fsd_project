// Project Controller
// Person 2 - Backend Team
// Handles all project-related operations

const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query = {};
    
    // Filter by role
    if (req.user.role === 'project_manager') {
      // Project managers see projects where they are in the manager array
      query.manager = req.user._id;
    } else if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'site_worker') {
      // Get projects where user has tasks (assignedTo can be array now)
      const userTasks = await Task.find({ assignedTo: req.user._id }).distinct('project');
      query._id = { $in: userTasks };
    }

    const projects = await Project.find(query)
      .populate('manager', 'name email')
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('client', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization based on role
    if (req.user.role === 'project_manager') {
      // Project managers can only see projects they manage
      // Handle both array and single value (for backward compatibility)
      const managerIds = Array.isArray(project.manager) 
        ? project.manager.map(m => m._id ? m._id.toString() : m.toString())
        : [project.manager._id ? project.manager._id.toString() : project.manager.toString()];
      
      if (!managerIds.includes(req.user._id.toString())) {
        return res.status(403).json({ message: 'You do not have permission to view this project' });
      }
    } else if (req.user.role === 'client') {
      // Clients can only see projects where they are the client
      if (!project.client || project.client._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this project' });
      }
    } else if (req.user.role === 'site_worker') {
      // Site workers can only see projects where they have tasks (assignedTo can be array now)
      const userTasks = await Task.find({ assignedTo: req.user._id, project: project._id });
      if (userTasks.length === 0) {
        return res.status(403).json({ message: 'You do not have permission to view this project' });
      }
    }
    // Admins can see all projects

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin only)
exports.createProject = async (req, res) => {
  try {
    // Double-check authorization (authorize middleware should handle this, but extra safety)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: `Only admins can create projects. Your role: ${req.user.role}` 
      });
    }

    // Validate manager is provided
    if (!req.body.manager) {
      return res.status(400).json({ message: 'Project manager is required' });
    }

    // Ensure manager is an array
    const managerArray = Array.isArray(req.body.manager) 
      ? req.body.manager 
      : [req.body.manager];

    const project = await Project.create({
      ...req.body,
      manager: managerArray
    });

    const populatedProject = await Project.findById(project._id)
      .populate('manager', 'name email')
      .populate('client', 'name email');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Project Manager)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin') {
      // Handle both array and single value (for backward compatibility)
      const managerIds = Array.isArray(project.manager) 
        ? project.manager.map(m => m.toString())
        : [project.manager.toString()];
      
      if (!managerIds.includes(req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this project' });
      }
    }

    // Ensure manager is an array if provided
    if (req.body.manager && !Array.isArray(req.body.manager)) {
      req.body.manager = [req.body.manager];
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'name email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only admin can delete projects
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete projects' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

