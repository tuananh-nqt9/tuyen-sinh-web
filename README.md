# Hệ thống Quản lý Tuyển sinh Đại học Trực tuyến

## Giới thiệu
Hệ thống đăng ký xét tuyển đại học trực tuyến với tích hợp AI chatbot và xác minh tài liệu tự động.

## Công nghệ sử dụng

### Frontend
- **UmiJS** - Framework React enterprise
- **React 18** - Thư viện UI
- **TypeScript** - Ngôn ngữ lập trình
- **Ant Design 5** - Thư viện UI component
- **Recharts** - Biểu đồ thống kê
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Xác thực
- **Nodemailer** - Gửi email
- **Multer** - Upload file

## Tính năng chính

### Thí sinh
- Đăng ký/đăng nhập tài khoản
- Chọn trường, ngành, tổ hợp xét tuyển
- Nhập thông tin cá nhân, điểm thi
- Upload tài liệu minh chứng (PDF/JPEG/PNG)
- Theo dõi trạng thái hồ sơ
- Chat với AI chatbot để được hỗ trợ
- Tra cứu kết quả xét tuyển

### Quản trị viên
- Quản lý danh sách trường/ngành/tổ hợp
- Duyệt và quản lý hồ sơ thí sinh
- Gửi thông báo qua email
- Dashboard thống kê chi tiết
- Xem và xác minh tài liệu

## Cài đặt

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Cấu trúc thư mục

```
├── frontend/              # UmiJS frontend
│   ├── src/
│   │   ├── pages/        # Trang web
│   │   ├── components/   # Component
│   │   ├── services/     # API calls
│   │   ├── models/       # Type definitions
│   │   └── utils/        # Tiện ích
│   └── package.json
│
└── backend/               # Node.js API
    ├── src/
    │   ├── controllers/  # Logic xử lý
    │   ├── models/       # Schema DB
    │   ├── routes/       # API routes
    │   └── middleware/   # Auth middleware
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user

### Schools & Majors
- `GET /api/schools` - Danh sách trường
- `GET /api/majors` - Danh sách ngành
- `GET /api/combinations` - Danh sách tổ hợp

### Applications
- `POST /api/applications` - Tạo hồ sơ
- `GET /api/applications` - Danh sách hồ sơ
- `PUT /api/applications/:id/status` - Cập nhật trạng thái

## Tác giả
Đồ án môn Lập trình Web
