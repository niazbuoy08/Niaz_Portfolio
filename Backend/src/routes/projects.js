const express = require('express');
const Project = require('../models/Project');
const { protect, optionalAuth, toggleableAuth } = require('../middleware/auth');
const { validate, validateQuery, schemas } = require('../middleware/validation');
const { 
  buildQuery, 
  buildSort, 
  buildProjection, 
  executePaginatedQuery,
  isValidObjectId 
} = require('../utils/queryHelpers');
const logger = require('../config/logger');

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', validateQuery(schemas.listQuery), async (req, res) => {
  try {
    const { page, limit, sort, q, tags, status, fields } = req.query;

    // Build query
    const query = buildQuery({ q, tags, status }, ['title', 'description']);
    
    // Build sort
    const sortObj = buildSort(sort);
    
    // Build projection
    const projection = buildProjection(fields);

    // Execute paginated query
    const result = await executePaginatedQuery(Project, query, {
      page,
      limit,
      sort: sortObj,
      projection,
      populate: 'createdBy'
    });

    logger.info(`Projects fetched: ${result.data.length} items, page ${page}`);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await Project.findById(id).populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    logger.info(`Project fetched: ${project.title}`);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project'
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', toggleableAuth, validate(schemas.project), async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.user.id
    };

    const project = await Project.create(projectData);
    await project.populate('createdBy', 'name email');

    logger.info(`Project created: ${project.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating project'
    });
  }
});

// @desc    Update project (full update)
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', toggleableAuth, validate(schemas.project), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    let project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check ownership (unless admin)
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    project = await Project.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');

    logger.info(`Project updated: ${project.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project'
    });
  }
});

// @desc    Partial update project
// @route   PATCH /api/projects/:id
// @access  Private
router.patch('/:id', toggleableAuth, validate(schemas.projectUpdate), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    let project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check ownership (unless admin)
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Only update provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        project[key] = req.body[key];
      }
    });

    await project.save();
    await project.populate('createdBy', 'name email');

    logger.info(`Project partially updated: ${project.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    logger.error('Patch project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project'
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', toggleableAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check ownership (unless admin)
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await Project.findByIdAndDelete(id);

    logger.info(`Project deleted: ${project.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project'
    });
  }
});

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          ideas: {
            $sum: { $cond: [{ $eq: ['$status', 'idea'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      inProgress: 0,
      ideas: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project statistics'
    });
  }
});

module.exports = router;