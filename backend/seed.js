const mongoose = require('mongoose');
require('dotenv').config();

const School = require('./src/models/School');

const schools = [
  {
    code: 'PTIT',
    name: 'Học viện Công nghệ Bưu chính Viễn thông',
    shortName: 'PTIT',
    description: 'Học viện Công nghệ Bưu chính Viễn thông là trường đại học hàng đầu về công nghệ thông tin và viễn thông.',
    address: {
      province: 'Hà Nội',
      district: 'Quận Long Biên',
      detail: 'Km10, Đường Nguyễn Trãi, Phường Phú La, Quận Long Biên'
    },
    website: 'https://ptit.edu.vn',
    phone: '02438261246',
    email: 'ptit@ptit.edu.vn',
    admissionMethod: ['exam', 'combination'],
    tuitionRange: { min: 25000000, max: 35000000 },
    isActive: true,
    priority: 10
  },
  {
    code: 'UIT',
    name: 'Trường Đại học Công nghệ Thông tin',
    shortName: 'UIT',
    description: 'Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM',
    address: {
      province: 'TP.HCM',
      district: 'Quận Thủ Đức',
      detail: 'Khu phố 6, Phường Linh Trung, Quận Thủ Đức'
    },
    website: 'https://uit.edu.vn',
    phone: '02837244550',
    email: 'info@uit.edu.vn',
    admissionMethod: ['exam', 'combination', 'direct'],
    tuitionRange: { min: 20000000, max: 32000000 },
    isActive: true,
    priority: 9
  },
  {
    code: 'BKHN',
    name: 'Trường Đại học Bách khoa Hà Nội',
    shortName: 'HUST',
    description: 'Trường Đại học Bách khoa Hà Nội - ĐH Bách khoa Hà Nội',
    address: {
      province: 'Hà Nội',
      district: 'Quận Hai Bà Trưng',
      detail: 'Số 1 Đại Cồ Việt, Phường Bách Khoa, Quận Hai Bà Trưng'
    },
    website: 'https://hust.edu.vn',
    phone: '02438692120',
    email: 'info@hust.edu.vn',
    admissionMethod: ['exam', 'combination', 'direct'],
    tuitionRange: { min: 30000000, max: 50000000 },
    isActive: true,
    priority: 10
  },
  {
    code: 'VNU',
    name: 'Trường Đại học Quốc gia Hà Nội',
    shortName: 'VNU',
    description: 'Trường Đại học Quốc gia Hà Nội',
    address: {
      province: 'Hà Nội',
      district: 'Quận Cầu Giấy',
      detail: '19 Lê Thánh Tông, Phường Phan Chu Trinh, Quận Hoàn Kiếm'
    },
    website: 'https://vnu.edu.vn',
    phone: '02438584858',
    email: 'vnu@vnu.edu.vn',
    admissionMethod: ['exam', 'combination', 'direct'],
    tuitionRange: { min: 25000000, max: 45000000 },
    isActive: true,
    priority: 10
  },
  {
    code: 'DTU',
    name: 'Trường Đại học Duy Tân',
    shortName: 'DTU',
    description: 'Trường Đại học Duy Tân - Đà Nẵng',
    address: {
      province: 'Đà Nẵng',
      district: 'Quận Hải Châu',
      detail: '254 Nguyễn Văn Linh, Phường Thanh Khê Đông, Quận Thanh Khê'
    },
    website: 'https://duytan.edu.vn',
    phone: '02363656565',
    email: 'info@duytan.edu.vn',
    admissionMethod: ['exam', 'combination', 'direct'],
    tuitionRange: { min: 28000000, max: 42000000 },
    isActive: true,
    priority: 8
  },
  {
    code: 'HCMUS',
    name: 'Trường Đại học Khoa học Tự nhiên',
    shortName: 'HSCI',
    description: 'Trường Đại học Khoa học Tự nhiên - ĐHQG TP.HCM',
    address: {
      province: 'TP.HCM',
      district: 'Quận 5',
      detail: '227 Nguyễn Văn Cừ, Phường 4, Quận 5'
    },
    website: 'https://hcmus.edu.vn',
    phone: '02838353020',
    email: 'info@hcmus.edu.vn',
    admissionMethod: ['exam', 'combination'],
    tuitionRange: { min: 22000000, max: 35000000 },
    isActive: true,
    priority: 9
  }
];

async function seedSchools() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_admission');
    console.log('Connected to MongoDB');

    // Clear existing schools
    await School.deleteMany({});
    console.log('Cleared existing schools');

    // Insert new schools
    const result = await School.insertMany(schools);
    console.log(`Inserted ${result.length} schools`);

    result.forEach(school => {
      console.log(`- ${school.code}: ${school.name}`);
    });

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedSchools();
