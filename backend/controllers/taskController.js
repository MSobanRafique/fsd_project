// Task Controller
// Backend Developer - Person 2
// Manages task operations and progress tracking

const Task = require('../models/Task');
const Project = require('../models/Project');

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    
    // Filter tasks based on user role FIRST
    if (req.user.role === 'site_worker') {
      // Site workers see only tasks assigned to them (check if user is in assignedTo array)
      query.assignedTo = req.user._id;
      // If project query is provided, verify the task is assigned to this user
      if (req.query.project) {
        query.project = req.query.project;
      }
    } else if (req.user.role === 'project_manager') {
      // Project managers see only tasks assigned to them (check if user is in assignedTo array)
      query.assignedTo = req.user._id;
      // If project query is provided, verify the task is assigned to this manager
      if (req.query.project) {
        query.project = req.query.project;
      }
    } else if (req.user.role === 'client') {
      // Clients see tasks in projects where they are the client
      const projects = await Project.find({ client: req.user._id }).distinct('_id');
      if (projects.length > 0) {
        if (req.query.project) {
          // Verify the requested project belongs to this client
          if (projects.some(p => p.toString() === req.query.project)) {
            query.project = req.query.project;
          } else {
            query.project = { $in: [] };
          }
        } else {
          query.project = { $in: projects };
        }
      } else {
        query.project = { $in: [] };
      }
    } else if (req.user.role === 'admin') {
      // Admins see all tasks, but can filter by project if provided
      if (req.query.project) {
        query.project = req.query.project;
      }
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to view this task
    if (req.user.role === 'site_worker' || req.user.role === 'project_manager') {
      // Site workers and project managers can only see tasks assigned to them
      // Handle both array and single value (for backward compatibility)
      const assignedIds = Array.isArray(task.assignedTo) 
        ? task.assignedTo.map(u => u._id ? u._id.toString() : u.toString())
        : [task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo.toString()];
      
      if (!assignedIds.includes(req.user._id.toString())) {
        return res.status(403).json({ message: 'You do not have permission to view this task' });
      }
    } else if (req.user.role === 'client') {
      // Clients can only see tasks in their projects
      const project = await Project.findById(task.project._id);
      if (!project || project.client?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this task' });
      }
    }
    // Admins can see all tasks

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    // Ensure assignedTo is an array
    if (req.body.assignedTo && !Array.isArray(req.body.assignedTo)) {
      req.body.assignedTo = [req.body.assignedTo];
    }
    
    const task = await Task.create(req.body);
    
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role === 'site_worker' || req.user.role === 'project_manager') {
      // Site workers and project managers can only update tasks assigned to them
      // Handle both array and single value (for backward compatibility)
      const assignedIds = Array.isArray(task.assignedTo) 
        ? task.assignedTo.map(id => id.toString())
        : [task.assignedTo.toString()];
      
      if (!assignedIds.includes(req.user._id.toString())) {
        return res.status(403).json({ message: 'You do not have permission to update this task' });
      }
    } else if (req.user.role === 'client') {
      // Clients cannot update tasks
      return res.status(403).json({ message: 'You do not have permission to update tasks' });
    }
    // Admins can update any task

    // Update completion date if task is marked as completed
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = new Date();
      req.body.progress = 100;
    }

    // Ensure assignedTo is an array if provided
    if (req.body.assignedTo && !Array.isArray(req.body.assignedTo)) {
      req.body.assignedTo = [req.body.assignedTo];
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'name')
     .populate('assignedTo', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role === 'project_manager') {
      // Project managers can only delete tasks assigned to them
      // Handle both array and single value (for backward compatibility)
      const assignedIds = Array.isArray(task.assignedTo) 
        ? task.assignedTo.map(id => id.toString())
        : [task.assignedTo.toString()];
      
      if (!assignedIds.includes(req.user._id.toString())) {
        return res.status(403).json({ message: 'You do not have permission to delete this task' });
      }
    } else if (req.user.role === 'site_worker' || req.user.role === 'client') {
      // Site workers and clients cannot delete tasks
      return res.status(403).json({ message: 'You do not have permission to delete tasks' });
    }
    // Admins can delete any task

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

