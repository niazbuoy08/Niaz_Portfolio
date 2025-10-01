const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors
      });
    }

    req.query = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User schemas
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).max(128).required()
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required()
  }),

  // Project schemas
  project: Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(2000).allow(''),
    tags: Joi.array().items(Joi.string().trim().lowercase()),
    status: Joi.string().valid('idea', 'in-progress', 'completed'),
    repoUrl: Joi.string().uri().allow(''),
    liveUrl: Joi.string().uri().allow(''),
    images: Joi.array().items(Joi.string().trim()),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    contributors: Joi.array().items(Joi.string().email())
  }),

  projectUpdate: Joi.object({
    title: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(2000).allow(''),
    tags: Joi.array().items(Joi.string().trim().lowercase()),
    status: Joi.string().valid('idea', 'in-progress', 'completed'),
    repoUrl: Joi.string().uri().allow(''),
    liveUrl: Joi.string().uri().allow(''),
    images: Joi.array().items(Joi.string().trim()),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    contributors: Joi.array().items(Joi.string().email())
  }),

  // Achievement schemas
  achievement: Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(2000).allow(''),
    date: Joi.date().iso().max('now').required(),
    organization: Joi.string().trim().max(200).allow(''),
    evidenceImage: Joi.string().pattern(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/i).allow(''),
    category: Joi.string().trim().max(100).allow(''),
    tags: Joi.array().items(Joi.string().trim().lowercase())
  }),

  achievementUpdate: Joi.object({
    title: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(2000).allow(''),
    date: Joi.date().iso().max('now'),
    organization: Joi.string().trim().max(200).allow(''),
    evidenceImage: Joi.string().pattern(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/i).allow(''),
    category: Joi.string().trim().max(100).allow(''),
    tags: Joi.array().items(Joi.string().trim().lowercase())
  }),

  // Research schemas
  research: Joi.object({
    title: Joi.string().trim().min(1).max(300).required(),
    abstract: Joi.string().trim().max(5000).allow(''),
    authors: Joi.array().items(Joi.string().trim().max(100)).min(1).required(),
    publishedDate: Joi.date().iso().max('now'),
    venue: Joi.string().trim().max(200).allow(''),
    doi: Joi.string().pattern(/^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/).allow(''),
    pdfUrl: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string().trim().lowercase()),
    status: Joi.string().valid('draft', 'submitted', 'published')
  }),

  researchUpdate: Joi.object({
    title: Joi.string().trim().min(1).max(300),
    abstract: Joi.string().trim().max(5000).allow(''),
    authors: Joi.array().items(Joi.string().trim().max(100)).min(1),
    publishedDate: Joi.date().iso().max('now'),
    venue: Joi.string().trim().max(200).allow(''),
    doi: Joi.string().pattern(/^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/).allow(''),
    pdfUrl: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string().trim().lowercase()),
    status: Joi.string().valid('draft', 'submitted', 'published')
  }),

  // Query parameter schemas
  listQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().pattern(/^-?[a-zA-Z_][a-zA-Z0-9_]*$/),
    q: Joi.string().trim().max(200),
    tags: Joi.string().trim(),
    status: Joi.string().trim(),
    fields: Joi.string().trim()
  }),

  idParam: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  })
};

module.exports = {
  validate,
  validateQuery,
  schemas
};