const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Achievement date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Achievement date cannot be in the future'
    }
  },
  organization: {
    type: String,
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  evidenceImage: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        // Validate that it's a filename (not a full URL)
        return /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Evidence image must be a valid image filename'
    }
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
achievementSchema.index({ title: 'text', description: 'text' });
achievementSchema.index({ category: 1 });
achievementSchema.index({ tags: 1 });
achievementSchema.index({ date: -1 });
achievementSchema.index({ createdAt: -1 });
achievementSchema.index({ organization: 1 });

// Virtual for time since achievement
achievementSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
});

// Ensure virtual fields are serialized
achievementSchema.set('toJSON', { virtuals: true });
achievementSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Achievement', achievementSchema);