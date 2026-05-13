const Major = require('../models/Major');
const School = require('../models/School');

// Get all majors
exports.getAllMajors = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, schoolId, group, isActive } = req.query;
    
    const query = {};
    if (schoolId) query.school = schoolId;
    if (group) query.group = group;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const majors = await Major.find(query)
      .populate('school', 'name code')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Major.countDocuments(query);

    res.json({
      success: true,
      data: {
        majors,
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

// Get major by ID
exports.getMajorById = async (req, res) => {
  try {
    const major = await Major.findById(req.params.id)
      .populate('school', 'name code address');

    if (!major) {
      return res.status(404).json({
        success: false,
        message: 'Ngành không tồn tại'
      });
    }

    res.json({
      success: true,
      data: major
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get majors by school
exports.getMajorsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Trường không tồn tại'
      });
    }

    const majors = await Major.find({ school: schoolId, isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: majors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Create major (Admin only)
exports.createMajor = async (req, res) => {
  try {
    const major = new Major(req.body);
    await major.save();

    res.status(201).json({
      success: true,
      message: 'Tạo ngành thành công',
      data: major
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Update major (Admin only)
exports.updateMajor = async (req, res) => {
  try {
    const major = await Major.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!major) {
      return res.status(404).json({
        success: false,
        message: 'Ngành không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật ngành thành công',
      data: major
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete major (Admin only)
exports.deleteMajor = async (req, res) => {
  try {
    const major = await Major.findByIdAndDelete(req.params.id);

    if (!major) {
      return res.status(404).json({
        success: false,
        message: 'Ngành không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Xóa ngành thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get all major groups
exports.getMajorGroups = async (req, res) => {
  try {
    const groups = await Major.distinct('group');
    
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
