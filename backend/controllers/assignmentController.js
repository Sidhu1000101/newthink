const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../utils/errorHandler');

const prisma = new PrismaClient();

// Create Assignment (Instructor only)
const createAssignment = [
  // Validation
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { title, description } = req.body;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      }
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  })
];

// Get All Assignments (Public)
const getAssignments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }
    : {};

  const [assignments, total] = await Promise.all([
    prisma.assignment.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.assignment.count({ where })
  ]);

  res.json({
    message: 'Assignments retrieved successfully',
    assignments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get Single Assignment
const getAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { submissions: true }
      }
    }
  });

  if (!assignment) {
    return res.status(404).json({
      error: 'Assignment not found',
      message: 'The requested assignment does not exist'
    });
  }

  res.json({
    message: 'Assignment retrieved successfully',
    assignment
  });
});

// Update Assignment (Instructor only - creator)
const updateAssignment = [
  // Validation
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { title, description } = req.body;

    // Check if assignment exists and user is the creator
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        error: 'Assignment not found',
        message: 'The requested assignment does not exist'
      });
    }

    if (existingAssignment.createdBy !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only the assignment creator can update it'
      });
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description })
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      }
    });

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  })
];

// Delete Assignment (Instructor only - creator)
const deleteAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if assignment exists and user is the creator
  const existingAssignment = await prisma.assignment.findUnique({
    where: { id }
  });

  if (!existingAssignment) {
    return res.status(404).json({
      error: 'Assignment not found',
      message: 'The requested assignment does not exist'
    });
  }

  if (existingAssignment.createdBy !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only the assignment creator can delete it'
    });
  }

  await prisma.assignment.delete({
    where: { id }
  });

  res.json({
    message: 'Assignment deleted successfully'
  });
});

// Get Assignments Created by Current Instructor
const getMyAssignments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  const where = {
    createdBy: req.user.id,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [assignments, total] = await Promise.all([
    prisma.assignment.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.assignment.count({ where })
  ]);

  res.json({
    message: 'My assignments retrieved successfully',
    assignments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getMyAssignments
};
