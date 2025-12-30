// Material Routes
// Backend Developer - Person 2

const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  approveMaterial
} = require('../controllers/materialController');
const { auth, authorize } = require('../middleware/auth');

router.route('/')
  .get(auth, getMaterials)
  .post(auth, createMaterial);

router.route('/:id')
  .get(auth, getMaterial)
  .put(auth, updateMaterial)
  .delete(auth, deleteMaterial);

router.route('/:id/approve')
  .put(auth, authorize('admin', 'project_manager'), approveMaterial);

module.exports = router;

