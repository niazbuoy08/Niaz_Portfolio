const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect, toggleableAuth } = require('../middleware/auth');
const { 
  uploadConfigs, 
  handleUploadError, 
  processUploadedFiles, 
  deleteFile, 
  getFileUrl 
} = require('../middleware/upload');
const logger = require('../config/logger');

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', 
  toggleableAuth,
  (req, res, next) => {
    logger.info('Image upload request received:', {
      headers: Object.keys(req.headers),
      contentType: req.headers['content-type'],
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : []
    });
    next();
  },
  uploadConfigs.singleImage,
  handleUploadError,
  processUploadedFiles,
  async (req, res) => {
    try {
      if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded'
        });
      }

      const file = req.uploadedFiles[0];
      
      logger.info(`Image uploaded: ${file.filename} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: file.filename,
          originalname: file.originalname,
          url: file.url,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    } catch (error) {
      logger.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while uploading image'
      });
    }
  }
);

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images',
  toggleableAuth,
  uploadConfigs.multipleImages,
  handleUploadError,
  processUploadedFiles,
  async (req, res) => {
    try {
      if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files uploaded'
        });
      }

      const files = req.uploadedFiles.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        url: file.url,
        size: file.size,
        mimetype: file.mimetype
      }));

      logger.info(`Images uploaded: ${files.length} files by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: `${files.length} images uploaded successfully`,
        data: files
      });
    } catch (error) {
      logger.error('Upload images error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while uploading images'
      });
    }
  }
);

// @desc    Upload PDF
// @route   POST /api/upload/pdf
// @access  Private
router.post('/pdf',
  toggleableAuth,
  uploadConfigs.singlePDF,
  handleUploadError,
  processUploadedFiles,
  async (req, res) => {
    try {
      if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No PDF file uploaded'
        });
      }

      const file = req.uploadedFiles[0];

      logger.info(`PDF uploaded: ${file.filename} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'PDF uploaded successfully',
        data: {
          filename: file.filename,
          originalname: file.originalname,
          url: file.url,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    } catch (error) {
      logger.error('Upload PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while uploading PDF'
      });
    }
  }
);

// @desc    Upload mixed files (images and PDF)
// @route   POST /api/upload/mixed
// @access  Private
router.post('/mixed',
  toggleableAuth,
  uploadConfigs.mixed,
  handleUploadError,
  processUploadedFiles,
  async (req, res) => {
    try {
      if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const images = req.uploadedFiles.filter(file => file.mimetype.startsWith('image/'));
      const pdfs = req.uploadedFiles.filter(file => file.mimetype === 'application/pdf');

      const result = {
        images: images.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          url: file.url,
          size: file.size,
          mimetype: file.mimetype
        })),
        pdfs: pdfs.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          url: file.url,
          size: file.size,
          mimetype: file.mimetype
        }))
      };

      logger.info(`Mixed files uploaded: ${images.length} images, ${pdfs.length} PDFs by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: `Files uploaded successfully: ${images.length} images, ${pdfs.length} PDFs`,
        data: result
      });
    } catch (error) {
      logger.error('Upload mixed files error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while uploading files'
      });
    }
  }
);

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
router.delete('/:filename',
  toggleableAuth,
  async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Security check - prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid filename'
        });
      }

      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      
      // Check in both images and pdfs directories
      const possiblePaths = [
        path.join(uploadDir, 'images', filename),
        path.join(uploadDir, 'pdfs', filename),
        path.join(uploadDir, 'temp', filename)
      ];

      let deleted = false;
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          if (deleteFile(filePath)) {
            deleted = true;
            break;
          }
        }
      }

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      logger.info(`File deleted: ${filename} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      logger.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting file'
      });
    }
  }
);

// @desc    Get file info
// @route   GET /api/upload/info/:filename
// @access  Public
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    
    // Check in both images and pdfs directories
    const possiblePaths = [
      { path: path.join(uploadDir, 'images', filename), type: 'image' },
      { path: path.join(uploadDir, 'pdfs', filename), type: 'pdf' },
      { path: path.join(uploadDir, 'temp', filename), type: 'temp' }
    ];

    let fileInfo = null;
    for (const { path: filePath, type } of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        fileInfo = {
          filename,
          type,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: getFileUrl(req, filename, type === 'temp' ? '' : type + 's')
        };
        break;
      }
    }

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    logger.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting file info'
    });
  }
});

// @desc    List uploaded files
// @route   GET /api/upload/list
// @access  Private
router.get('/list', toggleableAuth, async (req, res) => {
  try {
    const { type } = req.query; // 'images', 'pdfs', or 'all'
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    
    let directories = ['images', 'pdfs'];
    if (type && ['images', 'pdfs'].includes(type)) {
      directories = [type];
    }

    const files = [];
    
    for (const dir of directories) {
      const dirPath = path.join(uploadDir, dir);
      if (fs.existsSync(dirPath)) {
        const dirFiles = fs.readdirSync(dirPath);
        for (const filename of dirFiles) {
          const filePath = path.join(dirPath, filename);
          const stats = fs.statSync(filePath);
          
          files.push({
            filename,
            type: dir.slice(0, -1), // Remove 's' from 'images'/'pdfs'
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: getFileUrl(req, filename, dir)
          });
        }
      }
    }

    // Sort by creation date (newest first)
    files.sort((a, b) => new Date(b.created) - new Date(a.created));

    res.status(200).json({
      success: true,
      data: files,
      meta: {
        total: files.length,
        types: directories
      }
    });
  } catch (error) {
    logger.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while listing files'
    });
  }
});

module.exports = router;