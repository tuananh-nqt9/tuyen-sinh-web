const Combination = require('../models/Combination');
const Major = require('../models/Major');

// Get all combinations
exports.getAllCombinations = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, majorId, schoolId, isActive } = req.query;
    
    const query = {};
    if (majorId) query.major = majorId;
    if (schoolId) query.school = schoolId;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const combinations = await Combination.find(query)
      .populate('major', 'name code')
      .populate('school', 'name code')
      .sort({ code: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Combination.countDocuments(query);

    res.json({
      success: true,
      data: {
        combinations,
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

// Get combination by ID
exports.getCombinationById = async (req, res) => {
  try {
    const combination = await Combination.findById(req.params.id)
      .populate('major', 'name code')
      .populate('school', 'name code');

    if (!combination) {
      return res.status(404).json({
        success: false,
        message: 'Tổ hợp không tồn tại'
      });
    }

    res.json({
      success: true,
      data: combination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get combinations by major
exports.getCombinationsByMajor = async (req, res) => {
  try {
    const { majorId } = req.params;
    
    const major = await Major.findById(majorId);
    if (!major) {
      return res.status(404).json({
        success: false,
        message: 'Ngành không tồn tại'
      });
    }

    const combinations = await Combination.find({ major: majorId, isActive: true })
      .sort({ code: 1 });

    res.json({
      success: true,
      data: combinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Create combination (Admin only)
exports.createCombination = async (req, res) => {
  try {
    const combination = new Combination(req.body);
    await combination.save();

    res.status(201).json({
      success: true,
      message: 'Tạo tổ hợp thành công',
      data: combination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Update combination (Admin only)
exports.updateCombination = async (req, res) => {
  try {
    const combination = await Combination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!combination) {
      return res.status(404).json({
        success: false,
        message: 'Tổ hợp không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật tổ hợp thành công',
      data: combination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete combination (Admin only)
exports.deleteCombination = async (req, res) => {
  try {
    const combination = await Combination.findByIdAndDelete(req.params.id);

    if (!combination) {
      return res.status(404).json({
        success: false,
        message: 'Tổ hợp không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Xóa tổ hợp thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
