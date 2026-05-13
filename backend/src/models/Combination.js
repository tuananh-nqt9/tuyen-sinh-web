const mongoose = require('mongoose');

const combinationSchema = new mongoose.Schema({
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
  subjects: [{
    type: String,
    enum: ['Toán', 'Ngữ văn', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD', 'Tiếng Anh', 'Tiếng Pháp', 'Tiếng Nhật', 'Tiếng Trung', 'Tin học']
  }],
  major: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Major',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  weight: {
    type: String,
    default: '1:1:1'
  },
  minScore: {
    type: Number,
    min: 0,
    max: 30
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

combinationSchema.index({ code: 1, major: 1 }, { unique: true });
combinationSchema.index({ name: 'text' });

module.exports = mongoose.model('Combination', combinationSchema);
