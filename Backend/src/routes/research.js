const express = require('express');
const Research = require('../models/Research');
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

// @desc    Get all research
// @route   GET /api/research
// @access  Public
router.get('/', validateQuery(schemas.listQuery), async (req, res) => {
  try {
    const { page, limit, sort, q, tags, status, fields } = req.query;

    // Build query
    const query = buildQuery({ q, tags, status }, ['title', 'abstract']);
    
    // Add venue filtering if provided
    if (req.query.venue) {
      query.venue = new RegExp(req.query.venue, 'i');
    }

    // Add author filtering if provided
    if (req.query.author) {
      query.authors = new RegExp(req.query.author, 'i');
    }

    // Add year filtering if provided
    if (req.query.year) {
      const year = parseInt(req.query.year);
      query.publishedDate = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      };
    }

    // Build sort
    const sortObj = buildSort(sort || '-publishedDate'); // Default sort by published date descending
    
    // Build projection
    const projection = buildProjection(fields);

    // Execute paginated query
    const result = await executePaginatedQuery(Research, query, {
      page,
      limit,
      sort: sortObj,
      projection,
      populate: 'createdBy'
    });

    logger.info(`Research fetched: ${result.data.length} items, page ${page}`);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Get research error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching research'
    });
  }
});

// @desc    Get single research
// @route   GET /api/research/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid research ID'
      });
    }

    const research = await Research.findById(id).populate('createdBy', 'name email');

    if (!research) {
      return res.status(404).json({
        success: false,
        message: 'Research not found'
      });
    }

    logger.info(`Research fetched: ${research.title}`);

    res.status(200).json({
      success: true,
      data: research
    });
  } catch (error) {
    logger.error('Get research error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching research'
    });
  }
});

// @desc    Create new research
// @route   POST /api/research
// @access  Private
router.post('/', toggleableAuth, validate(schemas.research), async (req, res) => {
  try {
    const researchData = {
      ...req.body,
      createdBy: req.user.id
    };

    const research = await Research.create(researchData);
    await research.populate('createdBy', 'name email');

    logger.info(`Research created: ${research.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Research created successfully',
      data: research
    });
  } catch (error) {
    logger.error('Create research error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating research'
    });
  }
});

// @desc    Update research (full update)
// @route   PUT /api/research/:id
// @access  Private
router.put('/:id', toggleableAuth, validate(schemas.research), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid research ID'
      });
    }

    let research = await Research.findById(id);

    if (!research) {
      return res.status(404).json({
        success: false,
        message: 'Research not found'
      });
    }

    // Check ownership (unless admin)
    if (research.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this research'
      });
    }

    research = await Research.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');

    logger.info(`Research updated: ${research.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Research updated successfully',
      data: research
    });
  } catch (error) {
    logger.error('Update research error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating research'
    });
  }
});

// @desc    Partial update research
// @route   PATCH /api/research/:id
// @access  Private
router.patch('/:id', toggleableAuth, validate(schemas.researchUpdate), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid research ID'
      });
    }

    let research = await Research.findById(id);

    if (!research) {
      return res.status(404).json({
        success: false,
        message: 'Research not found'
      });
    }

    // Check ownership (unless admin)
    if (research.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this research'
      });
    }

    // Only update provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        research[key] = req.body[key];
      }
    });

    await research.save();
    await research.populate('createdBy', 'name email');

    logger.info(`Research partially updated: ${research.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Research updated successfully',
      data: research
    });
  } catch (error) {
    logger.error('Patch research error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating research'
    });
  }
});

// @desc    Delete research
// @route   DELETE /api/research/:id
// @access  Private
router.delete('/:id', toggleableAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid research ID'
      });
    }

    const research = await Research.findById(id);

    if (!research) {
      return res.status(404).json({
        success: false,
        message: 'Research not found'
      });
    }

    // Check ownership (unless admin)
    if (research.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this research'
      });
    }

    await Research.findByIdAndDelete(id);

    logger.info(`Research deleted: ${research.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Research deleted successfully'
    });
  } catch (error) {
    logger.error('Delete research error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting research'
    });
  }
});

// @desc    Get research statistics
// @route   GET /api/research/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Research.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          submitted: {
            $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
          },
          drafts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          venues: { $addToSet: '$venue' },
          thisYear: {
            $sum: {
              $cond: [
                { $gte: ['$publishedDate', new Date(new Date().getFullYear(), 0, 1)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const yearlyStats = await Research.aggregate([
      {
        $match: { publishedDate: { $exists: true } }
      },
      {
        $group: {
          _id: { $year: '$publishedDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    const result = stats[0] || {
      total: 0,
      published: 0,
      submitted: 0,
      drafts: 0,
      venues: [],
      thisYear: 0
    };

    result.yearlyBreakdown = yearlyStats;

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get research stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching research statistics'
    });
  }
});

// @desc    Get research by status
// @route   GET /api/research/status/:status
// @access  Public
router.get('/status/:status', validateQuery(schemas.listQuery), async (req, res) => {
  try {
    const { status } = req.params;
    const { page, limit, sort, fields } = req.query;

    // Validate status
    if (!['draft', 'submitted', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be draft, submitted, or published'
      });
    }

    const query = { status };
    const sortObj = buildSort(sort || '-publishedDate');
    const projection = buildProjection(fields);

    const result = await executePaginatedQuery(Research, query, {
      page,
      limit,
      sort: sortObj,
      projection,
      populate: 'createdBy'
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Get research by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching research by status'
    });
  }
});

// @desc    Get research by author
// @route   GET /api/research/author/:author
// @access  Public
router.get('/author/:author', validateQuery(schemas.listQuery), async (req, res) => {
  try {
    const { author } = req.params;
    const { page, limit, sort, fields } = req.query;

    const query = { authors: new RegExp(author, 'i') };
    const sortObj = buildSort(sort || '-publishedDate');
    const projection = buildProjection(fields);

    const result = await executePaginatedQuery(Research, query, {
      page,
      limit,
      sort: sortObj,
      projection,
      populate: 'createdBy'
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Get research by author error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching research by author'
    });
  }
});

module.exports = router;