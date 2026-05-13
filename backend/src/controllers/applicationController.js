const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');

// Get all applications (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, schoolId, majorId, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (schoolId) query.school = schoolId;
    if (majorId) query.major = majorId;
    if (search) {
      query.$or = [
        { applicationCode: { $regex: search, $options: 'i' } },
        { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'personalInfo.cccd': { $regex: search, $options: 'i' } }
      ];
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const applications = await Application.find(query)
      .populate('candidate', 'fullName email phone')
      .populate('school', 'name code')
      .populate('major', 'name code')
      .populate('combination', 'name code')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get my applications (Candidate)
exports.getMyApplications = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { candidate: req.user._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('school', 'name code')
      .populate('major', 'name code')
      .populate('combination', 'name code subjects')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'fullName email phone')
      .populate('school', 'name code address')
      .populate('major', 'name code')
      .populate('combination', 'name code subjects')
      .populate('statusHistory.changedBy', 'fullName')
      .populate('review.reviewedBy', 'fullName')
      .populate('documents.verifiedBy', 'fullName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Hồ sơ không tồn tại'
      });
    }

    // Check if user has permission to view
    if (req.user.role === 'candidate' && application.candidate._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem hồ sơ này'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Create application
exports.createApplication = async (req, res) => {
  try {
    const { school, major, combination, admissionRound, personalInfo, academicInfo } = req.body;

    // Check if already applied for this major
    const existing = await Application.findOne({
      candidate: req.user._id,
      major: major,
      status: { $nin: ['rejected'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký ngành này rồi'
      });
    }

    const application = new Application({
      candidate: req.user._id,
      school,
      major,
      combination,
      admissionRound,
      personalInfo: {
        ...personalInfo,
        fullName: personalInfo.fullName || req.user.fullName,
        email: personalInfo.email || req.user.email,
        phone: personalInfo.phone || req.user.phone
      },
      academicInfo,
      status: 'draft'
    });

    await application.save();

    // Send notification email
    await sendEmail({
      to: req.user.email,
      subject: 'Xác nhận đăng ký xét tuyển',
      html: `
        <h2>Xin chào ${req.user.fullName}!</h2>
        <p>Hồ sơ đăng ký xét tuyển của bạn đã được tạo thành công.</p>
        <p><strong>Mã hồ sơ:</strong> ${application.applicationCode}</p>
        <p>Bạn có thể theo dõi trạng thái hồ sơ tại website của chúng tôi.</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Tạo hồ sơ thành công',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Submit application
exports.submitApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      candidate: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Hồ sơ không tồn tại'
      });
    }

    if (application.status !== 'draft' && application.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Không thể nộp hồ sơ ở trạng thái này'
      });
    }

    application.status = 'submitted';
    application.statusHistory.push({
      status: 'submitted',
      changedBy: req.user._id,
      notes: 'Thí sinh nộp hồ sơ'
    });

    await application.save();

    // Create notification
    const notification = new Notification({
      user: req.user._id,
      type: 'application_submitted',
      title: 'Hồ sơ đã được nộp',
      message: `Hồ sơ ${application.applicationCode} đã được nộp thành công và đang chờ xét duyệt.`,
      data: { applicationId: application._id }
    });
    await notification.save();

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: 'Xác nhận nộp hồ sơ xét tuyển',
      html: `
        <h2>Xin chào ${req.user.fullName}!</h2>
        <p>Hồ sơ đăng ký xét tuyển của bạn đã được nộp thành công.</p>
        <p><strong>Mã hồ sơ:</strong> ${application.applicationCode}</p>
        <p>Chúng tôi sẽ thông báo cho bạn khi có kết quả xét duyệt.</p>
      `
    });

    res.json({
      success: true,
      message: 'Nộp hồ sơ thành công',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Update application status (Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'email fullName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Hồ sơ không tồn tại'
      });
    }

    const oldStatus = application.status;
    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      notes: notes || `Trạng thái thay đổi từ ${oldStatus} sang ${status}`
    });

    // Update review info if approved/rejected
    if (status === 'approved' || status === 'rejected') {
      application.review = {
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        notes: notes,
        recommendation: status === 'approved' ? 'accept' : 'reject'
      };
    }

    await application.save();

    // Send email notification
    const statusMessages = {
      pending: 'đang được xem xét',
      reviewing: 'đang trong quá trình xét duyệt',
      approved: 'đã được chấp nhận',
      rejected: 'đã bị từ chối',
      waitlist: 'nằm trong danh sách chờ'
    };

    await sendEmail({
      to: application.candidate.email,
      subject: `Thông báo cập nhật hồ sơ xét tuyển - ${application.applicationCode}`,
      html: `
        <h2>Xin chào ${application.candidate.fullName}!</h2>
        <p>Hồ sơ đăng ký xét tuyển của bạn đã được cập nhật.</p>
        <p><strong>Mã hồ sơ:</strong> ${application.applicationCode}</p>
        <p><strong>Trạng thái mới:</strong> ${statusMessages[status] || status}</p>
        ${notes ? `<p><strong>Ghi chú:</strong> ${notes}</p>` : ''}
        <p>Để biết thêm chi tiết, vui lòng truy cập website của chúng tôi.</p>
      `
    });

    // Create notification
    const notification = new Notification({
      user: application.candidate._id,
      type: 'status_changed',
      title: 'Cập nhật trạng thái hồ sơ',
      message: `Hồ sơ ${application.applicationCode} đã được cập nhật: ${statusMessages[status] || status}`,
      data: { applicationId: application._id }
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Update application (Candidate)
exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      candidate: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Hồ sơ không tồn tại'
      });
    }

    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Không thể chỉnh sửa hồ sơ đã nộp'
      });
    }

    const allowedUpdates = ['personalInfo', 'academicInfo', 'admissionRound'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        application[field] = { ...application[field], ...req.body[field] };
      }
    });

    await application.save();

    res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete application (Candidate - only draft)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      candidate: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Hồ sơ không tồn tại'
      });
    }

    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa hồ sơ đã nộp'
      });
    }

    await Application.findByIdAndDelete(application._id);

    res.json({
      success: true,
      message: 'Xóa hồ sơ thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get statistics (Admin)
exports.getStatistics = async (req, res) => {
  try {
    const { schoolId, startDate, endDate } = req.query;
    
    const matchQuery = {};
    if (schoolId) matchQuery.school = mongoose.Types.ObjectId(schoolId);
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // Total applications by status
    const statusStats = await Application.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // By school
    const schoolStats = await Application.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$school', count: { $sum: 1 }, approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } } } },
      { $lookup: { from: 'schools', localField: '_id', foreignField: '_id', as: 'school' } },
      { $unwind: '$school' },
      { $project: { name: '$school.name', count: 1, approved: 1 } }
    ]);

    // By major
    const majorStats = await Application.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$major', count: { $sum: 1 } } },
      { $lookup: { from: 'majors', localField: '_id', foreignField: '_id', as: 'major' } },
      { $unwind: '$major' },
      { $project: { name: '$major.name', count: 1 } }
    ]);

    // Daily submissions
    const dailyStats = await Application.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Total
    const total = await Application.countDocuments(matchQuery);

    res.json({
      success: true,
      data: {
        total,
        byStatus: statusStats,
        bySchool: schoolStats,
        byMajor: majorStats,
        dailySubmissions: dailyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
