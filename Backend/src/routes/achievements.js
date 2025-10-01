const express = require('express');
const Achievement = require('../models/Achievement');
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

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
router.get('/', validateQuery(schemas.listQuery), async (req, res) => {
  try {
    console.log('🔄 GET /api/achievements - Request received');
    console.log('📋 Query parameters:', req.query);
    console.log('🔍 Request headers:', {
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
    });

    const { page, limit, sort, q, tags, fields } = req.query;

    // Build query
    const query = buildQuery({ q, tags }, ['title', 'description']);
    
    // Add category filtering if provided
    if (req.query.category) {
      query.category = new RegExp(req.query.category, 'i');
    }

    // Add organization filtering if provided
    if (req.query.organization) {
      query.organization = new RegExp(req.query.organization, 'i');
    }

    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));

    // Build sort
    const sortObj = buildSort(sort || '-date'); // Default sort by date descending
    console.log('📊 Sort object:', sortObj);
    
    // Build projection
    const projection = buildProjection(fields);
    console.log('📋 Projection:', projection);

    // Execute paginated query
    const result = await executePaginatedQuery(Achievement, query, {
      page,
      limit,
      sort: sortObj,
      projection,
      populate: 'createdBy'
    });

    console.log('✅ Database query successful');
    console.log('📊 Results summary:', {
      totalResults: result.data.length,
      totalPages: result.meta.totalPages,
      currentPage: result.meta.currentPage,
      hasImages: result.data.filter(item => item.evidenceImage).length
    });

    // Log each achievement's image data
    result.data.forEach((achievement, index) => {
      console.log(`🎯 Achievement ${index + 1}:`, {
        id: achievement._id,
        title: achievement.title,
        evidenceImage: achievement.evidenceImage,
        hasImage: !!achievement.evidenceImage,
        imageUrl: achievement.evidenceImage ? `http://localhost:5000/uploads/images/${achievement.evidenceImage}` : 'No image'
      });
    });

    logger.info(`Achievements fetched: ${result.data.length} items, page ${page}`);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ GET /api/achievements - Error occurred:', error);
    logger.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
});

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid achievement ID'
      });
    }

    const achievement = await Achievement.findById(id).populate('createdBy', 'name email');

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    logger.info(`Achievement fetched: ${achievement.title}`);

    res.status(200).json({
      success: true,
      data: achievement
    });
  } catch (error) {
    logger.error('Get achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement'
    });
  }
});

// @desc    Create new achievement
// @route   POST /api/achievements
// @access  Private
router.post('/', toggleableAuth, validate(schemas.achievement), async (req, res) => {
  try {
    const achievementData = {
      ...req.body,
      createdBy: req.user.id
    };

    const achievement = await Achievement.create(achievementData);
    await achievement.populate('createdBy', 'name email');

    logger.info(`Achievement created: ${achievement.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement
    });
  } catch (error) {
    logger.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating achievement'
    });
  }
});

// @desc    Update achievement (full update)
// @route   PUT /api/achievements/:id
// @access  Private
router.put('/:id', toggleableAuth, validate(schemas.achievement), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid achievement ID'
      });
    }

    let achievement = await Achievement.findById(id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Check ownership (unless admin)
    if (achievement.createdBy && achievement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this achievement'
      });
    }

    achievement = await Achievement.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');

    logger.info(`Achievement updated: ${achievement.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Achievement updated successfully',
      data: achievement
    });
  } catch (error) {
    logger.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating achievement'
    });
  }
});

// @desc    Partial update achievement
// @route   PATCH /api/achievements/:id
// @access  Private
router.patch('/:id', toggleableAuth, validate(schemas.achievementUpdate), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid achievement ID'
      });
    }

    let achievement = await Achievement.findById(id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Check ownership (unless admin)
    if (achievement.createdBy && achievement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this achievement'
      });
    }

    // Only update provided fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        achievement[key] = req.body[key];
      }
    });

    await achievement.save();
    await achievement.populate('createdBy', 'name email');

    logger.info(`Achievement partially updated: ${achievement.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Achievement updated successfully',
      data: achievement
    });
  } catch (error) {
    logger.error('Patch achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating achievement'
    });
  }
});

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private
router.delete('/:id', toggleableAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid achievement ID'
      });
    }

    const achievement = await Achievement.findById(id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Check ownership (unless admin)
    if (achievement.createdBy && achievement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this achievement'
      });
    }

    await Achievement.findByIdAndDelete(id);

    logger.info(`Achievement deleted: ${achievement.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    logger.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting achievement'
    });
  }
});

// @desc    Get achievement statistics
// @route   GET /api/achievements/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Achievement.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          categories: { $addToSet: '$category' },
          organizations: { $addToSet: '$organization' },
          thisYear: {
            $sum: {
              $cond: [
                { $gte: ['$date', new Date(new Date().getFullYear(), 0, 1)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const categoryStats = await Achievement.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      total: 0,
      categories: [],
      organizations: [],
      thisYear: 0
    };

    result.categoryBreakdown = categoryStats;

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get achievement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement statistics'
    });
  }
});

// @desc    Get achievements by category
// @route   GET /api/achievements/category/:category
// @access  Public
router.get('/category/:category', validateQuery(schemas.listQuery), async (req, res) => {
  try {
    const { category } = req.params;
    const { page, limit, sort, fields } = req.query;

    const query = { category: new RegExp(category, 'i') };
    const sortObj = buildSort(sort || '-date');
    const projection = buildProjection(fields);

    const result = await executePaginatedQuery(Achievement, query, {
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
    logger.error('Get achievements by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements by category'
    });
  }
});

module.exports = router;