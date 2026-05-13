require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const schoolRoutes = require('./routes/schools');
const majorRoutes = require('./routes/majors');
const combinationRoutes = require('./routes/combinations');
const applicationRoutes = require('./routes/applications');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/majors', majorRoutes);
app.use('/api/combinations', combinationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_admission';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Server will start without database connection');
  }
};

// Seed initial data
const seedData = async () => {
  try {
    const School = require('./models/School');
    const Major = require('./models/Major');
    const Combination = require('./models/Combination');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    // Check if data exists
    const schoolCount = await School.countDocuments();
    if (schoolCount > 0) {
      console.log('📦 Data already seeded');
      return;
    }

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@university.edu.vn' });
    if (!adminExists) {
      await User.create({
        email: 'admin@university.edu.vn',
        password: 'admin123',
        fullName: 'Quản trị viên',
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@university.edu.vn / admin123');
    }

    // Create sample schools
    const schools = await School.create([
      {
        code: 'DHBK',
        name: 'Đại học Bách Khoa Hà Nội',
        shortName: 'HUST',
        description: 'Đại học Bách Khoa Hà Nội - trường đại học kỹ thuật hàng đầu Việt Nam',
        address: { province: 'Hà Nội', district: 'Đống Đa', detail: 'Số 1 Đại Cồ Việt' },
        website: 'https://hust.edu.vn',
        admissionMethod: ['exam', 'combination'],
        tuitionRange: { min: 20000000, max: 45000000 },
        admissionRounds: [
          { name: 'Đợt 1', startDate: new Date('2024-01-01'), endDate: new Date('2024-06-30'), resultDate: new Date('2024-07-15') },
          { name: 'Đợt 2', startDate: new Date('2024-07-01'), endDate: new Date('2024-08-15'), resultDate: new Date('2024-08-30') }
        ]
      },
      {
        code: 'DHQG',
        name: 'Đại học Quốc gia Hà Nội',
        shortName: 'VNU',
        description: 'Đại học Quốc gia Hà Nội - trung tâm đào tạo và nghiên cứu lớn nhất Việt Nam',
        address: { province: 'Hà Nội', district: 'Cầu Giấy', detail: '19 Lê Thánh Tông' },
        website: 'https://vnu.edu.vn',
        admissionMethod: ['exam', 'direct', 'combination'],
        tuitionRange: { min: 18000000, max: 50000000 }
      },
      {
        code: 'DHSP',
        name: 'Đại học Sư phạm Hà Nội',
        shortName: 'HNUE',
        description: 'Đại học Sư phạm Hà Nội - ngôi trường sư phạm lâu đời nhất Việt Nam',
        address: { province: 'Hà Nội', district: 'Hai Bà Trưng', detail: '136 Xuân Thủy' },
        website: 'https://hnue.edu.vn',
        admissionMethod: ['exam', 'combination'],
        tuitionRange: { min: 15000000, max: 35000000 }
      },
      {
        code: 'DHKT',
        name: 'Học viện Tài chính',
        shortName: 'AOF',
        description: 'Học viện Tài chính - đào tạo hàng đầu về tài chính, ngân hàng',
        address: { province: 'Hà Nội', district: 'Ba Đình', detail: '69 Điện Biên Phủ' },
        website: 'https://aof.edu.vn',
        admissionMethod: ['exam', 'combination'],
        tuitionRange: { min: 17000000, max: 40000000 }
      },
      {
        code: 'DHTM',
        name: 'Đại học Thương mại',
        shortName: 'TMU',
        description: 'Đại học Thương mại - trường đại học thương mại hàng đầu',
        address: { province: 'Hà Nội', district: 'Long Biên', detail: '79 Định Công' },
        website: 'https://tmu.edu.vn',
        admissionMethod: ['exam', 'combination'],
        tuitionRange: { min: 16000000, max: 38000000 }
      },
      {
        code: 'DHCN',
        name: 'Đại học Công nghiệp Hà Nội',
        shortName: 'HUI',
        description: 'Đại học Công nghiệp Hà Nội - đào tạo công nghiệp và công nghệ',
        address: { province: 'Hà Nội', district: 'Long Biên', detail: '398 Trần Đại Nghĩa' },
        website: 'https://haui.edu.vn',
        admissionMethod: ['exam', 'direct', 'combination'],
        tuitionRange: { min: 14000000, max: 32000000 }
      }
    ]);
    console.log('✅ Schools seeded');

    // Create sample majors
    const majors = await Major.create([
      { code: 'CNTT', name: 'Công nghệ thông tin', school: schools[0], group: 'CN', duration: 4, capacity: 500, minScore: 24 },
      { code: 'CNM', name: 'Cơ khí', school: schools[0], group: 'CN', duration: 4, capacity: 400, minScore: 20 },
      { code: 'DDT', name: 'Điện - Điện tử', school: schools[0], group: 'CN', duration: 4, capacity: 350, minScore: 21 },
      { code: 'KTPM', name: 'Kỹ thuật phần mềm', school: schools[0], group: 'CN', duration: 4, capacity: 300, minScore: 23 },
      { code: 'TTNT', name: 'Trí tuệ nhân tạo', school: schools[0], group: 'CN', duration: 4, capacity: 100, minScore: 26 },
      { code: 'LUAT', name: 'Luật', school: schools[1], group: 'Luật', duration: 4, capacity: 300, minScore: 22 },
      { code: 'KHMT', name: 'Khoa học máy tính', school: schools[1], group: 'CN', duration: 4, capacity: 200, minScore: 25 },
      { code: 'NN', name: 'Ngôn ngữ Anh', school: schools[1], group: 'NN', duration: 4, capacity: 250, minScore: 20 },
      { code: 'SPT', name: 'Sư phạm Toán', school: schools[2], group: 'SP', duration: 4, capacity: 200, minScore: 18 },
      { code: 'SPV', name: 'Sư phạm Văn', school: schools[2], group: 'SP', duration: 4, capacity: 200, minScore: 18 },
      { code: 'SPTA', name: 'Sư phạm Tiếng Anh', school: schools[2], group: 'SP', duration: 4, capacity: 150, minScore: 19 },
      { code: 'TC', name: 'Tài chính - Ngân hàng', school: schools[3], group: 'KT', duration: 4, capacity: 400, minScore: 21 },
      { code: 'KT', name: 'Kế toán', school: schools[3], group: 'KT', duration: 4, capacity: 450, minScore: 20 },
      { code: 'MKT', name: 'Marketing', school: schools[4], group: 'TM', duration: 4, capacity: 350, minScore: 19 },
      { code: 'QTKD', name: 'Quản trị kinh doanh', school: schools[4], group: 'TM', duration: 4, capacity: 400, minScore: 20 },
      { code: 'TMQT', name: 'Thương mại quốc tế', school: schools[4], group: 'TM', duration: 4, capacity: 300, minScore: 21 },
      { code: 'CNTT', name: 'Công nghệ thông tin', school: schools[5], group: 'CN', duration: 4, capacity: 500, minScore: 18 },
      { code: 'CK', name: 'Cơ khí động lực', school: schools[5], group: 'CN', duration: 4, capacity: 300, minScore: 16 }
    ]);
    console.log('✅ Majors seeded');

    // Create sample combinations
    const combinations = [];
    for (const major of majors) {
      const schoolId = major.school;
      
      // A00: Toán, Lý, Hóa
      combinations.push({
        code: `A00-${major.code}`,
        name: 'A00',
        subjects: ['Toán', 'Vật lý', 'Hóa học'],
        major: major._id,
        school: schoolId,
        minScore: major.minScore
      });
      
      // A01: Toán, Lý, Anh
      combinations.push({
        code: `A01-${major.code}`,
        name: 'A01',
        subjects: ['Toán', 'Vật lý', 'Tiếng Anh'],
        major: major._id,
        school: schoolId,
        minScore: major.minScore
      });
      
      // D01: Toán, Văn, Anh
      combinations.push({
        code: `D01-${major.code}`,
        name: 'D01',
        subjects: ['Toán', 'Ngữ văn', 'Tiếng Anh'],
        major: major._id,
        school: schoolId,
        minScore: major.minScore
      });
    }
    
    await Combination.create(combinations);
    console.log('✅ Combinations seeded');
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedData();
  
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎓 HỆ THỐNG TUYỂN SINH ĐẠI HỌC ONLINE                   ║
║                                                            ║
║   Server running on: http://localhost:${PORT}               ║
║   API endpoint: http://localhost:${PORT}/api                ║
║                                                            ║
║   Admin login: admin@university.edu.vn / admin123          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
};

startServer();

module.exports = app;
