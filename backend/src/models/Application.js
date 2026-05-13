const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationCode: {
    type: String,
    required: true,
    unique: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  major: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Major',
    required: true
  },
  combination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Combination',
    required: true
  },
  admissionRound: {
    type: String
  },
  // Personal Information
  personalInfo: {
    fullName: String,
    dateOfBirth: Date,
    gender: String,
    cccd: String,
    phone: String,
    email: String,
    address: {
      province: String,
      district: String,
      ward: String,
      detail: String
    }
  },
  // Academic Information
  academicInfo: {
    highSchool: String,
    graduationYear: Number,
    academicRecord: {
      type: String,
      enum: ['Giỏi', 'Khá', 'Trung bình', 'Yếu']
    },
    scores: {
      subject1: Number,
      subject2: Number,
      subject3: Number,
      totalScore: Number
    },
    priorityObject: {
      type: String,
      enum: ['0', '1', '2', '3', '4', '5', '6', '7']
    },
    priorityArea: {
      type: String,
      enum: ['KV1', 'KV2', 'KV2-NT', 'KV3']
    }
  },
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['academic_record', 'cccd_front', 'cccd_back', 'photo', 'birth_certificate', 'other']
    },
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String
  }],
  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'pending', 'reviewing', 'approved', 'rejected', 'waitlist'],
    default: 'draft'
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  // Review
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    score: Number,
    notes: String,
    recommendation: {
      type: String,
      enum: ['accept', 'reject', 'waitlist', 'need_more_info']
    }
  },
  // Result
  result: {
    isAdmitted: Boolean,
    admittedAt: Date,
    admissionLetterUrl: String
  },
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['submitted', 'status_changed', 'approved', 'rejected', 'document_request']
    },
    sentAt: Date,
    sentTo: String,
    subject: String,
    content: String
  }],
  // Priority bonus
  priorityBonus: {
    type: Number,
    default: 0
  },
  finalScore: Number,
  notes: String
}, {
  timestamps: true
});

applicationSchema.index({ applicationCode: 1 });
applicationSchema.index({ candidate: 1 });
applicationSchema.index({ school: 1, major: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

// Generate application code before saving
applicationSchema.pre('save', function(next) {
  if (!this.applicationCode) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.applicationCode = `TS${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
