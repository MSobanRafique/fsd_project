// Task Routes
// Person 2 - Backend Developer

const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { auth, authorize } = require('../middleware/auth');

router.route('/')
  .get(auth, getTasks)
  .post(auth, authorize('admin', 'project_manager'), createTask);

router.route('/:id')
  .get(auth, getTask)
  .put(auth, updateTask)
  .delete(auth, authorize('admin', 'project_manager'), deleteTask);

module.exports = router;

