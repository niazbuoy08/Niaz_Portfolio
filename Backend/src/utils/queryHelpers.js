const mongoose = require('mongoose');

/**
 * Build MongoDB query from request parameters
 * @param {Object} queryParams - Request query parameters
 * @param {Array} searchFields - Fields to search in for text search
 * @returns {Object} - MongoDB query object
 */
const buildQuery = (queryParams, searchFields = []) => {
  const query = {};

  // Text search
  if (queryParams.q && searchFields.length > 0) {
    query.$text = { $search: queryParams.q };
  }

  // Tags filtering
  if (queryParams.tags) {
    const tags = queryParams.tags.split(',').map(tag => tag.trim().toLowerCase());
    query.tags = { $in: tags };
  }

  // Status filtering
  if (queryParams.status) {
    query.status = queryParams.status;
  }

  // Date range filtering (if needed)
  if (queryParams.startDate || queryParams.endDate) {
    query.createdAt = {};
    if (queryParams.startDate) {
      query.createdAt.$gte = new Date(queryParams.startDate);
    }
    if (queryParams.endDate) {
      query.createdAt.$lte = new Date(queryParams.endDate);
    }
  }

  return query;
};

/**
 * Build sort object from sort parameter
 * @param {String} sortParam - Sort parameter (e.g., '-createdAt', 'title')
 * @returns {Object} - MongoDB sort object
 */
const buildSort = (sortParam) => {
  if (!sortParam) return { createdAt: -1 }; // Default sort

  const sortObj = {};
  
  if (sortParam.startsWith('-')) {
    sortObj[sortParam.substring(1)] = -1;
  } else {
    sortObj[sortParam] = 1;
  }

  return sortObj;
};

/**
 * Build field projection from fields parameter
 * @param {String} fieldsParam - Fields parameter (e.g., 'title,description')
 * @returns {String} - MongoDB projection string
 */
const buildProjection = (fieldsParam) => {
  if (!fieldsParam) return '';
  
  return fieldsParam.split(',').map(field => field.trim()).join(' ');
};

/**
 * Execute paginated query
 * @param {Model} Model - Mongoose model
 * @param {Object} query - MongoDB query object
 * @param {Object} options - Query options (page, limit, sort, projection)
 * @returns {Object} - Results with pagination metadata
 */
const executePaginatedQuery = async (Model, query, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    projection = '',
    populate = ''
  } = options;

  const skip = (page - 1) * limit;

  // Build the query
  let mongoQuery = Model.find(query);

  // Apply projection
  if (projection) {
    mongoQuery = mongoQuery.select(projection);
  }

  // Apply population
  if (populate) {
    mongoQuery = mongoQuery.populate(populate);
  }

  // Apply sorting
  mongoQuery = mongoQuery.sort(sort);

  // Execute query with pagination
  const [results, total] = await Promise.all([
    mongoQuery.skip(skip).limit(limit).exec(),
    Model.countDocuments(query)
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: results,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
};

/**
 * Validate MongoDB ObjectId
 * @param {String} id - ID to validate
 * @returns {Boolean} - Whether ID is valid
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Build aggregation pipeline for advanced queries
 * @param {Object} queryParams - Request query parameters
 * @param {Object} options - Pipeline options
 * @returns {Array} - Aggregation pipeline
 */
const buildAggregationPipeline = (queryParams, options = {}) => {
  const pipeline = [];

  // Match stage
  const matchQuery = buildQuery(queryParams, options.searchFields);
  if (Object.keys(matchQuery).length > 0) {
    pipeline.push({ $match: matchQuery });
  }

  // Add text score for text search
  if (queryParams.q && options.searchFields) {
    pipeline.push({
      $addFields: {
        score: { $meta: 'textScore' }
      }
    });
  }

  // Sort stage
  const sortObj = buildSort(queryParams.sort);
  if (queryParams.q && options.searchFields) {
    // Sort by text score first, then by other criteria
    pipeline.push({
      $sort: { score: { $meta: 'textScore' }, ...sortObj }
    });
  } else {
    pipeline.push({ $sort: sortObj });
  }

  // Projection stage
  if (queryParams.fields) {
    const projection = {};
    queryParams.fields.split(',').forEach(field => {
      projection[field.trim()] = 1;
    });
    pipeline.push({ $project: projection });
  }

  return pipeline;
};

module.exports = {
  buildQuery,
  buildSort,
  buildProjection,
  executePaginatedQuery,
  isValidObjectId,
  buildAggregationPipeline
};