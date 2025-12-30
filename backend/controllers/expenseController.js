// Expense Controller
// Backend Team - Person 2
// Manages expense tracking and reporting

const Expense = require('../models/Expense');
const Project = require('../models/Project');

exports.getExpenses = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by role - managers only see expenses from their projects
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
      // Site workers see expenses from projects where they have tasks
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
    // Admins see all expenses

    const expenses = await Expense.find(query)
      .populate('project', 'name budget manager')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('project', 'name budget manager client')
      .populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check authorization
    if (req.user.role === 'project_manager') {
      // Project managers can only see expenses from their projects
      if (expense.project.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this expense' });
      }
    } else if (req.user.role === 'client') {
      // Clients can only see expenses from their projects
      if (!expense.project.client || expense.project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to view this expense' });
      }
    } else if (req.user.role === 'site_worker') {
      // Site workers can only see expenses from projects where they have tasks
      const Task = require('../models/Task');
      const userTask = await Task.findOne({ assignedTo: req.user._id, project: expense.project._id });
      if (!userTask) {
        return res.status(403).json({ message: 'You do not have permission to view this expense' });
      }
    }
    // Admins can see all expenses

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user._id,
      status: req.body.status || 'pending'
    });
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('project', 'name budget')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('project', 'manager');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check authorization - only manager of the project can update
    if (req.user.role === 'project_manager') {
      if (expense.project.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to update this expense' });
      }
    } else if (req.user.role !== 'admin') {
      // Only admins and project managers can update expenses
      return res.status(403).json({ message: 'You do not have permission to update expenses' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'name budget')
     .populate('createdBy', 'name email');

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject an expense
// @route   PUT /api/expenses/:id/approve
// @access  Private (Admin, Project Manager)
exports.approveExpense = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const expense = await Expense.findById(req.params.id).populate('project', 'manager');
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only admins or the manager of the project can approve/reject
    if (req.user.role === 'project_manager' && expense.project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to approve this expense' });
    }
    if (!['admin', 'project_manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to approve expenses' });
    }

    expense.status = status;
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('project', 'name budget manager')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    res.json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('project', 'manager');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check authorization - only manager of the project can delete
    if (req.user.role === 'project_manager') {
      if (expense.project.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You do not have permission to delete this expense' });
      }
    } else if (req.user.role !== 'admin') {
      // Only admins and project managers can delete expenses
      return res.status(403).json({ message: 'You do not have permission to delete expenses' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get expense summary for a project
exports.getExpenseSummary = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    const expenses = await Expense.find({ project: projectId });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({
      totalExpenses,
      count: expenses.length,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

