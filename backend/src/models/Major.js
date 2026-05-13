const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
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
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  group: {
    type: String,
    enum: ['KHTN', 'KHXH', 'TM', 'NN', 'SP', 'CD', 'SK', 'KT', 'MT', 'CN', 'YT', 'LS', 'DL', 'Báo chí', 'Truyền thông', 'Luật', 'Khác'],
    default: 'Khác'
  },
  degree: {
    type: String,
    enum: ['Cử nhân', 'Kỹ sư', 'Bác sĩ', 'Thạc sĩ'],
    default: 'Cử nhân'
  },
  duration: {
    type: Number,
    default: 4,
    min: 1,
    max: 7
  },
  tuitionPerSemester: {
    type: Number,
    min: 0
  },
  capacity: {
    type: Number,
    min: 0
  },
  minScore: {
    type: Number,
    min: 0,
    max: 30
  },
  cutoffScore: {
    type: Number,
    min: 0,
    max: 30
  },
  subjectGroups: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: {
    type: String
  },
  careerOpportunities: {
    type: String
  }
}, {
  timestamps: true
});

majorSchema.index({ code: 1, school: 1 }, { unique: true });
majorSchema.index({ name: 'text' });

module.exports = mongoose.model('Major', majorSchema);
