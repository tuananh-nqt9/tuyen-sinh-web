const School = require('../models/School');

// Get all schools
exports.getAllSchools = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const schools = await School.find(query)
      .sort({ priority: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await School.countDocuments(query);

    res.json({
      success: true,
      data: {
        schools,
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

// Get school by ID
exports.getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Trường không tồn tại'
      });
    }

    res.json({
      success: true,
      data: school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Create school (Admin only)
exports.createSchool = async (req, res) => {
  try {
    const school = new School(req.body);
    await school.save();

    res.status(201).json({
      success: true,
      message: 'Tạo trường thành công',
      data: school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Update school (Admin only)
exports.updateSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Trường không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trường thành công',
      data: school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Delete school (Admin only)
exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Trường không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Xóa trường thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Get active admission rounds
exports.getActiveAdmissionRounds = async (req, res) => {
  try {
    const schools = await School.find({ isActive: true });
    
    const activeRounds = schools.flatMap(school => {
      const rounds = school.admissionRounds
        .filter(round => round.isActive && new Date(round.endDate) >= new Date())
        .map(round => ({
          schoolId: school._id,
          schoolName: school.name,
          roundName: round.name,
          startDate: round.startDate,
          endDate: round.endDate,
          resultDate: round.resultDate
        }));
      return rounds;
    });

    res.json({
      success: true,
      data: activeRounds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
