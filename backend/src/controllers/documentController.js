const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Application = require('../models/Application');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file JPEG, PNG và PDF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để tải lên'
      });
    }

    const { applicationId, documentType } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      candidate: req.user._id
    });

    if (!application) {
      // Delete uploaded file if application not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Hồ sơ không tồn tại'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Remove old document of same type if exists
    application.documents = application.documents.filter(
      doc => doc.type !== documentType
    );

    // Add new document
    application.documents.push({
      type: documentType,
      fileName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype
    });

    await application.save();

    res.json({
      success: true,
      message: 'Tải lên tài liệu thành công',
      data: {
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype
      }
    });
  } catch (error) {
    // Delete uploaded file if error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { applicationId, documentType } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      candidate: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Hồ sơ không tồn tại'
      });
    }

    const docIndex = application.documents.findIndex(doc => doc.type === documentType);
    if (docIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tồn tại'
      });
    }

    const doc = application.documents[docIndex];
    
    // Delete physical file
    const filePath = path.join(__dirname, '../../', doc.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from array
    application.documents.splice(docIndex, 1);
    await application.save();

    res.json({
      success: true,
      message: 'Xóa tài liệu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Verify document (Admin)
exports.verifyDocument = async (req, res) => {
  try {
    const { applicationId, documentType, verified, notes } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Hồ sơ không tồn tại'
      });
    }

    const doc = application.documents.find(d => d.type === documentType);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tồn tại'
      });
    }

    doc.verified = verified;
    doc.verifiedBy = req.user._id;
    doc.verifiedAt = new Date();
    if (notes) doc.notes = notes;

    await application.save();

    res.json({
      success: true,
      message: verified ? 'Xác minh tài liệu thành công' : 'Hủy xác minh tài liệu',
      data: doc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  upload,
  uploadDocument: exports.uploadDocument,
  deleteDocument: exports.deleteDocument,
  verifyDocument: exports.verifyDocument,
  uploadMiddleware: upload
};
