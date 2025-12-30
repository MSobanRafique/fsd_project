// Project Routes
// Backend Team - Person 2

const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { auth, authorize } = require('../middleware/auth');

router.route('/')
  .get(auth, getProjects)
  .post(auth, authorize('admin'), createProject);

router.route('/:id')
  .get(auth, getProject)
  .put(auth, authorize('admin', 'project_manager'), updateProject)
  .delete(auth, authorize('admin'), deleteProject);

module.exports = router;

