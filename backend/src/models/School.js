const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortName: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  address: {
    province: String,
    district: String,
    detail: String
  },
  website: String,
  phone: String,
  email: String,
  logo: String,
  banner: String,
  admissionMethod: [{
    type: String,
    enum: ['direct', 'exam', 'combination', 'mixed']
  }],
  tuitionRange: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: 'VND/semester'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  admissionRounds: [{
    name: String,
    startDate: Date,
    endDate: Date,
    resultDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

schoolSchema.index({ code: 1 });
schoolSchema.index({ name: 'text' });

module.exports = mongoose.model('School', schoolSchema);
