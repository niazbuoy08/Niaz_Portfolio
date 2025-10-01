const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure subdirectories exist
const subdirs = ['images', 'pdfs', 'temp'];
subdirs.forEach(subdir => {
  const fullPath = path.join(uploadDir, subdir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'temp';
    
    if (file.mimetype.startsWith('image/')) {
      folder = 'images';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'pdfs';
    }
    
    const destPath = path.join(uploadDir, folder);
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  // Allowed document types
  const allowedDocTypes = ['application/pdf'];
  
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Base multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 10 // Maximum 10 files per request
  }
});

// Specific upload configurations
const uploadConfigs = {
  // Single image upload
  singleImage: upload.single('image'),
  
  // Multiple images upload (max 5)
  multipleImages: upload.array('images', 5),
  
  // Single PDF upload
  singlePDF: upload.single('pdf'),
  
  // Mixed upload (images and PDF)
  mixed: upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'pdf', maxCount: 1 }
  ]),
  
  // Any file upload
  any: upload.any()
};

// Helper function to get file URL
const getFileUrl = (req, filename, folder = '') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const filePath = folder ? `uploads/${folder}/${filename}` : `uploads/${filename}`;
  return `${baseUrl}/${filePath}`;
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

// Helper function to move file
const moveFile = (oldPath, newPath) => {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(newPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.renameSync(oldPath, newPath);
    logger.info(`File moved from ${oldPath} to ${newPath}`);
    return true;
  } catch (error) {
    logger.error(`Error moving file from ${oldPath} to ${newPath}:`, error);
    return false;
  }
};

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
  // Log the error details for debugging
  logger.error('Upload error occurred:', {
    error: error.message,
    code: error.code,
    field: error.field,
    stack: error.stack
  });

  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024) / (1024 * 1024)}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected file field: ${error.field}. Expected field name: 'image'`;
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in multipart data';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      default:
        message = error.message;
    }
    
    logger.error(`Multer error: ${message}`, { code: error.code, field: error.field });
    
    return res.status(statusCode).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    logger.error('Invalid file type error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Log any other errors
  logger.error('Unhandled upload error:', error);
  next(error);
};

// Middleware to process uploaded files
const processUploadedFiles = (req, res, next) => {
  if (req.files || req.file) {
    const files = req.files || [req.file];
    const processedFiles = [];
    
    // Handle different file structures
    if (Array.isArray(files)) {
      // Single field with multiple files or req.file wrapped in array
      files.forEach(file => {
        if (file) {
          processedFiles.push({
            fieldname: file.fieldname,
            originalname: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: getFileUrl(req, file.filename, file.mimetype.startsWith('image/') ? 'images' : 'pdfs'),
            path: file.path
          });
        }
      });
    } else {
      // Multiple fields (req.files object)
      Object.keys(files).forEach(fieldname => {
        files[fieldname].forEach(file => {
          processedFiles.push({
            fieldname: file.fieldname,
            originalname: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: getFileUrl(req, file.filename, file.mimetype.startsWith('image/') ? 'images' : 'pdfs'),
            path: file.path
          });
        });
      });
    }
    
    req.uploadedFiles = processedFiles;
    logger.info(`Files processed: ${processedFiles.length} files uploaded`);
  }
  
  next();
};

module.exports = {
  upload,
  uploadConfigs,
  getFileUrl,
  deleteFile,
  moveFile,
  handleUploadError,
  processUploadedFiles
};