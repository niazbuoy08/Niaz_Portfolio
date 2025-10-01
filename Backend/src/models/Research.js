const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Research title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  abstract: {
    type: String,
    trim: true,
    maxlength: [5000, 'Abstract cannot exceed 5000 characters']
  },
  authors: [{
    type: String,
    required: [true, 'At least one author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  }],
  publishedDate: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return v <= new Date();
      },
      message: 'Published date cannot be in the future'
    }
  },
  venue: {
    type: String,
    trim: true,
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  doi: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/.test(v);
      },
      message: 'DOI must be in valid format (e.g., 10.1000/182)'
    }
  },
  pdfUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v) || /^\/uploads\/.+\.pdf$/.test(v);
      },
      message: 'PDF URL must be a valid URL or local file path'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: {
      values: ['draft', 'submitted', 'published'],
      message: 'Status must be either draft, submitted, or published'
    },
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
researchSchema.index({ title: 'text', abstract: 'text' });
researchSchema.index({ status: 1 });
researchSchema.index({ tags: 1 });
researchSchema.index({ publishedDate: -1 });
researchSchema.index({ createdAt: -1 });
researchSchema.index({ authors: 1 });
researchSchema.index({ venue: 1 });

// Virtual for citation format (APA style)
researchSchema.virtual('citation').get(function() {
  const authors = this.authors.join(', ');
  const year = this.publishedDate ? this.publishedDate.getFullYear() : 'n.d.';
  const venue = this.venue ? `. ${this.venue}` : '';
  const doi = this.doi ? `. https://doi.org/${this.doi}` : '';
  
  return `${authors} (${year}). ${this.title}${venue}${doi}`;
});

// Virtual for publication year
researchSchema.virtual('publicationYear').get(function() {
  return this.publishedDate ? this.publishedDate.getFullYear() : null;
});

// Ensure virtual fields are serialized
researchSchema.set('toJSON', { virtuals: true });
researchSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Research', researchSchema);