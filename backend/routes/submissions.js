const express = require('express');
const {
  createSubmission,
  getSubmissionsByAssignment,
  getSubmission,
  updateSubmissionScore,
  getMySubmissions
} = require('../controllers/submissionController');
const { authenticateToken, requireStudent, requireInstructor } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Protected routes
router.get('/my', authenticateToken, requireStudent, getMySubmissions);
router.get('/assignment/:assignmentId', authenticateToken, getSubmissionsByAssignment);
router.get('/:id', authenticateToken, getSubmission);

// Student only routes
router.post('/', 
  authenticateToken, 
  requireStudent, 
  upload.single('file'), 
  handleUploadError, 
  createSubmission
);

// Instructor only routes
router.patch('/:id/score', authenticateToken, requireInstructor, updateSubmissionScore);

module.exports = router;
