const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../utils/errorHandler');
const { extractTextFromPDF, cleanText } = require('../services/pdfService');
const { detectPlagiarism } = require('../services/plagiarismService');
const { generateFeedback } = require('../services/aiFeedbackService');

const prisma = new PrismaClient();

// Create Submission (Student only)
const createSubmission = [
  // Validation
  body('assignmentId').isUUID().withMessage('Valid assignment ID required'),
  body('content').optional().isLength({ min: 10, max: 10000 }).withMessage('Content must be 10-10000 characters'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { assignmentId, content } = req.body;
    const userId = req.user.id;

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return res.status(404).json({
        error: 'Assignment not found',
        message: 'The requested assignment does not exist'
      });
    }

    // Check if user already submitted this assignment
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: userId
      }
    });

    if (existingSubmission) {
      return res.status(400).json({
        error: 'Duplicate submission',
        message: 'You have already submitted this assignment'
      });
    }

    let submissionContent = content;
    let fileUrl = null;

    // Handle file upload if present
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      
      // Extract text from PDF if no content provided
      if (!content) {
        try {
          const extractedText = await extractTextFromPDF(req.file.path);
          submissionContent = cleanText(extractedText);
        } catch (error) {
          return res.status(400).json({
            error: 'PDF processing failed',
            message: 'Could not extract text from the PDF file'
          });
        }
      }
    }

    // Ensure we have content
    if (!submissionContent || submissionContent.trim().length < 10) {
      return res.status(400).json({
        error: 'Invalid submission',
        message: 'Submission must contain at least 10 characters of text'
      });
    }

    // Create submission with PENDING status
    const submission = await prisma.submission.create({
      data: {
        content: submissionContent,
        fileUrl,
        assignmentId,
        studentId: userId,
        status: 'PENDING'
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Process submission asynchronously (plagiarism detection and AI feedback)
    processSubmissionAsync(submission.id, submissionContent, assignmentId);

    res.status(201).json({
      message: 'Submission created successfully. Processing evaluation...',
      submission: {
        id: submission.id,
        content: submission.content,
        fileUrl: submission.fileUrl,
        status: submission.status,
        assignment: submission.assignment,
        createdAt: submission.createdAt
      }
    });
  })
];

// Async function to process submission (plagiarism + AI feedback)
const processSubmissionAsync = async (submissionId, content, assignmentId) => {
  try {
    // Get all previous submissions for this assignment
    const previousSubmissions = await prisma.submission.findMany({
      where: {
        assignmentId,
        id: { not: submissionId },
        content: { not: null }
      },
      select: { content: true }
    });

    // Detect plagiarism
    const plagiarismResult = await detectPlagiarism(content, previousSubmissions);
    
    // Generate AI feedback
    const feedbackResult = await generateFeedback(content);

    // Update submission with results
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        plagiarismRisk: plagiarismResult.riskPercentage,
        feedbackSummary: feedbackResult.feedback,
        score: feedbackResult.score,
        status: 'EVALUATED'
      }
    });

    console.log(`Submission ${submissionId} processed successfully`);
  } catch (error) {
    console.error(`Error processing submission ${submissionId}:`, error);
    
    // Mark as evaluated with error message
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'EVALUATED',
        feedbackSummary: 'Error occurred during evaluation. Please contact instructor.',
        score: 0
      }
    });
  }
};

// Get Submissions for Assignment
const getSubmissionsByAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Check if assignment exists
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });

  if (!assignment) {
    return res.status(404).json({
      error: 'Assignment not found',
      message: 'The requested assignment does not exist'
    });
  }

  const where = { assignmentId };

  // If student, only show their own submissions
  if (req.user.role === 'STUDENT') {
    where.studentId = req.user.id;
  }

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignment: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.submission.count({ where })
  ]);

  res.json({
    message: 'Submissions retrieved successfully',
    submissions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get Single Submission
const getSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          id: true,
          title: true,
          description: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!submission) {
    return res.status(404).json({
      error: 'Submission not found',
      message: 'The requested submission does not exist'
    });
  }

  // Authorization check
  if (req.user.role === 'STUDENT' && submission.studentId !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only view your own submissions'
    });
  }

  res.json({
    message: 'Submission retrieved successfully',
    submission
  });
});

// Update Submission Score (Instructor only)
const updateSubmissionScore = [
  // Validation
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('feedbackSummary').optional().isLength({ max: 1000 }).withMessage('Feedback must be less than 1000 characters'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { score, feedbackSummary } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          select: {
            createdBy: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({
        error: 'Submission not found',
        message: 'The requested submission does not exist'
      });
    }

    // Check if user is the assignment creator
    if (submission.assignment.createdBy !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only the assignment creator can update scores'
      });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        score,
        ...(feedbackSummary && { feedbackSummary })
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignment: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({
      message: 'Submission score updated successfully',
      submission: updatedSubmission
    });
  })
];

// Get My Submissions (Student)
const getMySubmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  const where = { studentId: req.user.id };
  if (status) {
    where.status = status;
  }

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.submission.count({ where })
  ]);

  res.json({
    message: 'My submissions retrieved successfully',
    submissions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

module.exports = {
  createSubmission,
  getSubmissionsByAssignment,
  getSubmission,
  updateSubmissionScore,
  getMySubmissions
};
