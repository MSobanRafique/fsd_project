// Material Controller
// Person 2 - Backend Developer
// Handles material management operations

const Material = require('../models/Material');
const Project = require('../models/Project');

exports.getMaterials = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by role - managers only see materials from their projects
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
      // Site workers see materials from projects where they have tasks
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
    // Admins see all materials

    const materials = await Material.find(query)
      .populate('project', 'name manager')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('project', 'name manager client');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check authorization
    if (req.user.role === 'project_manager') {
      // Project managers can only see materials from their projects
      if (material.project.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this material' });
      }
    } else if (req.user.role === 'client') {
      // Clients can only see materials from their projects
      if (!material.project.client || material.project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this material' });
      }
    } else if (req.user.role === 'site_worker') {
      // Site workers can only see materials from projects where they have tasks
      const Task = require('../models/Task');
      const userTask = await Task.findOne({ assignedTo: req.user._id, project: material.project._id });
      if (!userTask) {
        return res.status(403).json({ message: 'You do not have permission to view this material' });
      }
    }
    // Admins can see all materials

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const material = await Material.create({
      ...req.body,
      approvalStatus: req.body.approvalStatus || 'pending'
    });
    
    const populatedMaterial = await Material.findById(material._id)
      .populate('project', 'name');

    res.status(201).json(populatedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('project', 'manager');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check authorization
    if (req.user.role === 'project_manager') {
      // Project managers can update materials in projects they manage
      if (material.project.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to update this material' });
      }
    } else if (req.user.role === 'site_worker') {
      // Site workers can update materials in projects where they have tasks
      const Task = require('../models/Task');
      const userTask = await Task.findOne({ assignedTo: req.user._id, project: material.project._id });
      if (!userTask) {
        return res.status(403).json({ message: 'You do not have permission to update this material. You must have tasks in this project.' });
      }
    } else if (req.user.role !== 'admin') {
      // Only admins, project managers, and site workers can update materials
      return res.status(403).json({ message: 'You do not have permission to update materials' });
    }

    // Check for low stock
    if (req.body.quantity !== undefined) {
      if (req.body.quantity <= material.minThreshold) {
        req.body.status = req.body.quantity === 0 ? 'out_of_stock' : 'low_stock';
      } else if (req.body.quantity > material.minThreshold) {
        req.body.status = 'available';
      }
    }

    const updatedMaterial = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'name');

    res.json(updatedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a material request
// @route   PUT /api/materials/:id/approve
// @access  Private (Admin, Project Manager)
exports.approveMaterial = async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'approvalStatus must be approved or rejected' });
    }

    const material = await Material.findById(req.params.id).populate('project', 'manager');
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (req.user.role === 'project_manager' && material.project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to approve this material' });
    }
    if (!['admin', 'project_manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to approve materials' });
    }

    material.approvalStatus = approvalStatus;
    material.approvedBy = req.user._id;
    material.approvedAt = new Date();
    await material.save();

    const populatedMaterial = await Material.findById(material._id)
      .populate('project', 'name manager')
      .populate('approvedBy', 'name email');

    res.json(populatedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('project', 'manager');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check authorization - only manager of the project can delete
    if (req.user.role === 'project_manager') {
      if (material.project.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to delete this material' });
      }
    } else if (req.user.role !== 'admin') {
      // Only admins and project managers can delete materials
      return res.status(403).json({ message: 'You do not have permission to delete materials' });
    }

    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

