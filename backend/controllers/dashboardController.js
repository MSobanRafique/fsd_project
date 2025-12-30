// Dashboard Controller
// Person 2 - Backend Team
// Provides dashboard statistics and analytics

const Project = require('../models/Project');
const Task = require('../models/Task');
const Expense = require('../models/Expense');
const Material = require('../models/Material');
const Notification = require('../models/Notification');

exports.getDashboardStats = async (req, res) => {
  try {
    let projectQuery = {};
    let taskQuery = {};

    // Filter by role
    if (req.user.role === 'project_manager') {
      projectQuery.manager = req.user._id;
      const projects = await Project.find({ manager: req.user._id }).distinct('_id');
      taskQuery.project = { $in: projects };
    } else if (req.user.role === 'site_worker') {
      const userTasks = await Task.find({ assignedTo: req.user._id }).distinct('project');
      projectQuery._id = { $in: userTasks };
      taskQuery.assignedTo = req.user._id;
    } else if (req.user.role === 'client') {
      projectQuery.client = req.user._id;
    }

    // Get projects
    const projects = await Project.find(projectQuery);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    
    // Get tasks
    const tasks = await Task.find(taskQuery);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    // Get expenses (only for projects user has access to)
    const projectIds = projects.map(p => p._id);
    const expenses = await Expense.find({ project: { $in: projectIds } });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    // Get materials with low stock
    const materials = await Material.find({ project: { $in: projectIds } });
    const lowStockMaterials = materials.filter(m => m.status === 'low_stock' || m.status === 'out_of_stock').length;
    
    // Get unread notifications
    const unreadNotifications = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    });

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: projects.filter(p => p.status === 'completed').length
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: tasks.filter(t => t.status === 'in_progress').length
      },
      budget: {
        total: totalBudget,
        spent: totalExpenses,
        remaining: totalBudget - totalExpenses
      },
      materials: {
        lowStock: lowStockMaterials,
        total: materials.length
      },
      notifications: {
        unread: unreadNotifications
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

