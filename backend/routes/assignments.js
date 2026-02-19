const express = require('express');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getMyAssignments
} = require('../controllers/assignmentController');
const { authenticateToken, requireInstructor } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAssignments);
router.get('/:id', getAssignment);

// Protected routes
router.get('/my/assignments', authenticateToken, requireInstructor, getMyAssignments);

// Instructor only routes
router.post('/', authenticateToken, requireInstructor, createAssignment);
router.put('/:id', authenticateToken, requireInstructor, updateAssignment);
router.delete('/:id', authenticateToken, requireInstructor, deleteAssignment);

module.exports = router;
